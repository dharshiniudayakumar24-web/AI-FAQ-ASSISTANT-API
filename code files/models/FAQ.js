import mongoose from "mongoose";

const faqSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },
    question: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 500
    },
    answer: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 5000
    },
    tags: {
      type: [String],
      default: []
    },
    isPublic: {
      type: Boolean,
      default: false
    },
    views: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  { timestamps: true }
);

faqSchema.index({
  question: "text",
  answer: "text",
  tags: "text"
});

export default mongoose.model("FAQ", faqSchema);
