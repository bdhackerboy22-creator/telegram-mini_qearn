// Monetag Rewarded Interstitial SDK Handler

export const MONETAG_CONFIG = {
  ZONE_ID: "11576758",
};

/**
 * Trigger Monetag Official Rewarded Interstitial Ad
 * Returns a promise with status { success: boolean, adShown: boolean, error?: string }
 */
export function playMonetagRewardedInterstitial() {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      return resolve({ success: true, adShown: true });
    }

    // If official SDK function exists on window
    if (typeof window.show_11576758 === "function") {
      console.log("Invoking Monetag show_11576758()...");

      window
        .show_11576758()
        .then(() => {
          console.log("Monetag Ad playback officially completed & closed by user!");
          resolve({ success: true, adShown: true });
        })
        .catch((err) => {
          console.warn("Monetag Ad failed or was blocked:", err);
          resolve({ success: false, adShown: false, error: err?.message || "Ad playback blocked" });
        });
    } else {
      console.warn("show_11576758 function not found on window (Script likely blocked by DNS)");
      resolve({ success: false, adShown: false, error: "Monetag script blocked by Private DNS" });
    }
  });
}
