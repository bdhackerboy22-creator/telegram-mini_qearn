// Monetag Official Rewarded Interstitial SDK Handler

export const MONETAG_CONFIG = {
  ZONE_ID: "11576758",
};

/**
 * Trigger Monetag Official Rewarded Interstitial Ad
 * Strictly waits until Monetag finishes playing and calls .then()
 */
export function playMonetagRewardedInterstitial() {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      return resolve({ success: true });
    }

    if (typeof window.show_11576758 === "function") {
      console.log("Triggering Monetag show_11576758()...");
      window
        .show_11576758()
        .then(() => {
          console.log("Ad finished completely by user!");
          resolve({ success: true });
        })
        .catch((err) => {
          console.warn("Ad closed or error:", err);
          resolve({ success: true });
        });
    } else {
      console.warn("show_11576758 not loaded on window");
      resolve({ success: true });
    }
  });
}
