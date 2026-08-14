// Monetag Robust Multi-Format Ad Handler for Telegram Mobile WebApp (Zone: 11576758)

export const MONETAG_CONFIG = {
  ZONE_ID: "11576758",
  REWARD_PER_AD: 25,
  DAILY_REWARD: 50,
  AD_DURATION_SECONDS: 15, // 15-second mandatory session duration
};

/**
 * Trigger Monetag Ad popup or in-app link
 */
export function triggerMonetagAdPlayback() {
  if (typeof window === "undefined") return;

  // 1. Try Monetag SDK Popup Function
  if (typeof window.show_11576758 === "function") {
    try {
      window.show_11576758("pop").catch(() => {});
    } catch (_) {}
  }

  // 2. Open via Telegram WebApp if in mobile telegram
  const monetagAdUrl = `https://libtl.com/sdk.js?zone=11576758`;
  if (window.Telegram?.WebApp?.openLink) {
    try {
      window.Telegram.WebApp.openLink(monetagAdUrl, { try_instant_view: false });
    } catch (_) {
      window.open(monetagAdUrl, "_blank");
    }
  } else {
    window.open(monetagAdUrl, "_blank");
  }
}
