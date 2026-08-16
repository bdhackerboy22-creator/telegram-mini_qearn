import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

const REFERRAL_REWARD_PER_USER = 100;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const telegramId = searchParams.get("telegramId");

    if (!telegramId) {
      return NextResponse.json({ success: false, error: "Missing Telegram ID" }, { status: 400 });
    }

    await connectDB();

    // 1. Fetch user
    const user = await User.findOne({ telegramId: String(telegramId) });
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // 2. Fetch all users referred by this user
    const referredUsers = await User.find({ referredBy: String(telegramId) })
      .sort({ createdAt: -1 })
      .select("telegramId firstName lastName username createdAt")
      .lean();

    const referralCount = referredUsers.length;
    const totalBonusEarned = referralCount * REFERRAL_REWARD_PER_USER;

    // Telegram Bot Username for deep-linking
    const botUsername = "QEarnBot"; // Default bot username (or configured)

    return NextResponse.json({
      success: true,
      stats: {
        referralCount,
        totalBonusEarned,
        rewardPerReferral: REFERRAL_REWARD_PER_USER,
        userTelegramId: telegramId,
      },
      referredUsers: referredUsers.map((u) => ({
        id: u.telegramId,
        name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Telegram User",
        username: u.username ? `@${u.username}` : "Anonymous",
        joinedAt: new Date(u.createdAt).toLocaleDateString([], {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      })),
    });
  } catch (error) {
    console.error("Referral stats fetch error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
