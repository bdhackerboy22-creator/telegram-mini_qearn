import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import { broadcastActivity } from "@/lib/telegramBroadcast";

const CHANNEL_REWARD_COINS = 50;
const REFERRAL_BONUS_COINS = 100;

// Channels config
const CHANNELS = {
  main: {
    key: "hasJoinedMainChannel",
    username: process.env.TELEGRAM_CHANNEL_MAIN || "@qearnofficial",
    link: process.env.TELEGRAM_CHANNEL_MAIN_LINK || "https://t.me/qearnofficial",
    title: "Official Main Channel",
  },
  payment: {
    key: "hasJoinedPaymentChannel",
    username: process.env.TELEGRAM_CHANNEL_PAYMENT || "@qearnofficialpay",
    link: process.env.TELEGRAM_CHANNEL_PAYMENT_LINK || "https://t.me/qearnofficialpay",
    title: "Qearn Payment Channel",
  },
  activities: {
    key: "hasJoinedActivitiesChannel",
    username: process.env.TELEGRAM_CHANNEL_ACTIVITIES || "@qearnofficialactivities",
    link: process.env.TELEGRAM_CHANNEL_ACTIVITIES_LINK || "https://t.me/qearnofficialactivities",
    title: "Qearn Activities Channel",
  },
};

export async function POST(request) {
  try {
    const { telegramId, channelType } = await request.json();
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    const channelConfig = CHANNELS[channelType] || CHANNELS.main;
    const targetChannelUsername = channelConfig.username;
    const targetChannelLink = channelConfig.link;
    const userFieldKey = channelConfig.key;

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

    // 1. Anti-Cheat: Check if user already claimed this specific channel task
    if (user[userFieldKey]) {
      return NextResponse.json(
        {
          success: false,
          error: `You have already joined and verified ${channelConfig.title}!`,
        },
        { status: 400 }
      );
    }

    // 2. Official Telegram Bot API Verification (getChatMember)
    let isMember = false;
    if (botToken && targetChannelUsername && targetChannelUsername.startsWith("@")) {
      try {
        const tgApiUrl = `https://api.telegram.org/bot${botToken}/getChatMember?chat_id=${encodeURIComponent(
          targetChannelUsername
        )}&user_id=${encodeURIComponent(telegramId)}`;

        const tgRes = await fetch(tgApiUrl);
        const tgData = await tgRes.json();

        if (tgData.ok && tgData.result) {
          const status = tgData.result.status;
          if (["creator", "administrator", "member", "restricted"].includes(status)) {
            isMember = true;
          }
        } else {
          console.warn(`Telegram getChatMember for ${targetChannelUsername}:`, tgData);
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
        error: `Verification failed: You haven't joined ${targetChannelUsername} yet! Please join first and click Check.`,
        channelLink: targetChannelLink,
      });
    }

    // 3. User verified successfully -> Credit +50 Coins to user
    user.balance += CHANNEL_REWARD_COINS;
    user.totalEarned += CHANNEL_REWARD_COINS;
    user[userFieldKey] = true;

    // Backward compatibility
    if (user.hasJoinedMainChannel && user.hasJoinedPaymentChannel && user.hasJoinedActivitiesChannel) {
      user.hasJoinedChannel = true;
    }

    await user.save();

    // Record user task transaction
    const transaction = await Transaction.create({
      telegramId: String(telegramId),
      title: `Task: Joined ${channelConfig.title}`,
      type: "earn",
      amount: CHANNEL_REWARD_COINS,
      status: "completed",
    });

    // Broadcast activity to @Qearn_Activities channel
    broadcastActivity({
      badge: "📢",
      title: "New Task Completed",
      description: `User <b>${user.firstName || "Member"}</b> completed <b>${channelConfig.title}</b> task!`,
      details: {
        Reward: `+${CHANNEL_REWARD_COINS} Coins`,
        "User ID": `<code>${telegramId}</code>`,
      },
    }).catch(console.error);

    // 4. SUCCESS REFERRAL TRIGGER (All 4 Tasks Requirement):
    // Check if user has now completed ALL 4 REQUIRED TASKS (3 channels + 1 approved question):
    const hasCompletedAll4 =
      Boolean(user.hasJoinedMainChannel) &&
      Boolean(user.hasJoinedPaymentChannel) &&
      Boolean(user.hasJoinedActivitiesChannel) &&
      Boolean(user.hasApprovedQuestionUpload);

    let referralUnlocked = false;

    if (hasCompletedAll4 && user.referredBy && !user.isReferralRewardPaid) {
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
          title: `Successful Referral Reward: ${user.firstName || "Friend"} completed all 4 tasks (@${user.username || user.telegramId})`,
          type: "earn",
          amount: REFERRAL_BONUS_COINS,
          status: "completed",
        });

        referralUnlocked = true;

        // Broadcast to @Qearn_Activities
        broadcastActivity({
          badge: "🎉",
          title: "Referral Success Unlocked",
          description: `User <b>${user.firstName || "Friend"}</b> completed all 4 tasks (3 channels + approved question)! Referrer rewarded!`,
          details: {
            "Referrer ID": `<code>${user.referredBy}</code>`,
            "Bonus Awarded": `+${REFERRAL_BONUS_COINS} Coins (৳10 TK)`,
          },
        }).catch(console.error);
      }
    }

    return NextResponse.json({
      success: true,
      isMember: true,
      channelType,
      balance: user.balance,
      totalEarned: user.totalEarned,
      hasJoinedMainChannel: Boolean(user.hasJoinedMainChannel),
      hasJoinedPaymentChannel: Boolean(user.hasJoinedPaymentChannel),
      hasJoinedActivitiesChannel: Boolean(user.hasJoinedActivitiesChannel),
      hasApprovedQuestionUpload: Boolean(user.hasApprovedQuestionUpload),
      reward: CHANNEL_REWARD_COINS,
      referralUnlocked,
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
