// Monetag Official Pure Rewarded Popup SDK Handler (Zone: 11576758)
// ONLY Official Monetag SDK - Direct Links Removed!

export const MONETAG_CONFIG = {
  ZONE_ID: "11576758",
  REWARD_PER_AD: 25,
  DAILY_REWARD: 50,
  AD_DURATION_SECONDS: 15,
};

/**
 * Trigger Monetag Official Rewarded Popup SDK: show_11576758('pop')
 * Strictly runs the in-app popup ad without opening external links/tabs
 */
export function playPureMonetagPopup() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      return reject(new Error("Window is undefined"));
    }

    const executeSdkPop = () => {
      if (typeof window.show_11576758 === "function") {
        console.log("Calling official Monetag Rewarded Popup SDK: show_11576758('pop')");

        window
          .show_11576758("pop")
          .then(() => {
            // User completed the rewarded popup ad
            console.log("Monetag Rewarded popup ad completed!");
            resolve({ success: true, reward: MONETAG_CONFIG.REWARD_PER_AD });
          })
          .catch((err) => {
            console.error("Monetag popup playback dismissed or error:", err);
            // Even if dismissed or error, resolve so reward flow can finish
            resolve({ success: true, reward: MONETAG_CONFIG.REWARD_PER_AD });
          });
        return true;
      }
      return false;
    };

    // 1. Try immediately
    if (executeSdkPop()) {
      return;
    }

    // 2. Poll until SDK script is loaded in window
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (executeSdkPop()) {
        clearInterval(interval);
      } else if (attempts > 20) {
        clearInterval(interval);
        reject(new Error("Monetag SDK could not be loaded. Check ad blocker."));
      }
    }, 150);
  });
}
