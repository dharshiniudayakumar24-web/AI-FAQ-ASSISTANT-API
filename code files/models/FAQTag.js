import mongoose from "mongoose";

const faqTagSchema = new mongoose.Schema(
  {
    faqId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FAQ",
      required: true
    },
    tagId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tag",
      required: true
    }
  },
  { timestamps: true }
);

faqTagSchema.index({ faqId: 1, tagId: 1 }, { unique: true });

export default mongoose.model("FAQTag", faqTagSchema);
