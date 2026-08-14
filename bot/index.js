// Example Telegram Bot using node-telegram-bot-api or telegraf
// To run: node bot/index.js (make sure to set TELEGRAM_BOT_TOKEN and MINI_APP_URL in .env.local)

require("dotenv").config({ path: ".env.local" });
const { Telegraf, Markup } = require("telegraf");

const token = process.env.TELEGRAM_BOT_TOKEN;
const webAppUrl = process.env.MINI_APP_URL || "http://localhost:3001/";

if (!token) {
  console.error("Please set TELEGRAM_BOT_TOKEN in .env.local");
  process.exit(1);
}

const bot = new Telegraf(token);

bot.start((ctx) => {
  ctx.reply(
    `Hello ${ctx.from.first_name}! 👋\nWelcome to Earning Bot Mini App. Click the button below to start earning:`,
    Markup.inlineKeyboard([
      Markup.button.webApp("🚀 Launch Mini App", webAppUrl),
    ])
  );
});

bot.launch().then(() => {
  console.log("Telegram Bot started successfully!");
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
