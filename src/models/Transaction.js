import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    telegramId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["earn", "withdraw"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["completed", "pending", "rejected"],
      default: "completed",
    },
    method: {
      type: String,
      default: "", // bkash, nagad, ton etc.
    },
    accountNumber: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);
