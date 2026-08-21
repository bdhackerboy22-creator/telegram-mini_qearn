// AdBlocker & Private DNS Detection Utility

/**
 * Checks if AdBlocker or Private DNS is blocking ad networks.
 * Tests Monetag domain, Google AdSense, standard ad networks and DOM elements.
 */
export async function detectAdBlocker() {
  if (typeof window === "undefined") return false;

  // 1. Direct Monetag SDK check
  if (typeof window.show_11576758 !== "function") {
    return true;
  }

  // 2. Fetch test against known ad domains
  const adEndpoints = [
    "https://libtl.com/sdk.js",
    "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js",
    "https://adservice.google.com/adsid/integrator.js",
  ];

  for (const url of adEndpoints) {
    try {
      const res = await fetch(url, {
        method: "HEAD",
        mode: "no-cors",
        cache: "no-store",
      });
    } catch (err) {
      // If network fetch fails with TypeError (Failed to fetch), DNS / AdBlocker is 100% active
      return true;
    }
  }

  // 3. DOM Bait Element Test
  try {
    const bait = document.createElement("div");
    bait.className = "adsbygoogle ads-box ad-banner sponsored-post pub_300x250 pub_728x90 text-ad";
    bait.style.position = "absolute";
    bait.style.left = "-9999px";
    bait.style.top = "-9999px";
    bait.style.height = "10px";
    bait.style.width = "10px";
    document.body.appendChild(bait);

    const isHidden =
      bait.offsetParent === null ||
      bait.offsetHeight === 0 ||
      bait.offsetWidth === 0 ||
      window.getComputedStyle(bait).display === "none" ||
      window.getComputedStyle(bait).visibility === "hidden";

    document.body.removeChild(bait);
    if (isHidden) return true;
  } catch (_) {}

  return false;
}
