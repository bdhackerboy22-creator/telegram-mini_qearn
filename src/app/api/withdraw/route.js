import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Transaction from "@/models/Transaction";

const MIN_WITHDRAW_COINS = 500;

export async function POST(request) {
  try {
    const { telegramId, method, accountNumber, amount } = await request.json();

    const numAmount = parseInt(amount, 10);
    if (!telegramId || !method || !accountNumber || isNaN(numAmount)) {
      return NextResponse.json(
        { success: false, error: "Invalid withdrawal input parameters" },
        { status: 400 }
      );
    }

    if (numAmount < MIN_WITHDRAW_COINS) {
      return NextResponse.json(
        { success: false, error: `Minimum withdrawal is ${MIN_WITHDRAW_COINS} coins.` },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ telegramId: String(telegramId) });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found in database" },
        { status: 404 }
      );
    }

    if (user.balance < numAmount) {
      return NextResponse.json(
        { success: false, error: "Insufficient balance for withdrawal" },
        { status: 400 }
      );
    }

    // Deduct coins & increment totalWithdrawn
    user.balance -= numAmount;
    user.totalWithdrawn += numAmount;
    await user.save();

    // Create withdrawal transaction
    const transaction = await Transaction.create({
      telegramId: String(telegramId),
      title: `Withdrawal (${method.toUpperCase()}) - ${accountNumber}`,
      type: "withdraw",
      amount: numAmount,
      status: "pending",
      method,
      accountNumber,
    });

    return NextResponse.json({
      success: true,
      balance: user.balance,
      totalWithdrawn: user.totalWithdrawn,
      transaction: {
        id: transaction._id,
        title: transaction.title,
        type: transaction.type,
        amount: transaction.amount,
        status: transaction.status,
        method: transaction.method,
        time: new Date(transaction.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    });
  } catch (error) {
    console.error("Withdraw error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
