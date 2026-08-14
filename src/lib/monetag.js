// Monetag Ad Window / Tab Manager for Strict 15s Verification

export const MONETAG_CONFIG = {
  ZONE_ID: "11576758",
  REWARD_PER_AD: 25,
  DAILY_REWARD: 50,
  AD_DURATION_SECONDS: 15,
};

let adWindowRef = null;

/**
 * Opens Monetag Ad in a new tab/window and returns the window reference
 */
export function openMonetagAdTab() {
  if (typeof window === "undefined") return null;

  const monetagAdUrl = `https://libtl.com/sdk.js?zone=11576758`;

  try {
    // Open in dedicated new popup/tab so we can track and close it
    adWindowRef = window.open(
      monetagAdUrl,
      "MonetagAdWindow",
      "width=600,height=750,resizable=yes,scrollbars=yes,status=yes"
    );

    // Also trigger mobile Telegram WebApp if in mobile app
    if (window.Telegram?.WebApp?.openLink && (!adWindowRef || adWindowRef.closed)) {
      window.Telegram.WebApp.openLink(monetagAdUrl, { try_instant_view: false });
    }
  } catch (e) {
    console.error("Ad tab open error:", e);
  }

  return adWindowRef;
}

/**
 * Check if the external ad tab/window was closed early
 */
export function isAdTabClosed() {
  if (!adWindowRef) return false;
  try {
    return adWindowRef.closed;
  } catch (_) {
    return false;
  }
}

/**
 * Automatically close the opened ad window/tab after 15 seconds
 */
export function closeMonetagAdTab() {
  if (adWindowRef && !adWindowRef.closed) {
    try {
      adWindowRef.close();
    } catch (e) {
      console.error("Could not auto-close ad tab:", e);
    }
    adWindowRef = null;
  }
}
