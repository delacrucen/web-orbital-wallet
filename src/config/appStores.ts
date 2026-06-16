/**
 * App store destinations + device detection, shared by the download badges, the
 * QR modal, and the `/download` redirect route.
 *
 * NOTE: these are placeholder listings (Google's own apps) until Orbital
 * Wallet's real store pages exist — swap the URLs here when they do.
 */

export const APP_STORES = {
  ios: "https://apps.apple.com/us/app/google/id284815942",
  android:
    "https://play.google.com/store/apps/details?id=com.google.android.googlequicksearchbox",
} as const;

export type DevicePlatform = "ios" | "android" | "other";

/** Best-effort OS sniff from the user agent (for store redirection only). */
export function detectPlatform(
  ua: string = typeof navigator !== "undefined" ? navigator.userAgent : "",
): DevicePlatform {
  if (/android/i.test(ua)) return "android";
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  // iPadOS 13+ masquerades as desktop Safari — fall back to touch points.
  if (
    /macintosh/i.test(ua) &&
    typeof navigator !== "undefined" &&
    navigator.maxTouchPoints > 1
  ) {
    return "ios";
  }
  return "other";
}

/** Store URL for a platform, or null when it isn't a mobile OS we ship to. */
export function storeUrlFor(platform: DevicePlatform): string | null {
  if (platform === "ios") return APP_STORES.ios;
  if (platform === "android") return APP_STORES.android;
  return null;
}
