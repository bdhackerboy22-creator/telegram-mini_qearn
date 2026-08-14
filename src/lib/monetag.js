// Helper to handle Monetag Ads in Telegram Mini App
// Monetag offers several ad formats: Rewarded Interstitial, Direct Links, In-Page Push, etc.

export const MONETAG_CONFIG = {
  // Replace with your actual Monetag direct link or zone ID
  DIRECT_LINK_URL: "https://omitted-site.com/your-monetag-direct-link",
  REWARD_PER_AD: 25,
  DAILY_REWARD: 50,
  AD_COOLDOWN_SECONDS: 15,
};

export function showMonetagAd() {
  return new Promise((resolve) => {
    // If Monetag Rewarded SDK script is loaded in window (e.g., show_xxx)
    if (typeof window !== "undefined" && typeof window.show_rewarded_ad === "function") {
      window.show_rewarded_ad().then(() => {
        resolve({ success: true, reward: MONETAG_CONFIG.REWARD_PER_AD });
      }).catch(() => {
        // Fallback if SDK fails
        triggerDirectLinkAd(resolve);
      });
    } else {
      // Fallback to Direct Link / In-app browser popup
      triggerDirectLinkAd(resolve);
    }
  });
}

function triggerDirectLinkAd(resolve) {
  if (typeof window !== "undefined") {
    // Open Monetag direct link in Telegram WebApp popup or external browser
    if (window.Telegram?.WebApp?.openLink) {
      window.Telegram.WebApp.openLink(MONETAG_CONFIG.DIRECT_LINK_URL, {
        try_instant_view: false,
      });
    } else {
      window.open(MONETAG_CONFIG.DIRECT_LINK_URL, "_blank");
    }
    resolve({ success: true, reward: MONETAG_CONFIG.REWARD_PER_AD });
  } else {
    resolve({ success: false });
  }
}
