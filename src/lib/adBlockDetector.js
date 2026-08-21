// AdBlocker & Private DNS Detection Utility

/**
 * Checks if AdBlocker or Private DNS is blocking ad networks.
 * Tests multiple standard ad endpoints and script behaviors.
 */
export async function detectAdBlocker() {
  if (typeof window === "undefined") return false;

  let isBlocked = false;

  // 1. Check if Monetag SDK function is missing due to script blocking
  if (typeof window.show_11576758 !== "function") {
    // Try pinging standard ad script / dummy ad pixel
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch("https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js", {
        method: "HEAD",
        mode: "no-cors",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
    } catch (err) {
      // Failed to reach ad servers -> DNS / AdBlock active!
      isBlocked = true;
    }
  }

  // 2. DOM Bait Element Test
  try {
    const bait = document.createElement("div");
    bait.className = "pub_300x250 pub_300x250m pub_728x90 text-ad textAds banner-ad adsbox";
    bait.style.position = "absolute";
    bait.style.left = "-9999px";
    bait.style.top = "-9999px";
    bait.style.height = "100px";
    bait.style.width = "100px";
    document.body.appendChild(bait);

    if (
      bait.offsetParent === null ||
      bait.offsetHeight === 0 ||
      bait.offsetLeft === 0 ||
      bait.offsetTop === 0 ||
      bait.offsetWidth === 0 ||
      bait.clientHeight === 0 ||
      bait.clientWidth === 0
    ) {
      isBlocked = true;
    }

    document.body.removeChild(bait);
  } catch (_) {}

  return isBlocked;
}
