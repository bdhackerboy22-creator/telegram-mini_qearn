// Monetag Official Rewarded Popup SDK Handler (Zone: 11576758)

export const MONETAG_CONFIG = {
  ZONE_ID: "11576758",
  REWARD_PER_AD: 25,
  DAILY_REWARD: 50,
};

/**
 * Trigger Monetag Official Rewarded Popup Ad using show_11576758('pop')
 * ONLY Popup Ad - No external links or redirects!
 */
export function playMonetagRewardedPopup() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      return reject(new Error("Window is not defined"));
    }

    // Function to trigger the official Monetag popup function
    const triggerSdk = () => {
      if (typeof window.show_11576758 === "function") {
        console.log("Triggering Monetag official rewarded popup: show_11576758('pop')");
        
        window
          .show_11576758("pop")
          .then(() => {
            // User completed or closed the rewarded popup ad
            console.log("Monetag Rewarded popup ad completed successfully!");
            resolve({ success: true, reward: MONETAG_CONFIG.REWARD_PER_AD });
          })
          .catch((e) => {
            console.error("Monetag popup playback error / dismissed:", e);
            // In case of error during playback
            reject(e || new Error("Ad playback error"));
          });
        return true;
      }
      return false;
    };

    // 1. Try if already loaded on window
    if (triggerSdk()) {
      return;
    }

    // 2. If SDK script is not loaded yet, inject it dynamically and wait for ready
    let scriptTag = document.querySelector('script[data-sdk="show_11576758"]');
    if (!scriptTag) {
      scriptTag = document.createElement("script");
      scriptTag.src = "https://libtl.com/sdk.js";
      scriptTag.setAttribute("data-zone", "11576758");
      scriptTag.setAttribute("data-sdk", "show_11576758");
      document.head.appendChild(scriptTag);
    }

    // Poll until window.show_11576758 is ready
    let checks = 0;
    const interval = setInterval(() => {
      checks++;
      if (triggerSdk()) {
        clearInterval(interval);
      } else if (checks > 20) {
        clearInterval(interval);
        reject(new Error("Monetag SDK could not be loaded. Please disable AdBlocker."));
      }
    }, 150);
  });
}
