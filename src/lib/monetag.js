// Monetag Rewarded Interstitial & Smartlink Ad Handler

export const MONETAG_CONFIG = {
  ZONE_ID: "11576758",
  // Monetag Direct Smartlink Fallback
  DIRECT_LINK: "https://otootoup.com/4/8834927",
};

/**
 * 1. Check if Monetag SDK is successfully loaded on window
 */
export function isMonetagSDKReady() {
  if (typeof window === "undefined") return false;
  return typeof window.show_11576758 === "function";
}

/**
 * 2. Play Monetag Ad:
 * - First tries the Official SDK (window.show_11576758())
 * - If SDK is blocked or unavailable, automatically opens Monetag Direct Link in browser / Telegram WebApp
 */
export function playMonetagAd() {
  if (typeof window === "undefined") return;

  // Method A: Official SDK Rewarded Interstitial
  if (typeof window.show_11576758 === "function") {
    try {
      window
        .show_11576758()
        .then(() => {
          console.log("Monetag Ad playback completed!");
        })
        .catch((err) => {
          console.warn("Monetag SDK error, falling back to Direct Link:", err);
          openMonetagDirectLink();
        });
      return;
    } catch (e) {
      console.warn("SDK call failed:", e);
    }
  }

  // Method B: Direct Smartlink in new window / Telegram link
  openMonetagDirectLink();
}

/**
 * Open Monetag Direct Smartlink in external browser / tab
 */
export function openMonetagDirectLink() {
  if (typeof window === "undefined") return;

  const directLink = MONETAG_CONFIG.DIRECT_LINK;

  if (window.Telegram?.WebApp) {
    // Open in Telegram External In-App / System Browser
    window.Telegram.WebApp.openLink(directLink);
  } else {
    window.open(directLink, "_blank", "noopener,noreferrer");
  }
}
