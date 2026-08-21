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
      .select(
        "telegramId firstName lastName username hasJoinedMainChannel hasJoinedPaymentChannel hasJoinedActivitiesChannel hasApprovedQuestionUpload isReferralRewardPaid createdAt"
      )
      .lean();

    const totalReferrals = referredUsers.length;

    // Success referral requires completing ALL 4 TASKS!
    const successReferrals = referredUsers.filter(
      (u) =>
        Boolean(u.hasJoinedMainChannel) &&
        Boolean(u.hasJoinedPaymentChannel) &&
        Boolean(u.hasJoinedActivitiesChannel) &&
        Boolean(u.hasApprovedQuestionUpload)
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
        const task1 = Boolean(u.hasJoinedMainChannel);
        const task2 = Boolean(u.hasJoinedPaymentChannel);
        const task3 = Boolean(u.hasJoinedActivitiesChannel);
        const task4 = Boolean(u.hasApprovedQuestionUpload);

        const completedCount = (task1 ? 1 : 0) + (task2 ? 1 : 0) + (task3 ? 1 : 0) + (task4 ? 1 : 0);
        const isSuccess = completedCount === 4;

        return {
          id: u.telegramId,
          name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Telegram User",
          username: u.username ? `@${u.username}` : "Anonymous",
          isSuccess,
          completedCount,
          tasks: [
            {
              id: "main_channel",
              name: "Official Main Channel",
              isCompleted: task1,
            },
            {
              id: "payment_channel",
              name: "QEarn Payment Channel",
              isCompleted: task2,
            },
            {
              id: "activities_channel",
              name: "QEarn Activities Channel",
              isCompleted: task3,
            },
            {
              id: "question_upload",
              name: "Question Upload (Approved)",
              isCompleted: task4,
            },
          ],
          statusText: isSuccess
            ? "Success (4/4 Tasks Completed ✓)"
            : `Pending (${completedCount}/4 Tasks Done)`,
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
