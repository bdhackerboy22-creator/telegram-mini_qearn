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
      required: true, // Amount in Coins
    },
    bdtAmount: {
      type: Number,
      default: 0, // Amount in BDT (1 Coin = 0.1 TK)
    },
    status: {
      type: String,
      enum: ["completed", "pending", "rejected"],
      default: "completed",
      index: true,
    },
    method: {
      type: String,
      default: "recharge", // mobile recharge
    },
    operator: {
      type: String,
      default: "", // Grameenphone, Banglalink, Robi, Airtel, Teletalk
    },
    simType: {
      type: String,
      enum: ["prepaid", "postpaid"],
      default: "prepaid",
    },
    accountNumber: {
      type: String,
      default: "", // Mobile Number e.g. 017XXXXXXXX
    },
    trxId: {
      type: String,
      default: "", // Transaction ID provided by Admin when marked Paid
    },
    rejectReason: {
      type: String,
      default: "", // Note provided by Admin if rejected
    },
  },
  { timestamps: true }
);

export default mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);
