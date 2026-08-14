// Monetag Official Popup & Direct Ad Handler for Telegram Mini App

export const MONETAG_CONFIG = {
  ZONE_ID: "11576758",
  // Monetag Official Direct SmartLink for Android & Web
  DIRECT_AD_URL: "https://otieuwou.com/4/11576758",
  REWARD_PER_AD: 25,
  DAILY_REWARD: 50,
  AD_DURATION_SECONDS: 15,
};

let adWindowRef = null;

/**
 * Trigger Monetag Ad:
 * 1. Executes official SDK show_11576758('pop') for overlay popup
 * 2. Opens real Ad SmartLink in a manageable tab for 15s session tracking
 */
export function openMonetagAdTab() {
  if (typeof window === "undefined") return null;

  // 1. Trigger SDK pop if loaded
  if (typeof window.show_11576758 === "function") {
    try {
      window.show_11576758("pop").catch(() => {});
    } catch (_) {}
  }

  // 2. Open Real Monetag Ad URL (Not libtl script file)
  const adUrl = MONETAG_CONFIG.DIRECT_AD_URL;

  try {
    adWindowRef = window.open(
      adUrl,
      "MonetagAdTab",
      "width=500,height=700,resizable=yes,scrollbars=yes"
    );

    // If mobile telegram WebView blocked window.open, use Telegram openLink API
    if (window.Telegram?.WebApp?.openLink && (!adWindowRef || adWindowRef.closed)) {
      window.Telegram.WebApp.openLink(adUrl, { try_instant_view: false });
    }
  } catch (err) {
    console.error("Ad tab open exception:", err);
  }

  return adWindowRef;
}

/**
 * Check if user closed the Ad tab before 15 seconds
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
      console.warn("Auto close ad tab:", e);
    }
    adWindowRef = null;
  }
}
