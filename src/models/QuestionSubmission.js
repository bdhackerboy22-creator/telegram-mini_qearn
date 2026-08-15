import mongoose from "mongoose";

const QuestionSubmissionSchema = new mongoose.Schema(
  {
    telegramId: {
      type: String,
      required: true,
      index: true,
    },
    subjectName: {
      type: String,
      required: true,
    },
    subjectCode: {
      type: String,
      required: true,
      index: true,
    },
    subjectDate: {
      type: String, // Exam/Schedule Date from API 1 (e.g. "1/4/2026")
      default: "",
    },
    imageUrl: {
      type: String,
      required: true, // Cloudinary image URL
    },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
      index: true,
    },
    rewardAmount: {
      type: Number,
      default: 50,
    },
    rejectReason: {
      type: String,
      default: "", // Admin note/reason when rejected
    },
  },
  { timestamps: true }
);

export default mongoose.models.QuestionSubmission ||
  mongoose.model("QuestionSubmission", QuestionSubmissionSchema);
