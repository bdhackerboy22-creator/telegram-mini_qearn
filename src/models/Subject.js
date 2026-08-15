import mongoose from "mongoose";

const SubjectSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true, // e.g. MATH-101
      index: true,
    },
    name: {
      type: String,
      required: true, // e.g. Higher Mathematics Part I
    },
    department: {
      type: String,
      default: "General",
    },
    icon: {
      type: String,
      default: "📚",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Subject ||
  mongoose.model("Subject", SubjectSchema);
