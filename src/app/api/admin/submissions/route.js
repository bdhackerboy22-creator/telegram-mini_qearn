import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import QuestionSubmission from "@/models/QuestionSubmission";
import User from "@/models/User";
import Transaction from "@/models/Transaction";

// Simple secure admin passcode
const ADMIN_SECRET = process.env.ADMIN_SECRET || "admin123";

// GET: Fetch all submissions, stats and user counts
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const passkey = searchParams.get("key");

    if (passkey !== ADMIN_SECRET) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    await connectDB();

    const [submissions, totalUsers, totalTransactions] = await Promise.all([
      QuestionSubmission.find().sort({ createdAt: -1 }).limit(200).lean(),
      User.countDocuments(),
      Transaction.countDocuments(),
    ]);

    const pendingCount = submissions.filter((s) => s.status === "pending").length;
    const verifiedCount = submissions.filter((s) => s.status === "verified").length;
    const rejectedCount = submissions.filter((s) => s.status === "rejected").length;

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalSubmissions: submissions.length,
        pendingCount,
        verifiedCount,
        rejectedCount,
        totalTransactions,
      },
      submissions,
    });
  } catch (error) {
    console.error("Admin fetch error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Action to Approve or Reject a Question Submission (with Note/Reason)
export async function POST(request) {
  try {
    const { passkey, submissionId, action, rejectReason } = await request.json();

    if (passkey !== ADMIN_SECRET) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    if (!submissionId || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ success: false, error: "Invalid action parameters" }, { status: 400 });
    }

    await connectDB();

    const submission = await QuestionSubmission.findById(submissionId);
    if (!submission) {
      return NextResponse.json({ success: false, error: "Submission not found" }, { status: 404 });
    }

    if (submission.status !== "pending") {
      return NextResponse.json({
        success: false,
        error: `Submission is already ${submission.status}`,
      }, { status: 400 });
    }

    if (action === "approve") {
      submission.status = "verified";
      await submission.save();

      // Credit Coins to User
      const reward = submission.rewardAmount || 50;
      const user = await User.findOne({ telegramId: submission.telegramId });

      if (user) {
        user.balance += reward;
        user.totalEarned += reward;
        await user.save();

        // Create transaction log
        await Transaction.create({
          telegramId: submission.telegramId,
          title: `Question Approved: ${submission.subjectName} (${submission.subjectCode})`,
          type: "earn",
          amount: reward,
          status: "completed",
        });
      }

      return NextResponse.json({
        success: true,
        message: `Submission approved! +${reward} coins credited to user.`,
        status: "verified",
      });
    } else {
      submission.status = "rejected";
      submission.rejectReason = rejectReason || "Blurry/Invalid photo";
      await submission.save();

      return NextResponse.json({
        success: true,
        message: "Submission has been rejected.",
        status: "rejected",
        rejectReason: submission.rejectReason,
      });
    }
  } catch (error) {
    console.error("Admin action error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
