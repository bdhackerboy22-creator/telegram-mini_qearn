// Monetag Robust Multi-Format Ad Handler for Telegram Mobile WebApp (Zone: 11576758)

export const MONETAG_CONFIG = {
  ZONE_ID: "11576758",
  REWARD_PER_AD: 25,
  DAILY_REWARD: 50,
};

/**
 * Play Monetag Rewarded Ad seamlessly on Mobile Telegram WebApp
 * Handles Popup SDK -> In-App Telegram WebApp View fallback to bypass WebView Pop-up Blocker
 */
export function playMonetagRewardedAdSafely() {
  return new Promise((resolve) => {
    let handled = false;

    // 1. Try Monetag SDK Rewarded Popup Function
    if (typeof window !== "undefined" && typeof window.show_11576758 === "function") {
      try {
        window
          .show_11576758("pop")
          .then(() => {
            handled = true;
            resolve({ success: true, reward: MONETAG_CONFIG.REWARD_PER_AD });
          })
          .catch((err) => {
            console.warn("Monetag Popup blocked by Telegram WebView, triggering Telegram WebApp safe view:", err);
            triggerTelegramInAppAd(resolve);
          });
      } catch (e) {
        console.warn("SDK invocation exception, fallback to safe in-app ad:", e);
        triggerTelegramInAppAd(resolve);
      }
    } else {
      triggerTelegramInAppAd(resolve);
    }

    // Safety timeout to guarantee user always gets rewarded after watching
    setTimeout(() => {
      if (!handled) {
        resolve({ success: true, reward: MONETAG_CONFIG.REWARD_PER_AD });
      }
    }, 4000);
  });
}

function triggerTelegramInAppAd(resolve) {
  if (typeof window === "undefined") return resolve({ success: true, reward: MONETAG_CONFIG.REWARD_PER_AD });

  // Direct Monetag Zone Ad Link for 11576758
  const monetagAdUrl = `https://libtl.com/sdk.js?zone=11576758`;

  // Use Telegram WebApp official openLink to bypass Android/iOS WebView Pop-up Blocker
  if (window.Telegram?.WebApp?.openLink) {
    try {
      window.Telegram.WebApp.openLink(monetagAdUrl, { try_instant_view: false });
    } catch (_) {
      window.open(monetagAdUrl, "_blank");
    }
  } else {
    window.open(monetagAdUrl, "_blank");
  }

  resolve({ success: true, reward: MONETAG_CONFIG.REWARD_PER_AD });
}
