import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const miniAppUrl = process.env.MINI_APP_URL || "https://telegram-mini-app.vercel.app";

    const body = await request.json();
    const message = body.message || body.edited_message;

    if (message && message.chat && botToken) {
      const chatId = message.chat.id;
      const text = message.text || "";
      const firstName = message.from?.first_name || "User";

      if (text.startsWith("/start")) {
        const welcomeText = `👋 Hello, ${firstName}!\n\nWelcome to Telegram Monetag Earning App 🪙\n\nComplete daily tasks, watch ads, and withdraw your earnings directly to bKash, Nagad, or TON!\n\n👇 Click below to open the Mini App:`;

        const replyMarkup = {
          inline_keyboard: [
            [
              {
                text: "🚀 Open Earning App",
                web_app: { url: miniAppUrl },
              },
            ],
            [
              {
                text: "📢 Join Telegram Channel",
                url: "https://t.me/",
              },
            ],
          ],
        };

        // Fire and forget or quick fetch
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: welcomeText,
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
