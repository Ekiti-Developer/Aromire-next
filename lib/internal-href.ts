/**
 * Normalize a CMS-supplied link. Route segments are case-insensitive in the
 * authoring UI but case-sensitive in Next.js, so `/VOLUNTEER` would 404.
 * Slugs, query strings and fragments are left untouched.
 */
export function normalizeInternalHref(raw?: string | null, fallback = "/volunteer"): string {
  const value = raw?.trim();
  if (!value) return fallback;
  if (/^https?:\/\//i.test(value)) return value;

  const split = value.search(/[?#]/);
  const path = split === -1 ? value : value.slice(0, split);
  const suffix = split === -1 ? "" : value.slice(split);

  const segments = path.split("/");
  if (segments[1]) segments[1] = segments[1].toLowerCase();
  const normalized = segments.join("/");

  return normalized.startsWith("/") ? `${normalized}${suffix}` : `/${normalized}${suffix}`;
}
