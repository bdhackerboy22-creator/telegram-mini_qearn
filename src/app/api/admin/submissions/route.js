import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import QuestionSubmission from "@/models/QuestionSubmission";
import User from "@/models/User";
import Transaction from "@/models/Transaction";

// Simple secure admin passcode
const ADMIN_SECRET = process.env.ADMIN_SECRET || "admin123";

// GET: Fetch all submissions, withdrawal requests, stats and user counts
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const passkey = searchParams.get("key");

    if (passkey !== ADMIN_SECRET) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    await connectDB();

    const [submissions, withdrawals, totalUsers, totalTransactions] = await Promise.all([
      QuestionSubmission.find().sort({ createdAt: -1 }).limit(200).lean(),
      Transaction.find({ type: "withdraw" }).sort({ createdAt: -1 }).limit(200).lean(),
      User.countDocuments(),
      Transaction.countDocuments(),
    ]);

    const pendingCount = submissions.filter((s) => s.status === "pending").length;
    const verifiedCount = submissions.filter((s) => s.status === "verified").length;
    const rejectedCount = submissions.filter((s) => s.status === "rejected").length;

    const pendingWithdrawalsCount = withdrawals.filter((w) => w.status === "pending").length;
    const paidWithdrawalsCount = withdrawals.filter((w) => w.status === "completed").length;
    const rejectedWithdrawalsCount = withdrawals.filter((w) => w.status === "rejected").length;

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalSubmissions: submissions.length,
        pendingCount,
        verifiedCount,
        rejectedCount,
        totalTransactions,
        pendingWithdrawalsCount,
        paidWithdrawalsCount,
        rejectedWithdrawalsCount,
      },
      submissions,
      withdrawals,
    });
  } catch (error) {
    console.error("Admin fetch error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Action to Approve/Reject Question OR Mark Paid/Reject Withdrawal
export async function POST(request) {
  try {
    const { passkey, submissionId, withdrawalId, action, rejectReason, trxId } = await request.json();

    if (passkey !== ADMIN_SECRET) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    await connectDB();

    // -------------------------------------------------------------
    // ACTION ON WITHDRAWAL (Mark Paid with TRX ID or Reject with Refund)
    // -------------------------------------------------------------
    if (withdrawalId) {
      const transaction = await Transaction.findById(withdrawalId);
      if (!transaction) {
        return NextResponse.json({ success: false, error: "Withdrawal transaction not found" }, { status: 404 });
      }

      if (transaction.status !== "pending") {
        return NextResponse.json({
          success: false,
          error: `Withdrawal is already ${transaction.status}`,
        }, { status: 400 });
      }

      if (action === "pay") {
        transaction.status = "completed";
        transaction.trxId = trxId ? String(trxId).trim() : `TRX_${Date.now()}`;
        await transaction.save();

        return NextResponse.json({
          success: true,
          message: `Withdrawal marked as Paid with Trx ID: ${transaction.trxId}`,
          status: "completed",
          trxId: transaction.trxId,
        });
      } else if (action === "reject_withdraw") {
        transaction.status = "rejected";
        transaction.rejectReason = rejectReason || "Invalid mobile number or network issue";
        await transaction.save();

        // Refund coins back to User balance!
        const user = await User.findOne({ telegramId: transaction.telegramId });
        if (user) {
          user.balance += transaction.amount;
          user.totalWithdrawn = Math.max(0, user.totalWithdrawn - transaction.amount);
          await user.save();
        }

        return NextResponse.json({
          success: true,
          message: `Withdrawal rejected and ${transaction.amount} coins refunded to user.`,
          status: "rejected",
          rejectReason: transaction.rejectReason,
        });
      }
    }

    // -------------------------------------------------------------
    // ACTION ON QUESTION SUBMISSION (Approve or Reject with note)
    // -------------------------------------------------------------
    if (submissionId) {
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
    }

    return NextResponse.json({ success: false, error: "Invalid request payload" }, { status: 400 });
  } catch (error) {
    console.error("Admin action error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
