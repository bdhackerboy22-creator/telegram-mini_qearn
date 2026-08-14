// Monetag Official Rewarded Interstitial SDK Handler
// According to Monetag Official Docs:
// 1. Script: <script src="//libtl.com/sdk.js" data-zone="11576758" data-sdk="show_11576758"></script>
// 2. Call: show_11576758().then(...)

export const MONETAG_CONFIG = {
  ZONE_ID: "11576758",
  FALLBACK_TIMER_SECONDS: 10,
};

/**
 * Play Monetag Rewarded Interstitial Ad
 * If Monetag ad window is active or blocked, provides guaranteed automatic timer so user is never stuck!
 */
export function playMonetagRewardedInterstitial() {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      return resolve({ success: true });
    }

    let isResolved = false;

    const safeResolve = () => {
      if (!isResolved) {
        isResolved = true;
        resolve({ success: true });
      }
    };

    // 1. Try Calling Monetag Official SDK Function
    if (typeof window.show_11576758 === "function") {
      try {
        console.log("Invoking Monetag Rewarded Interstitial show_11576758()...");
        
        window
          .show_11576758()
          .then(() => {
            console.log("Monetag Rewarded Interstitial completed / closed by user!");
            safeResolve();
          })
          .catch((err) => {
            console.warn("Monetag Rewarded Interstitial closed or error:", err);
            safeResolve();
          });
      } catch (e) {
        console.error("SDK function call exception:", e);
        safeResolve();
      }
    } else {
      console.warn("Monetag show_11576758 function not found on window yet.");
    }

    // 2. Guaranteed Fail-safe Timer (8 seconds):
    // In case Monetag ad closes without triggering callback or if ad blocker prevents overlay
    setTimeout(() => {
      safeResolve();
    }, 8000);
  });
}
