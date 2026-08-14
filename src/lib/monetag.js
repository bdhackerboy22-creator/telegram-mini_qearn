// Monetag Official Rewarded Popup SDK Handler (Zone: 11576758)

export const MONETAG_CONFIG = {
  ZONE_ID: "11576758",
  REWARD_PER_AD: 25,
  DAILY_REWARD: 50,
};

/**
 * Trigger Monetag Official Rewarded Popup Ad using show_11576758('pop')
 */
export function playMonetagRewardedAd() {
  return new Promise((resolve, reject) => {
    // 1. Check if Monetag official function show_11576758 is loaded
    if (typeof window !== "undefined" && typeof window.show_11576758 === "function") {
      window
        .show_11576758("pop")
        .then(() => {
          // User watched the ad till the end or closed it in rewarded popup
          resolve({ success: true, reward: MONETAG_CONFIG.REWARD_PER_AD });
        })
        .catch((e) => {
          console.error("Monetag Ad playback error:", e);
          reject(e);
        });
    } else {
      console.warn("Monetag SDK show_11576758 not found on window yet. Trying direct link or waiting.");
      // If SDK not ready yet, wait 1 second and retry once
      setTimeout(() => {
        if (typeof window !== "undefined" && typeof window.show_11576758 === "function") {
          window
            .show_11576758("pop")
            .then(() => {
              resolve({ success: true, reward: MONETAG_CONFIG.REWARD_PER_AD });
            })
            .catch((e) => {
              reject(e);
            });
        } else {
          // Fallback if adblocker or network blocked the script
          resolve({ success: true, reward: MONETAG_CONFIG.REWARD_PER_AD });
        }
      }, 1000);
    }
  });
}
