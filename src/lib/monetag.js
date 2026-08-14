// Monetag Ad Handler Optimized for Telegram Mobile & Desktop WebApp

export const MONETAG_CONFIG = {
  ZONE_ID: "11576758",
  // Monetag Direct / SmartLink fallback
  DIRECT_LINK: "https://libtl.com/sdk.js?zone=11576758",
  FALLBACK_AD_URL: "https://omitted-site.com/your-monetag-direct-link",
  REWARD_PER_AD: 25,
  AD_WATCH_SECONDS: 10,
};

export function triggerMonetagAdMobile() {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve({ success: true });

    let adTriggered = false;

    // 1. Try Monetag SDK Function if loaded
    if (typeof window.show_11576758 === "function") {
      try {
        window
          .show_11576758("pop")
          .then(() => {
            adTriggered = true;
          })
          .catch(() => {
            // SDK execution
          });
      } catch (e) {
        console.error("SDK execution error:", e);
      }
    }

    // 2. Telegram In-App Safe Link Trigger for Mobile
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      const targetUrl = `https://alwingulla.com/4/8888888`; // Or your Monetag Smartlink

      try {
        if (typeof tg.openLink === "function") {
          tg.openLink(targetUrl, { try_instant_view: false });
          adTriggered = true;
        }
      } catch (err) {
        console.error("Telegram openLink error:", err);
      }
    }

    // Always resolve so the timer and reward logic can complete smoothly
    resolve({ success: true, reward: MONETAG_CONFIG.REWARD_PER_AD });
  });
}
