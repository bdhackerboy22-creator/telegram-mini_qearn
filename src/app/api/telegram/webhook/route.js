import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const miniAppUrl = process.env.MINI_APP_URL || "https://telegram-mini-app.vercel.app";

    if (!botToken) {
      console.error("TELEGRAM_BOT_TOKEN missing in environment variables");
      return NextResponse.json({ error: "No bot token provided" }, { status: 500 });
    }

    const body = await request.json();

    // Support both message and callback_query
    const message = body.message || body.edited_message;

    if (message && message.chat) {
      const chatId = message.chat.id;
      const text = message.text || "";
      const firstName = message.from?.first_name || "User";

      // If user sends /start or any start command
      if (text.startsWith("/start")) {
        const welcomeText = `👋 Hello, ${firstName}!\n\nWelcome to Telegram Monetag Earning App 🪙\n\nComplete daily tasks, watch ads, and withdraw your earnings directly to bKash, Nagad, or TON!\n\n👇 Click the button below to launch the Mini App:`;

        const replyMarkup = {
          inline_keyboard: [
            [
              {
                text: "🚀 Launch Mini App",
                web_app: { url: miniAppUrl },
              },
            ],
            [
              {
                text: "📢 Join Official Channel",
                url: "https://t.me/",
              },
            ],
          ],
        };

        const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: welcomeText,
            reply_markup: replyMarkup,
          }),
        });

        const resJson = await res.json();
        if (!resJson.ok) {
          console.error("Telegram API sendMessage error:", resJson);
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "Telegram Webhook is active and running 24/7 on Vercel!",
    timestamp: new Date().toISOString(),
  });
}
