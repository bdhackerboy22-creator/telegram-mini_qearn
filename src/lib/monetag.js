// Official Monetag Telegram Mini App SDK Integration with ymid (Telegram ID)
// Package: monetag-tg-sdk

export const MONETAG_CONFIG = {
  ZONE_ID: 11576758,
  REWARD_PER_AD: 100, // 100 Coins per ad
  DAILY_REWARD: 50,
};

/**
 * Display Rewarded Ad inside Telegram Mini App passing user's telegramId as ymid
 */
export async function showTelegramMonetagAd(telegramId) {
  if (typeof window === "undefined") {
    return { success: false };
  }

  const userId = telegramId || window.Telegram?.WebApp?.initDataUnsafe?.user?.id || "demo_user";

  try {
    const { default: MonetagTgSdk } = await import("monetag-tg-sdk");

    // Initialize the Monetag Telegram SDK with your Zone ID & ymid
    const monetag = new MonetagTgSdk({
      zoneId: MONETAG_CONFIG.ZONE_ID,
      ymid: String(userId),
    });

    // Show Rewarded Ad
    await monetag.showRewardedPop();

    return { success: true, reward: MONETAG_CONFIG.REWARD_PER_AD };
  } catch (error) {
    console.error("Monetag TG SDK execution error:", error);

    // Fallback if window.show_xxx is available
    if (typeof window.show_11576758 === "function") {
      try {
        await window.show_11576758("pop");
        return { success: true, reward: MONETAG_CONFIG.REWARD_PER_AD };
      } catch (_) {}
    }

    return { success: true, reward: MONETAG_CONFIG.REWARD_PER_AD };
  }
}
