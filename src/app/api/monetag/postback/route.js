import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import mongoose from "mongoose";

// Model to store Monetag Postback records & prevent duplicate reward exploit
const PostbackLogSchema = new mongoose.Schema(
  {
    clickId: {
      type: String,
      required: true,
      unique: true, // Prevents duplicate postback execution
      index: true,
    },
    telegramId: {
      type: String,
      required: true,
      index: true,
    },
    payout: {
      type: Number,
      default: 0,
    },
    rewardCoins: {
      type: Number,
      default: 100, // 100 Coins per confirmed Monetag completion
    },
    rawParams: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

const PostbackLog =
  mongoose.models.PostbackLog ||
  mongoose.model("PostbackLog", PostbackLogSchema);

const REWARD_PER_CONFIRMED_AD = 100;

export async function GET(request) {
  return handlePostback(request);
}

export async function POST(request) {
  return handlePostback(request);
}

async function handlePostback(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Monetag Postback Parameters
    const clickId =
      searchParams.get("click_id") ||
      searchParams.get("clickid") ||
      searchParams.get("transaction_id") ||
      searchParams.get("id") ||
      `test_click_${Date.now()}`;

    const telegramId =
      searchParams.get("ymid") ||
      searchParams.get("user_id") ||
      searchParams.get("custom_sub") ||
      searchParams.get("sub_id");

    const payout = parseFloat(searchParams.get("payout") || "0");

    // Monetag "Test Postback" button in dashboard sends placeholder values like "${click_id}" or "$" or empty
    const isTestPlaceholder =
      !telegramId ||
      telegramId === "$" ||
      telegramId.includes("{") ||
      telegramId === "null" ||
      telegramId === "undefined";

    if (isTestPlaceholder) {
      console.log("Received Monetag Dashboard Test Ping:", Object.fromEntries(searchParams.entries()));
      // Respond 200 OK to Monetag so the Test Postback passes successfully in Monetag dashboard!
      return NextResponse.json({
        ok: true,
        status: "success",
        message: "Monetag Test Postback Verified Successfully!",
      });
    }

    await connectDB();

    // 1. Check Duplicate Postback (Anti-Cheat / Idempotency)
    const existingPostback = await PostbackLog.findOne({ clickId });
    if (existingPostback) {
      console.warn(`Duplicate postback detected for clickId: ${clickId}`);
      return NextResponse.json({
        ok: true,
        status: "success",
        message: "Duplicate postback already processed",
      });
    }

    // 2. Find User in DB or create placeholder for new user
    let user = await User.findOne({ telegramId: String(telegramId) });
    if (!user) {
      user = await User.create({
        telegramId: String(telegramId),
        firstName: "Telegram",
        lastName: "Earner",
        balance: 100,
        totalEarned: 100,
      });
    }

    // 3. Save Postback record to prevent duplicate
    const allParams = Object.fromEntries(searchParams.entries());
    await PostbackLog.create({
      clickId,
      telegramId: String(telegramId),
      payout,
      rewardCoins: REWARD_PER_CONFIRMED_AD,
      rawParams: allParams,
    });

    // 4. Credit User Balance (+100 Coins)
    user.balance += REWARD_PER_CONFIRMED_AD;
    user.totalEarned += REWARD_PER_CONFIRMED_AD;
    user.adsWatchedCount = (user.adsWatchedCount || 0) + 1;
    await user.save();

    // 5. Save Transaction History
    await Transaction.create({
      telegramId: String(telegramId),
      title: `Monetag Rewarded Ad (${clickId.substring(0, 8)}...)`,
      type: "earn",
      amount: REWARD_PER_CONFIRMED_AD,
      status: "completed",
    });

    return NextResponse.json({
      ok: true,
      status: "success",
      message: `+${REWARD_PER_CONFIRMED_AD} Coins credited to user ${telegramId}`,
    });
  } catch (error) {
    console.error("Postback processing error:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
