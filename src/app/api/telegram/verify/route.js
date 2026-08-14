import { NextResponse } from "next/server";
import { verifyTelegramWebAppData } from "@/lib/telegram";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Transaction from "@/models/Transaction";

export async function POST(request) {
  try {
    const { initData } = await request.json();
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
      // Create new user in Database with initial welcome bonus
      user = await User.create({
        telegramId,
        firstName: telegramUser.first_name || "",
        lastName: telegramUser.last_name || "",
        username: telegramUser.username || "",
        balance: 100,
        totalEarned: 100,
      });

      // Record welcome bonus transaction
      await Transaction.create({
        telegramId,
        title: "Welcome Bonus",
        type: "earn",
        amount: 100,
        status: "completed",
      });
    } else {
      // Update basic profile details if changed
      user.firstName = telegramUser.first_name || user.firstName;
      user.lastName = telegramUser.last_name || user.lastName;
      user.username = telegramUser.username || user.username;
      await user.save();
    }

    // Fetch user transactions
    const transactions = await Transaction.find({ telegramId })
      .sort({ createdAt: -1 })
      .limit(20)
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
        lastDailyRewardDate: user.lastDailyRewardDate,
      },
      transactions: transactions.map((t) => ({
        id: t._id,
        title: t.title,
        type: t.type,
        amount: t.amount,
        status: t.status,
        method: t.method,
        time: new Date(t.createdAt).toLocaleTimeString([], {
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
