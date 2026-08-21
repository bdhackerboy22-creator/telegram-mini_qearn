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
    // The 4 Required Referral Tasks:
    // Task 1: Main Official Channel (@qearnofficial)
    hasJoinedMainChannel: {
      type: Boolean,
      default: false,
      index: true,
    },
    // Task 2: Payment Proof Channel (@qearnofficialpay)
    hasJoinedPaymentChannel: {
      type: Boolean,
      default: false,
      index: true,
    },
    // Task 3: Community Activities Channel (@qearnofficialactivities)
    hasJoinedActivitiesChannel: {
      type: Boolean,
      default: false,
      index: true,
    },
    // Task 4: Approved Question Upload (Admin Verified)
    hasApprovedQuestionUpload: {
      type: Boolean,
      default: false,
      index: true,
    },
    // Backward compatibility helper
    hasJoinedChannel: {
      type: Boolean,
      default: false,
    },
    isReferralRewardPaid: {
      type: Boolean,
      default: false, // Tracks if referrer has received +100 reward (when ALL 4 tasks are complete)
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
