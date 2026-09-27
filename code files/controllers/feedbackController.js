import AnswerFeedback from "../models/AnswerFeedback.js";

export const createFeedback = async (req, res, next) => {
  try {
    const feedback = await AnswerFeedback.create({
      faqId: req.body.faqId,
      userId: req.user._id,
      helpful: req.body.helpful,
      comment: req.body.comment
    });

    res.status(201).json({
      success: true,
      feedback
    });
  } catch (error) {
    next(error);
  }
};

export const getFeedback = async (req, res, next) => {
  try {
    const feedback = await AnswerFeedback.find()
      .populate("faqId", "question")
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: feedback.length,
      feedback
    });
  } catch (error) {
    next(error);
  }
};
