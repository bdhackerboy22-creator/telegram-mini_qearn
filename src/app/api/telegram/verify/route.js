import { NextResponse } from "next/server";
import { verifyTelegramWebAppData } from "@/lib/telegram";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Transaction from "@/models/Transaction";

const WELCOME_BONUS = 50;
const REFERRAL_REWARD = 100; // 100 Coins per SUCCESSFUL referral

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
      // Determine referrer from startParam (e.g. ref_123456 or 123456)
      let referrerId = null;
      if (startParam) {
        const cleanRef = String(startParam).replace(/^ref_/, "").trim();
        if (cleanRef && cleanRef !== telegramId) {
          referrerId = cleanRef;
        }
      }

      // Create new user in Database with 50 Coins welcome bonus
      // (Note: Referrer does NOT get 100 coins immediately. Referrer gets 100 coins ONLY after this user joins & verifies channel!)
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
    } else {
      // Update basic profile details if changed
      user.firstName = telegramUser.first_name || user.firstName;
      user.lastName = telegramUser.last_name || user.lastName;
      user.username = telegramUser.username || user.username;
      await user.save();
    }

    // 1. Total Referrals Count (All friends who opened via ref link)
    const totalReferrals = await User.countDocuments({ referredBy: telegramId });

    // 2. Success Referrals Count (Only friends who completed channel join verification)
    const successReferrals = await User.countDocuments({
      referredBy: telegramId,
      hasJoinedChannel: true,
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
        hasJoinedChannel: Boolean(user.hasJoinedChannel),
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
