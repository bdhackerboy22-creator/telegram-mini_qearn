// Monetag Zone Configuration & Invocation Handler

export const MONETAG_CONFIG = {
  ZONE_ID: "11576758",
  SESSION_DURATION_SECONDS: 15,
  REWARD_PER_AD: 25,
  DAILY_REWARD: 50,
};

/**
 * Initializes the Monetag advertising format without altering ad iframe/content.
 */
export function initializeMonetagAdSession() {
  if (typeof window === "undefined") return;

  // 1. If official SDK function is available, invoke it
  if (typeof window.show_11576758 === "function") {
    try {
      window.show_11576758("pop").catch((err) => {
        console.warn("Monetag SDK session event:", err);
      });
    } catch (err) {
      console.warn("Monetag SDK exception:", err);
    }
  } else if (window.Telegram?.WebApp?.openLink) {
    // 2. Mobile Telegram safe open
    try {
      window.Telegram.WebApp.openLink(`https://libtl.com/sdk.js?zone=11576758`, {
        try_instant_view: false,
      });
    } catch (_) {}
  }
}
