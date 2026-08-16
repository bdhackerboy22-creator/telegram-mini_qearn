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
    // 3 Required Channels
    hasJoinedMainChannel: {
      type: Boolean,
      default: false, // @qearnofficial
      index: true,
    },
    hasJoinedPaymentChannel: {
      type: Boolean,
      default: false, // @Qearn_Payment
      index: true,
    },
    hasJoinedActivitiesChannel: {
      type: Boolean,
      default: false, // @Qearn_Activities
      index: true,
    },
    // Backward compatibility helper
    hasJoinedChannel: {
      type: Boolean,
      default: false,
    },
    isReferralRewardPaid: {
      type: Boolean,
      default: false, // Tracks if referrer has received +100 reward (when all 3 channels are verified)
      index: true,
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
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
