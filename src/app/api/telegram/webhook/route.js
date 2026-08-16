import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

const WELCOME_BONUS = 50;

export async function POST(request) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const miniAppUrl = process.env.MINI_APP_URL || "https://telegram-miniqearn.vercel.app";
    const channelLink = process.env.TELEGRAM_CHANNEL_LINK || "https://t.me/qearnofficial";

    const body = await request.json();
    const message = body.message || body.edited_message;

    if (message && message.chat && botToken) {
      const chatId = message.chat.id;
      const text = (message.text || "").trim();
      const firstName = message.from?.first_name || "User";
      const telegramId = String(message.from?.id || chatId);

      if (text.startsWith("/start")) {
        // Parse referral parameter: e.g. /start ref_123456789 or /start 123456789
        const parts = text.split(" ");
        let referrerId = null;
        if (parts.length > 1) {
          const rawParam = parts[1].replace(/^ref_/, "").trim();
          if (rawParam && rawParam !== telegramId) {
            referrerId = rawParam;
          }
        }

        await connectDB();

        // Check if user exists or create them with referrer
        let user = await User.findOne({ telegramId });
        if (!user) {
          user = await User.create({
            telegramId,
            firstName: message.from?.first_name || "",
            lastName: message.from?.last_name || "",
            username: message.from?.username || "",
            balance: WELCOME_BONUS,
            totalEarned: WELCOME_BONUS,
            referredBy: referrerId,
            isReferralRewardPaid: false,
          });
        }

        // WebApp launch URL passing ref parameter
        const webAppLaunchUrl = referrerId
          ? `${miniAppUrl}?ref=${encodeURIComponent(referrerId)}`
          : miniAppUrl;

        const welcomeText = `👋 Hello, ${firstName}!\n\nWelcome to **QEarn** 🪙\n\n🎯 Upload Diploma Exam Questions & Earn Coins\n📱 Withdraw directly as Mobile Recharge (GP, BL, Robi, Airtel, Teletalk)\n🎁 Get 50 Coins Welcome Bonus!\n\n👇 Click the button below to start earning:`;

        const replyMarkup = {
          inline_keyboard: [
            [
              {
                text: "🚀 Open QEarn Mini App",
                web_app: { url: webAppLaunchUrl },
              },
            ],
            [
              {
                text: "📢 Join Official Channel (+50 Coins)",
                url: channelLink,
              },
            ],
          ],
        };

        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: welcomeText,
            parse_mode: "Markdown",
            reply_markup: replyMarkup,
          }),
        });
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "Telegram Webhook Active",
    time: new Date().toISOString(),
  });
}
