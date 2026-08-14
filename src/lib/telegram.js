// Utility to validate Telegram WebApp initData on server side
import crypto from "crypto";

export function verifyTelegramWebAppData(initData, botToken) {
  if (!initData || !botToken) return null;

  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get("hash");
  urlParams.delete("hash");

  const paramsArray = Array.from(urlParams.entries())
    .map(([key, val]) => `${key}=${val}`)
    .sort();

  const dataCheckString = paramsArray.join("\n");
  const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
  const calculatedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (calculatedHash === hash) {
    const userString = urlParams.get("user");
    return userString ? JSON.parse(userString) : null;
  }

  return null;
}
