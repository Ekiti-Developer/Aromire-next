/**
 * Guard for authored `alt` text. CMS values are trusted verbatim today, so a
 * placeholder such as "SETUP PICTURE" ends up in link names and is announced
 * as if it were field evidence. Placeholder-only values are discarded.
 */

const PLACEHOLDER_TOKENS = new Set([
  "setup", "picture", "image", "photo", "img", "dsc", "placeholder", "sample",
  "test", "temp", "dummy", "untitled", "screenshot", "lorem", "ipsum", "default",
]);

function isPlaceholder(value: string): boolean {
  const tokens = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
  if (tokens.length === 0) return true;
  return tokens.every((token) => PLACEHOLDER_TOKENS.has(token) || /^\d+$/.test(token));
}

export function normalizeAlt(value: string | null | undefined, fallback = ""): string {
  const alt = value?.trim() ?? "";
  if (alt.length < 3 || isPlaceholder(alt)) return fallback;
  return alt;
}
