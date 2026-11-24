type Bucket = { count: number; reset: number };

const buckets = new Map<string, Bucket>();

/** Lightweight in-process throttle. Suitable for reducing casual abuse, not a distributed rate limiter. */
export function rateLimit(key: string, limit = 5, windowMs = 60_000): boolean {
  const now = Date.now();

  if (buckets.size > 1000) {
    for (const [id, bucket] of buckets) {
      if (bucket.reset < now) buckets.delete(id);
    }
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

const IPV4 = /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;
const IPV6 = /^[0-9a-fA-F:.]+$/;

function isIpAddress(value: string): boolean {
  return IPV4.test(value) || (value.includes(":") && IPV6.test(value));
}

/**
 * Number of trusted proxies between this app and the public internet.
 *
 * `X-Forwarded-For` is a chain (`client, proxy1, proxy2`) whose leading value
 * is entirely client-controlled. Only a proxy we control can append the real
 * peer address, so we read the entry that many hops from the *right* and
 * ignore everything the client supplied.
 *
 * The default of 0 means there is no trusted proxy (local/dev, or the app is
 * directly exposed). Client-supplied IP headers are then ignored completely
 * and all callers share one anonymous bucket. Set this to the number of
 * trusted hops in production, e.g. 1 for a single edge proxy.
 */
const configuredHops = (() => {
  const raw = Number.parseInt(process.env.TRUSTED_PROXY_HOPS ?? "0", 10);
  return Number.isSafeInteger(raw) && raw >= 0 && raw <= 10 ? raw : 0;
})();

export function clientKey(request: Request, trustedProxyHops = configuredHops): string {
  if (trustedProxyHops > 0) {
    const chain = (request.headers.get("x-forwarded-for") ?? "")
      .split(",")
      .map((part) => part.trim())
      .filter(isIpAddress);

    // Drop the trusted hops from the right; a spoofed leading value can never
    // land at this index as long as the proxy appends the real peer address.
    const index = chain.length - trustedProxyHops;
    if (index >= 0) return chain[index];
  }

  // No trusted proxy configured (or no usable chain): never trust an IP
  // header the client can set. Fall back to a single shared bucket.
  return "anonymous";
}
