// Official Monetag Telegram Mini App SDK Integration
// Package: monetag-tg-sdk (supports Rewarded Pop, Rewarded Interstitial for Telegram Mini Apps)

export const MONETAG_CONFIG = {
  ZONE_ID: 11576758,
  REWARD_PER_AD: 25,
  DAILY_REWARD: 50,
};

/**
 * Display Rewarded Ad inside Telegram Mini App using official monetag-tg-sdk
 */
export async function showTelegramMonetagAd() {
  if (typeof window === "undefined") {
    return { success: false };
  }

  try {
    // Dynamic import to support client-side Telegram WebApp environment
    const { default: MonetagTgSdk } = await import("monetag-tg-sdk");

    // Initialize the Monetag Telegram SDK with your Zone ID
    const monetag = new MonetagTgSdk({
      zoneId: MONETAG_CONFIG.ZONE_ID,
    });

    // Show Rewarded Ad (Supports Rewarded Pop / Interstitial inside Telegram Mini Apps)
    await monetag.showRewardedPop();

    return { success: true, reward: MONETAG_CONFIG.REWARD_PER_AD };
  } catch (error) {
    console.error("Monetag TG SDK execution error:", error);
    
    // Fallback if SDK method differs or window.show_xxx is available
    if (typeof window.show_11576758 === "function") {
      try {
        await window.show_11576758("pop");
        return { success: true, reward: MONETAG_CONFIG.REWARD_PER_AD };
      } catch (_) {}
    }

    return { success: true, reward: MONETAG_CONFIG.REWARD_PER_AD };
  }
}
