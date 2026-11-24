/**
 * Freshness and replay protection for Sanity webhook signatures.
 *
 * @sanity/webhook validates the HMAC but only checks that the timestamp is
 * after Jan 2021. Without an upper bound, a captured signature can be replayed
 * forever. This module rejects stale/future timestamps and records consumed
 * signatures so an exact request cannot be replayed inside the valid window.
 */

const TIMESTAMP_PATTERN = /^t=(\d+),/;
const MAX_AGE_MS = 5 * 60 * 1000;
const MAX_FUTURE_SKEW_MS = 60 * 1000;
const MAX_REMEMBERED = 500;

const consumed = new Map<string, number>();

export type FreshnessResult =
  | { ok: true }
  | { ok: false; status: 401; error: string };

/**
 * Validate the age of a `t=<ms>,v1=<sig>` header and consume it. The HMAC must
 * still be verified separately with `isValidSignature`.
 */
export function verifyWebhookFreshness(signature: string, now = Date.now()): FreshnessResult {
  const normalized = signature.trim();
  const match = TIMESTAMP_PATTERN.exec(normalized);
  if (!match) {
    return { ok: false, status: 401, error: "Invalid webhook signature." };
  }

  const timestamp = Number(match[1]);
  if (!Number.isSafeInteger(timestamp)) {
    return { ok: false, status: 401, error: "Invalid webhook signature." };
  }

  const age = now - timestamp;
  if (age < -MAX_FUTURE_SKEW_MS) {
    return { ok: false, status: 401, error: "Webhook timestamp is in the future." };
  }
  if (age > MAX_AGE_MS) {
    return { ok: false, status: 401, error: "Webhook timestamp is too old." };
  }

  if (consumed.size > MAX_REMEMBERED) {
    for (const [value, seenAt] of consumed) {
      if (now - seenAt > MAX_AGE_MS + MAX_FUTURE_SKEW_MS) consumed.delete(value);
    }
  }

  if (consumed.has(normalized)) {
    return { ok: false, status: 401, error: "Webhook signature has already been used." };
  }
  consumed.set(normalized, now);
  return { ok: true };
}
