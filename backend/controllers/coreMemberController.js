import CoreMember from '../models/CoreMember.js';
import { uploadFilesToCloudinary, deleteFromCloudinary } from '../utils/cdnUploader.js';

export const getCoreMembers = async (req, res) => {
  try {
    const members = await CoreMember.find().sort({ "order": 1 });
    res.status(200).json({ members });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching members', error });
  }
};

export const addCoreMember = async (req, res) => {
  try {
    const { name, designation, year, email, linkedinUrl, subPosition, order } = req.body;
    const images = req.files;

    // image is compulsory for core members when adding
    if (!images || images.length === 0) {
      return res.status(400).json({ message: 'Photo is required for core members' });
    }

    // determine final order: use provided order if valid, else append as last
    let newOrder = null;
    if (typeof order !== 'undefined' && order !== null && order !== '') {
      const parsed = parseInt(order, 10);
      if (!isNaN(parsed) && parsed > 0) newOrder = parsed;
    }

    // find current max order for the given team/year
  const maxExisting = await CoreMember.findOne({ subPosition, year }).sort({ order: -1 });
    const suggestedOrder = maxExisting && typeof maxExisting.order === 'number' ? maxExisting.order + 1 : 1;
  if (newOrder === null) newOrder = suggestedOrder;
  // clamp large orders to append position to keep ordering contiguous
  if (newOrder > suggestedOrder) newOrder = suggestedOrder;

    // shift existing members with order >= newOrder within same team & year
    await CoreMember.updateMany(
      { subPosition: subPosition, year: year, order: { $gte: newOrder } },
      { $inc: { order: 1 } }
    );

    let photoUrls;
    try {
      photoUrls = await uploadFilesToCloudinary(images, 'Algorithm');
    } catch (error) {
      console.log('Error adding member:', error);
      return res.status(500).json({ message: 'Failed to upload images', error: error.message });
    }

    const imagePath = photoUrls[0].split('/').slice(-2).join('/');
    const newMember = new CoreMember({
      name,
      designation,
      year,
      email,
      order: newOrder,
      linkedinUrl: linkedinUrl,
      imageUrl: imagePath,
      subPosition
    });
    await newMember.save();
    res.status(201).json({ message: 'Member added successfully', member: newMember });
  } catch (error) {
    console.log('Error adding member:', error);
    res.status(500).json({ message: 'Error adding member', error });
  }
};

export const updateCoreMember = async (req, res) => {
  try {
    const { id, name, designation, year, email, linkedinUrl, subPosition, order } = req.body;
    const images = req.files;

    if (!id) return res.status(400).json({ message: 'Member id required' });

    const existing = await CoreMember.findById(id);
    if (!existing) return res.status(404).json({ message: 'Member not found' });

    // parse new order; if not provided, keep existing order
    let newOrder = existing.order;
    if (typeof order !== 'undefined' && order !== null && order !== '') {
      const parsed = parseInt(order, 10);
      if (!isNaN(parsed) && parsed > 0) newOrder = parsed;
    }

    // clamp newOrder to valid bounds for this team/year (1..count)
    const countForTeamYear = await CoreMember.countDocuments({ subPosition: subPosition || existing.subPosition, year: year || existing.year });
    const maxAllowed = countForTeamYear || 1;
    if (newOrder > maxAllowed) newOrder = maxAllowed;
    if (newOrder < 1) newOrder = 1;

    // if order changed, rebalance within same team & year
    const oldOrder = existing.order;
    if (typeof oldOrder === 'number' && typeof newOrder === 'number' && newOrder !== oldOrder) {
      if (newOrder < oldOrder) {
        // shift members with order >= newOrder and < oldOrder up by +1
        await CoreMember.updateMany(
          { subPosition: subPosition || existing.subPosition, year: year || existing.year, order: { $gte: newOrder, $lt: oldOrder } },
          { $inc: { order: 1 } }
        );
      } else if (newOrder > oldOrder) {
        // shift members with order <= newOrder and > oldOrder down by -1
        await CoreMember.updateMany(
          { subPosition: subPosition || existing.subPosition, year: year || existing.year, order: { $gt: oldOrder, $lte: newOrder } },
          { $inc: { order: -1 } }
        );
      }
    }

    const update = {
      name: typeof name !== 'undefined' ? name : existing.name,
      designation: typeof designation !== 'undefined' ? designation : existing.designation,
      year: typeof year !== 'undefined' ? year : existing.year,
      email: typeof email !== 'undefined' ? email : existing.email,
      order: newOrder,
      linkedinUrl: typeof linkedinUrl !== 'undefined' ? linkedinUrl : existing.linkedinUrl,
      subPosition: typeof subPosition !== 'undefined' ? subPosition : existing.subPosition,
    };

    if (images && images.length > 0) {
      try {
        const photoUrls = await uploadFilesToCloudinary(images, 'Algorithm');
        update.imageUrl = photoUrls[0].split('/').slice(-2).join('/');
      } catch (err) {
        console.log('Error uploading update images:', err);
        return res.status(500).json({ message: 'Failed to upload images', error: err.message });
      }
    } else {
      // ensure image exists (image is compulsory for core members)
      if (!existing.imageUrl) {
        return res.status(400).json({ message: 'Photo is required for core members' });
      }
    }

    const updated = await CoreMember.findByIdAndUpdate(id, update, { new: true });
    if (!updated) return res.status(404).json({ message: 'Member not found' });
    res.status(200).json({ message: 'Member updated successfully', member: updated });
  } catch (error) {
    console.log('Error updating member:', error);
    res.status(500).json({ message: 'Error updating member', error });
  }
};

export const deleteCoreMember = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ message: 'Member id required' });

    const member = await CoreMember.findById(id);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    const { subPosition, year, order } = member;

    // attempt to delete the member's image from the CDN (best-effort)
    try {
      if (member.imageUrl) {
        // pass as array to deleteFromCloudinary (it expects an array)
        await deleteFromCloudinary([member.imageUrl]);
      }
    } catch (cdnErr) {
      console.error('Error deleting image from CDN:', cdnErr);
      // continue with deletion even if CDN deletion fails
    }

    // delete member
    await CoreMember.findByIdAndDelete(id);

    // rebalance orders: decrement order for members in same team & year with order > deleted order
    if (typeof order === 'number') {
      await CoreMember.updateMany(
        { subPosition: subPosition, year: year, order: { $gt: order } },
        { $inc: { order: -1 } }
      );
    }

    res.status(200).json({ message: 'Member deleted and orders updated' });
  } catch (error) {
    console.log('Error deleting member:', error);
    res.status(500).json({ message: 'Error deleting member', error });
  }
};