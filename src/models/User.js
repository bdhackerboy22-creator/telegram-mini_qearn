import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    telegramId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    firstName: {
      type: String,
      default: "",
    },
    lastName: {
      type: String,
      default: "",
    },
    username: {
      type: String,
      default: "",
    },
    balance: {
      type: Number,
      default: 50, // Welcome signup bonus: 50 Coins
    },
    totalEarned: {
      type: Number,
      default: 50,
    },
    totalWithdrawn: {
      type: Number,
      default: 0,
    },
    adsWatchedCount: {
      type: Number,
      default: 0,
    },
    lastDailyRewardDate: {
      type: Date,
      default: null,
    },
    lastAdWatchedTime: {
      type: Date,
      default: null,
    },
    referredBy: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
