import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import { MONETAG_CONFIG } from "@/lib/monetag";

export async function POST(request) {
  try {
    const { telegramId, taskType } = await request.json();

    if (!telegramId || !taskType) {
      return NextResponse.json(
        { success: false, error: "Missing telegramId or taskType" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ telegramId: String(telegramId) });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    let rewardAmount = 0;
    let taskTitle = "";

    if (taskType === "monetag_ad") {
      // Cooldown validation on server side
      const now = new Date();
      if (user.lastAdWatchedTime) {
        const diffSeconds = (now - new Date(user.lastAdWatchedTime)) / 1000;
        if (diffSeconds < MONETAG_CONFIG.AD_COOLDOWN_SECONDS - 2) {
          return NextResponse.json(
            {
              success: false,
              error: `Please wait ${Math.ceil(
                MONETAG_CONFIG.AD_COOLDOWN_SECONDS - diffSeconds
              )} seconds before watching another ad.`,
            },
            { status: 429 }
          );
        }
      }

      rewardAmount = MONETAG_CONFIG.REWARD_PER_AD;
      taskTitle = "Monetag Rewarded Ad";
      user.adsWatchedCount += 1;
      user.lastAdWatchedTime = now;
    } else if (taskType === "daily_checkin") {
      const now = new Date();
      if (user.lastDailyRewardDate) {
        const lastDate = new Date(user.lastDailyRewardDate);
        const isSameDay =
          now.getFullYear() === lastDate.getFullYear() &&
          now.getMonth() === lastDate.getMonth() &&
          now.getDate() === lastDate.getDate();

        if (isSameDay) {
          return NextResponse.json(
            { success: false, error: "Daily reward already claimed today!" },
            { status: 400 }
          );
        }
      }

      rewardAmount = MONETAG_CONFIG.DAILY_REWARD;
      taskTitle = "Daily Check-in Bonus";
      user.lastDailyRewardDate = now;
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid task type" },
        { status: 400 }
      );
    }

    // Update user balance
    user.balance += rewardAmount;
    user.totalEarned += rewardAmount;
    await user.save();

    // Record transaction
    const transaction = await Transaction.create({
      telegramId: String(telegramId),
      title: taskTitle,
      type: "earn",
      amount: rewardAmount,
      status: "completed",
    });

    return NextResponse.json({
      success: true,
      reward: rewardAmount,
      balance: user.balance,
      totalEarned: user.totalEarned,
      adsWatchedCount: user.adsWatchedCount,
      transaction: {
        id: transaction._id,
        title: transaction.title,
        type: transaction.type,
        amount: transaction.amount,
        time: new Date(transaction.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    });
  } catch (error) {
    console.error("Task reward error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
