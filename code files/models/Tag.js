import mongoose from "mongoose";

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 50
    }
  },
  { timestamps: true }
);

export default mongoose.model("Tag", tagSchema);
