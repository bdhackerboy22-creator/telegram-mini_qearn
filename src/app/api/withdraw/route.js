import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Transaction from "@/models/Transaction";

const MIN_WITHDRAW_COINS = 200; // Minimum 200 Coins
const COIN_TO_BDT_RATE = 0.1; // 1 Coin = 0.1 TK (e.g. 200 Coins = 20 BDT)

export async function POST(request) {
  try {
    const { telegramId, accountNumber, operator, simType, amount } = await request.json();

    const numAmount = parseInt(amount, 10);
    if (!telegramId || !accountNumber || isNaN(numAmount)) {
      return NextResponse.json(
        { success: false, error: "Invalid withdrawal input parameters" },
        { status: 400 }
      );
    }

    if (numAmount < MIN_WITHDRAW_COINS) {
      return NextResponse.json(
        {
          success: false,
          error: `Minimum withdrawal is ${MIN_WITHDRAW_COINS} coins (20 TK Recharge).`,
        },
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
        { success: false, error: "Insufficient coin balance for withdrawal" },
        { status: 400 }
      );
    }

    const bdtAmount = Math.round(numAmount * COIN_TO_BDT_RATE * 100) / 100;

    // Deduct coins & increment totalWithdrawn
    user.balance -= numAmount;
    user.totalWithdrawn += numAmount;
    await user.save();

    // Create withdrawal transaction
    const opName = operator || "Mobile";
    const transaction = await Transaction.create({
      telegramId: String(telegramId),
      title: `Recharge (${opName}) - ৳${bdtAmount} BDT`,
      type: "withdraw",
      amount: numAmount,
      bdtAmount,
      status: "pending",
      method: "recharge",
      operator: opName,
      simType: simType || "prepaid",
      accountNumber: String(accountNumber).trim(),
    });

    return NextResponse.json({
      success: true,
      balance: user.balance,
      totalWithdrawn: user.totalWithdrawn,
      bdtAmount,
      transaction: {
        id: transaction._id,
        title: transaction.title,
        type: transaction.type,
        amount: transaction.amount,
        bdtAmount: transaction.bdtAmount,
        status: transaction.status,
        method: transaction.method,
        accountNumber: transaction.accountNumber,
        operator: transaction.operator,
        simType: transaction.simType,
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
