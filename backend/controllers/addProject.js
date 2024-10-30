// Import necessary models
import projectSchema from "../models/ProjectModel.js";
import formDataSchema from "../models/formDataModel.js";
import cloudinary from 'cloudinary';
import CloudinaryStorage from 'multer'
import multer from 'multer';


// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: {
//     folder: 'CloudinaryDemo',
//     allowedFormats: ['jpeg', 'png', 'jpg'],
//   }
// });


export const addProject = async (req, res) => {
  try {
    cloudinary.v2.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API,
      api_secret: process.env.CLOUDINARY_SECRET,
      secure: true,
    });

    const { title, description, lead, githubUrl } = req.body;
    const images = req.files;
    const admin = req.user.admin;
    if (!admin) {
      return res.status(401).json({ message: 'unauthorized' });
    }
    if (!title || !description) {
      return res.status(406).json({ message: 'check title and description' });
    }

    // Find the lead by email
    const leadUser = await formDataSchema.findOne({ email: lead });
    if (!leadUser) {
      return res.status(404).json({ message: 'Lead user not found' });
    }

    console.log('Starting image uploads...');
    const photoUrls = await Promise.all(
      images.map(file => {
        console.log('Uploading file:', file.originalname);
        return new Promise((resolve, reject) => {
          cloudinary.v2.uploader.upload_stream(
            { folder: "projects" },
            (error, result) => {
              if (error) {
                console.error('Cloudinary upload error:', error);
                reject(error);
              } else {
                console.log('Uploaded:', result.secure_url);
                resolve(result.secure_url);
              }
            }
          ).end(file.buffer);
        });
      })
    );
    console.log('Photo URLs:', photoUrls);

    // Create a new project with ObjectIds
    const newProject = new projectSchema({
      title,
      description,
      lead: leadUser._id,
      contributors: [],
      githubUrl,
      images: photoUrls
    });

    // Save the project to the database
    const savedProject = await newProject.save();
    res.status(201).json({ message: 'Project saved successfully', project: savedProject });
  } catch (error) {
    console.error('Error saving project:', error);
    res.status(500).json({ message: 'Error saving project', error: error.message });
  }
};
