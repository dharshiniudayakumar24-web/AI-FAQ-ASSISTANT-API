import mongoose from "mongoose";

const answerFeedbackSchema = new mongoose.Schema(
  {
    faqId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FAQ",
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    helpful: {
      type: Boolean,
      required: true
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 500
    }
  },
  { timestamps: true }
);

export default mongoose.model("AnswerFeedback", answerFeedbackSchema);
