/**
 * Helper to broadcast styled messages to Telegram Channels
 */
export async function sendTelegramChannelMessage(channelUsername, messageText, inlineKeyboard = null) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken || !channelUsername) {
      console.warn("Telegram bot token or channel username not configured.");
      return false;
    }

    const payload = {
      chat_id: channelUsername,
      text: messageText,
      parse_mode: "HTML",
      disable_web_page_preview: false,
    };

    if (inlineKeyboard && inlineKeyboard.length > 0) {
      payload.reply_markup = {
        inline_keyboard: inlineKeyboard,
      };
    }

    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!data.ok) {
      console.warn(`Failed to post to ${channelUsername}:`, data.description);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Error sending message to ${channelUsername}:`, error);
    return false;
  }
}

/**
 * 1. Post to @Qearn_Payment on New Recharge Request
 */
export async function broadcastPaymentRequested({
  amount,
  bdtAmount,
  operator,
  simType,
  accountNumber,
  telegramId,
}) {
  const channel = process.env.TELEGRAM_CHANNEL_PAYMENT || "@Qearn_Payment";
  const maskedNumber = accountNumber
    ? accountNumber.slice(0, 4) + "****" + accountNumber.slice(-3)
    : "017****XXX";

  const message = `🔔 <b>NEW RECHARGE REQUEST</b>
━━━━━━━━━━━━━━━━━━━━
💰 <b>Amount:</b> ৳${bdtAmount} BDT (🪙 ${amount} Coins)
📱 <b>Operator:</b> ${operator || "Mobile"} (${simType || "prepaid"})
📞 <b>Number:</b> <code>${maskedNumber}</code>
👤 <b>User ID:</b> <code>${telegramId}</code>
⏳ <b>Status:</b> 🟡 Pending Review
⏰ <b>Time:</b> ${new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" })}
━━━━━━━━━━━━━━━━━━━━
🤖 <i>QEarn Mini App Automatic Payment System</i>`;

  const miniAppUrl = process.env.MINI_APP_URL || "https://telegram-miniqearn.vercel.app";
  const keyboard = [
    [
      { text: "🚀 Open QEarn App", url: `https://t.me/qaearn_bot?start=open` },
      { text: "📢 Official Channel", url: process.env.TELEGRAM_CHANNEL_MAIN_LINK || "https://t.me/qearnofficial" },
    ],
  ];

  return sendTelegramChannelMessage(channel, message, keyboard);
}

/**
 * 2. Post to @Qearn_Payment on Completed/Paid Recharge
 */
export async function broadcastPaymentCompleted({
  amount,
  bdtAmount,
  operator,
  simType,
  accountNumber,
  trxId,
  telegramId,
}) {
  const channel = process.env.TELEGRAM_CHANNEL_PAYMENT || "@Qearn_Payment";
  const maskedNumber = accountNumber
    ? accountNumber.slice(0, 4) + "****" + accountNumber.slice(-3)
    : "017****XXX";

  const message = `✅ <b>MOBILE RECHARGE COMPLETED</b>
━━━━━━━━━━━━━━━━━━━━
💵 <b>Amount Paid:</b> ৳${bdtAmount} BDT
🪙 <b>Coins Deducted:</b> ${amount} Coins
📱 <b>Operator:</b> ${operator || "Mobile"} (${simType || "prepaid"})
📞 <b>Recipient:</b> <code>${maskedNumber}</code>
🧾 <b>Trx ID / Ref:</b> <code>${trxId || "SUCCESSFUL"}</code>
👤 <b>User ID:</b> <code>${telegramId}</code>
✅ <b>Status:</b> 🟢 Successfully Paid
⏰ <b>Time:</b> ${new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" })}
━━━━━━━━━━━━━━━━━━━━
🎉 <i>Congratulations! Keep uploading questions and earning!</i>`;

  const keyboard = [
    [
      { text: "🎁 Start Earning Now", url: `https://t.me/qaearn_bot?start=open` },
      { text: "📢 Payment Proofs", url: process.env.TELEGRAM_CHANNEL_PAYMENT_LINK || "https://t.me/Qearn_Payment" },
    ],
  ];

  return sendTelegramChannelMessage(channel, message, keyboard);
}

/**
 * 3. Post to @Qearn_Activities on User Activity (New User, Question Uploaded, Question Approved)
 */
export async function broadcastActivity({ title, description, badge, details = {} }) {
  const channel = process.env.TELEGRAM_CHANNEL_ACTIVITIES || "@Qearn_Activities";

  let detailLines = "";
  for (const [key, value] of Object.entries(details)) {
    if (value) {
      detailLines += `🔹 <b>${key}:</b> ${value}\n`;
    }
  }

  const message = `${badge || "⚡"} <b>${title.toUpperCase()}</b>
━━━━━━━━━━━━━━━━━━━━
${description}

${detailLines}⏰ <b>Time:</b> ${new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" })}
━━━━━━━━━━━━━━━━━━━━
🤖 <i>QEarn Community Activity Feed</i>`;

  const keyboard = [
    [
      { text: "🚀 Open QEarn App", url: `https://t.me/qaearn_bot?start=open` },
      { text: "👥 Join Activities", url: process.env.TELEGRAM_CHANNEL_ACTIVITIES_LINK || "https://t.me/Qearn_Activities" },
    ],
  ];

  return sendTelegramChannelMessage(channel, message, keyboard);
}
