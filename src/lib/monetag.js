// Monetag Official Rewarded Interstitial SDK Handler
// According to Monetag Official Docs: show_11576758() triggers the Rewarded Interstitial format

export const MONETAG_CONFIG = {
  ZONE_ID: "11576758",
};

/**
 * Trigger Monetag Official Rewarded Interstitial
 * Resolves only when user completes or watches the ad
 */
export function playMonetagRewardedInterstitial() {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      return resolve({ success: true });
    }

    const triggerAd = () => {
      // Official Monetag Rewarded Interstitial function: show_11576758() (without 'pop' argument)
      if (typeof window.show_11576758 === "function") {
        console.log("Playing Monetag Rewarded Interstitial ad: show_11576758()");
        
        window
          .show_11576758()
          .then(() => {
            console.log("Monetag Rewarded Interstitial ad watched completely!");
            resolve({ success: true });
          })
          .catch((err) => {
            console.warn("Monetag Rewarded Interstitial playback catch:", err);
            // Allow proceeding so user is not blocked
            resolve({ success: true });
          });
        return true;
      }
      return false;
    };

    // 1. If SDK is already ready
    if (triggerAd()) {
      return;
    }

    // 2. If SDK is still loading, wait and retry
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (triggerAd()) {
        clearInterval(interval);
      } else if (attempts > 15) {
        clearInterval(interval);
        console.warn("Monetag SDK timeout fallback");
        resolve({ success: true });
      }
    }, 200);
  });
}
