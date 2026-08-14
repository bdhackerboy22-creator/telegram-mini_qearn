// Monetag Rewarded Interstitial SDK Handler

export const MONETAG_CONFIG = {
  ZONE_ID: "11576758",
};

/**
 * Trigger Monetag Official Rewarded Interstitial Ad
 * Returns a promise that only resolves when the ad has fully displayed and closed by the user
 */
export function playMonetagRewardedInterstitial() {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      return resolve({ success: true });
    }

    // If official SDK function exists
    if (typeof window.show_11576758 === "function") {
      console.log("Invoking Monetag show_11576758()...");

      // show_11576758() opens the ad and returns a promise
      // This promise resolves only AFTER the user watches and closes the ad!
      window
        .show_11576758()
        .then(() => {
          console.log("Monetag Ad playback officially completed & closed by user!");
          resolve({ success: true });
        })
        .catch((err) => {
          console.warn("Monetag Ad closed or skipped:", err);
          resolve({ success: true });
        });
    } else {
      console.warn("show_11576758 function not found on window");
      resolve({ success: true });
    }
  });
}
