import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

const REFERRAL_REWARD_PER_SUCCESS = 100;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const telegramId = searchParams.get("telegramId");

    if (!telegramId) {
      return NextResponse.json({ success: false, error: "Missing Telegram ID" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ telegramId: String(telegramId) });
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Fetch all users referred by this user
    const referredUsers = await User.find({ referredBy: String(telegramId) })
      .sort({ createdAt: -1 })
      .select("telegramId firstName lastName username hasJoinedMainChannel hasJoinedPaymentChannel hasJoinedActivitiesChannel isReferralRewardPaid createdAt")
      .lean();

    const totalReferrals = referredUsers.length;

    // Success referral requires joining ALL 3 CHANNELS!
    const successReferrals = referredUsers.filter(
      (u) =>
        Boolean(u.hasJoinedMainChannel) &&
        Boolean(u.hasJoinedPaymentChannel) &&
        Boolean(u.hasJoinedActivitiesChannel)
    ).length;

    const pendingReferrals = totalReferrals - successReferrals;
    const totalBonusEarned = successReferrals * REFERRAL_REWARD_PER_SUCCESS;

    return NextResponse.json({
      success: true,
      stats: {
        totalReferrals,
        successReferrals,
        pendingReferrals,
        totalBonusEarned,
        rewardPerReferral: REFERRAL_REWARD_PER_SUCCESS,
        userTelegramId: telegramId,
      },
      referredUsers: referredUsers.map((u) => {
        const completedChannelsCount =
          (u.hasJoinedMainChannel ? 1 : 0) +
          (u.hasJoinedPaymentChannel ? 1 : 0) +
          (u.hasJoinedActivitiesChannel ? 1 : 0);

        const isSuccess = completedChannelsCount === 3;

        return {
          id: u.telegramId,
          name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Telegram User",
          username: u.username ? `@${u.username}` : "Anonymous",
          isSuccess,
          completedChannelsCount,
          statusText: isSuccess
            ? "Success (3/3 Channels Verified ✓)"
            : `Pending (${completedChannelsCount}/3 Channels Joined)`,
          joinedAt: new Date(u.createdAt).toLocaleDateString([], {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        };
      }),
    });
  } catch (error) {
    console.error("Referral stats fetch error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
