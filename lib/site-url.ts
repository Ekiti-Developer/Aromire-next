/**
 * Canonical origin for generated URLs (sitemap, robots, metadata).
 *
 * This deliberately never reads the request Host or X-Forwarded-* headers:
 * those are client-controlled and allowed `Host: evil.example` to poison the
 * generated sitemap. Configure the real origin with SITE_URL (or the public
 * NEXT_PUBLIC_SITE_URL for backwards compatibility).
 */

const FALLBACK_SITE_URL = "http://localhost:3000";

export function getSiteUrl(): string {
  const configured = (process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "").trim();
  if (!configured) return FALLBACK_SITE_URL;

  try {
    const parsed = new URL(configured);
    if (
      (parsed.protocol !== "http:" && parsed.protocol !== "https:") ||
      parsed.username ||
      parsed.password
    ) {
      throw new Error("Site URL must be an absolute http(s) URL without credentials");
    }
    const path = parsed.pathname.replace(/\/+$/, "");
    return `${parsed.origin}${path}`;
  } catch {
    console.error("SITE_URL is not a valid absolute http(s) URL; using the local fallback.");
    return FALLBACK_SITE_URL;
  }
}
