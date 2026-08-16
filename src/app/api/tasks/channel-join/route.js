import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Transaction from "@/models/Transaction";

const CHANNEL_REWARD_COINS = 50;
const REFERRAL_BONUS_COINS = 100; // Reward given to referrer when referred user completes channel verification

export async function POST(request) {
  try {
    const { telegramId } = await request.json();
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const channelUsername = process.env.TELEGRAM_CHANNEL_USERNAME || "@QearnOfficial";
    const channelLink = process.env.TELEGRAM_CHANNEL_LINK || "https://t.me/QearnOfficial";

    if (!telegramId) {
      return NextResponse.json(
        { success: false, error: "Missing Telegram ID" },
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

    // 1. Anti-Cheat: Check if user already claimed this task
    if (user.hasJoinedChannel) {
      return NextResponse.json(
        {
          success: false,
          error: "You have already completed this task and received +50 Coins!",
        },
        { status: 400 }
      );
    }

    // 2. Official Telegram Bot API Verification (getChatMember)
    let isMember = false;
    if (botToken && channelUsername && channelUsername.startsWith("@")) {
      try {
        const tgApiUrl = `https://api.telegram.org/bot${botToken}/getChatMember?chat_id=${encodeURIComponent(
          channelUsername
        )}&user_id=${encodeURIComponent(telegramId)}`;

        const tgRes = await fetch(tgApiUrl);
        const tgData = await tgRes.json();

        if (tgData.ok && tgData.result) {
          const status = tgData.result.status;
          // Valid membership statuses: creator, administrator, member, restricted
          if (["creator", "administrator", "member", "restricted"].includes(status)) {
            isMember = true;
          }
        } else {
          console.warn("Telegram getChatMember API response:", tgData);
          if (tgData.description && tgData.description.includes("chat not found")) {
            console.error("Bot is not an Admin in channel:", channelUsername);
          }
        }
      } catch (tgErr) {
        console.error("Telegram getChatMember error:", tgErr);
      }
    } else {
      if (process.env.NODE_ENV !== "production") {
        isMember = true;
      }
    }

    if (!isMember) {
      return NextResponse.json({
        success: false,
        isMember: false,
        error: "Verification failed: You haven't joined the official channel yet! Please join first and click Check.",
        channelLink,
      });
    }

    // 3. User verified successfully -> Credit +50 Coins to user
    user.balance += CHANNEL_REWARD_COINS;
    user.totalEarned += CHANNEL_REWARD_COINS;
    user.hasJoinedChannel = true;
    await user.save();

    // Record user task transaction
    const transaction = await Transaction.create({
      telegramId: String(telegramId),
      title: "Task: Joined Official Channel",
      type: "earn",
      amount: CHANNEL_REWARD_COINS,
      status: "completed",
    });

    // 4. SUCCESS REFERRAL TRIGGER:
    // If this user was referred by someone and referral reward has not been paid yet:
    // Convert to SUCCESS REFERRAL and credit +100 Coins to Referrer!
    if (user.referredBy && !user.isReferralRewardPaid) {
      const referrerUser = await User.findOne({ telegramId: user.referredBy });
      if (referrerUser) {
        referrerUser.balance += REFERRAL_BONUS_COINS;
        referrerUser.totalEarned += REFERRAL_BONUS_COINS;
        await referrerUser.save();

        user.isReferralRewardPaid = true;
        await user.save();

        // Create transaction for Referrer
        await Transaction.create({
          telegramId: user.referredBy,
          title: `Successful Referral Reward: ${user.firstName || "Friend"} verified channel (@${user.username || user.telegramId})`,
          type: "earn",
          amount: REFERRAL_BONUS_COINS,
          status: "completed",
        });
      }
    }

    return NextResponse.json({
      success: true,
      isMember: true,
      balance: user.balance,
      totalEarned: user.totalEarned,
      hasJoinedChannel: true,
      reward: CHANNEL_REWARD_COINS,
      message: `🎉 Verified! +${CHANNEL_REWARD_COINS} Coins credited to your balance!`,
      transaction: {
        id: transaction._id,
        title: transaction.title,
        type: transaction.type,
        amount: transaction.amount,
        status: transaction.status,
        time: new Date(transaction.createdAt).toLocaleString([], {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    });
  } catch (error) {
    console.error("Channel join verify error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
