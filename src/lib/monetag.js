// Monetag In-App Overlay/Interstitial Trigger Configuration

export const MONETAG_CONFIG = {
  ZONE_ID: "11576758",
  SESSION_DURATION_SECONDS: 15,
  REWARD_PER_AD: 25,
  DAILY_REWARD: 50,
};

/**
 * Trigger Monetag Ad inside the app using official SDK show_11576758
 */
export function triggerMonetagAdInApp() {
  if (typeof window === "undefined") return;

  if (typeof window.show_11576758 === "function") {
    try {
      window.show_11576758("pop").catch((e) => {
        console.warn("Monetag playback notice:", e);
      });
    } catch (e) {
      console.warn("Monetag invocation error:", e);
    }
  }
}
