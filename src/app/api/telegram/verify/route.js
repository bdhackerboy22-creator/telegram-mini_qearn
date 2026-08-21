import { NextResponse } from "next/server";
import { verifyTelegramWebAppData } from "@/lib/telegram";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import { broadcastActivity } from "@/lib/telegramBroadcast";

const WELCOME_BONUS = 50;
const REFERRAL_REWARD = 100;

export async function POST(request) {
  try {
    const { initData, startParam } = await request.json();
    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    let telegramUser = null;

    if (initData && botToken) {
      telegramUser = verifyTelegramWebAppData(initData, botToken);
    }

    // In local development or fallback without bot token
    if (!telegramUser && process.env.NODE_ENV !== "production") {
      const urlParams = new URLSearchParams(initData || "");
      const rawUser = urlParams.get("user");
      if (rawUser) {
        try {
          telegramUser = JSON.parse(rawUser);
        } catch (_) {}
      }
    }

    if (!telegramUser || !telegramUser.id) {
      return NextResponse.json(
        { success: false, error: "Invalid or missing Telegram user authentication" },
        { status: 401 }
      );
    }

    await connectDB();

    const telegramId = String(telegramUser.id);
    let user = await User.findOne({ telegramId });

    if (!user) {
      let referrerId = null;
      if (startParam) {
        const cleanRef = String(startParam).replace(/^ref_/, "").trim();
        if (cleanRef && cleanRef !== telegramId) {
          referrerId = cleanRef;
        }
      }

      user = await User.create({
        telegramId,
        firstName: telegramUser.first_name || "",
        lastName: telegramUser.last_name || "",
        username: telegramUser.username || "",
        balance: WELCOME_BONUS,
        totalEarned: WELCOME_BONUS,
        referredBy: referrerId,
        isReferralRewardPaid: false,
      });

      // Record welcome bonus transaction
      await Transaction.create({
        telegramId,
        title: "Welcome Bonus",
        type: "earn",
        amount: WELCOME_BONUS,
        status: "completed",
      });

      // Broadcast new member activity to @Qearn_Activities
      broadcastActivity({
        badge: "👋",
        title: "New User Joined",
        description: `<b>${telegramUser.first_name || "New Earner"}</b> joined QEarn Mini App!`,
        details: {
          "User ID": `<code>${telegramId}</code>`,
          Bonus: "+50 Coins Welcome Gift",
          "Referred By": referrerId ? `<code>${referrerId}</code>` : "Direct Join",
        },
      }).catch(console.error);
    } else {
      user.firstName = telegramUser.first_name || user.firstName;
      user.lastName = telegramUser.last_name || user.lastName;
      user.username = telegramUser.username || user.username;
      await user.save();
    }

    // 1. Total Referrals Count
    const totalReferrals = await User.countDocuments({ referredBy: telegramId });

    // 2. Success Referrals Count (Must have completed ALL 4 tasks: 3 channels + 1 approved question)
    const successReferrals = await User.countDocuments({
      referredBy: telegramId,
      hasJoinedMainChannel: true,
      hasJoinedPaymentChannel: true,
      hasJoinedActivitiesChannel: true,
      hasApprovedQuestionUpload: true,
    });

    // Fetch user transactions
    const transactions = await Transaction.find({ telegramId })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    return NextResponse.json({
      success: true,
      user: {
        id: user.telegramId,
        first_name: user.firstName,
        last_name: user.lastName,
        username: user.username,
        balance: user.balance,
        totalEarned: user.totalEarned,
        totalWithdrawn: user.totalWithdrawn,
        adsWatchedCount: user.adsWatchedCount,
        hasJoinedMainChannel: Boolean(user.hasJoinedMainChannel),
        hasJoinedPaymentChannel: Boolean(user.hasJoinedPaymentChannel),
        hasJoinedActivitiesChannel: Boolean(user.hasJoinedActivitiesChannel),
        hasApprovedQuestionUpload: Boolean(user.hasApprovedQuestionUpload),
        hasJoinedChannel:
          Boolean(user.hasJoinedMainChannel) &&
          Boolean(user.hasJoinedPaymentChannel) &&
          Boolean(user.hasJoinedActivitiesChannel),
        lastDailyRewardDate: user.lastDailyRewardDate,
        totalReferrals,
        successReferrals,
        referralBonusEarned: successReferrals * REFERRAL_REWARD,
      },
      transactions: transactions.map((t) => ({
        id: t._id,
        title: t.title,
        type: t.type,
        amount: t.amount,
        status: t.status,
        method: t.method,
        accountNumber: t.accountNumber,
        operator: t.operator,
        simType: t.simType,
        trxId: t.trxId,
        rejectReason: t.rejectReason,
        time: new Date(t.createdAt).toLocaleString([], {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      })),
    });
  } catch (error) {
    console.error("Auth verify error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
