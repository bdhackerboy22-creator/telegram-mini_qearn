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
    },
    imageBase64: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    rewardAmount: {
      type: Number,
      default: 50,
    },
  },
  { timestamps: true }
);

export default mongoose.models.QuestionSubmission ||
  mongoose.model("QuestionSubmission", QuestionSubmissionSchema);
