import mongoose from "mongoose";

const aiGeneratedFAQSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    prompt: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    question: {
      type: String,
      required: true,
      trim: true
    },
    answer: {
      type: String,
      required: true,
      trim: true
    },
    topicSuggestions: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: ["generated", "saved"],
      default: "generated"
    },
    savedFaqId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FAQ",
      default: null
    }
  },
  { timestamps: true }
);

export default mongoose.model("AIGeneratedFAQ", aiGeneratedFAQSchema);
