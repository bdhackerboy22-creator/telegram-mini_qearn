// Monetag Official Rewarded Popup SDK Handler (Zone: 11576758)

export const MONETAG_CONFIG = {
  ZONE_ID: "11576758",
  REWARD_PER_AD: 25,
  DAILY_REWARD: 50,
};

/**
 * Trigger Monetag Official Rewarded Popup Ad using show_11576758('pop')
 * with robust SDK loader & fallbacks for Telegram Mobile WebApp
 */
export function playMonetagRewardedAd() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      return reject(new Error("Window not available"));
    }

    // Function to execute the popup ad
    const triggerSdkPop = () => {
      if (typeof window.show_11576758 === "function") {
        window
          .show_11576758("pop")
          .then(() => {
            // User completed the rewarded popup
            resolve({ success: true, reward: MONETAG_CONFIG.REWARD_PER_AD });
          })
          .catch((err) => {
            console.error("Monetag popup playback error:", err);
            // Even if dismissed or interstitial closed, consider completed
            resolve({ success: true, reward: MONETAG_CONFIG.REWARD_PER_AD });
          });
        return true;
      }
      return false;
    };

    // 1. If already available in window
    if (triggerSdkPop()) {
      return;
    }

    // 2. If SDK is still loading, dynamically inject or wait for it
    let existingScript = document.querySelector('script[data-sdk="show_11576758"]');
    if (!existingScript) {
      existingScript = document.createElement("script");
      existingScript.src = "//libtl.com/sdk.js";
      existingScript.setAttribute("data-zone", "11576758");
      existingScript.setAttribute("data-sdk", "show_11576758");
      document.head.appendChild(existingScript);
    }

    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (triggerSdkPop()) {
        clearInterval(interval);
      } else if (attempts > 15) {
        // Max 3 seconds wait
        clearInterval(interval);
        reject(new Error("Monetag SDK could not be loaded on this network."));
      }
    }, 200);
  });
}
