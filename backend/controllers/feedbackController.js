import Feedback from "../models/Feedback.js";

export const submitFeedback = async (req, res) => {
  const { performanceRating, uiRating, feedback } = req.body;
  const user = req.user._id;
  try {
    const submitted_feedback = new Feedback({
        performanceRating,
        uiRating,
        feedback
    });
    if (user !== '') submitted_feedback.user = user;
    const savedFeedback = await submitted_feedback.save();
    res.status(201).json({ message: 'Feedback saved successfully', savedFeedback });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error saving Feedback', error });
  }
}

export const getFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('user', 'name email phoneNumber createdAt'); // Add the 'name' field if it's required

    res.status(200).json(feedbacks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving feedback', error });
  }
};
