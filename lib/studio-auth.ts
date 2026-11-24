import { createHash, timingSafeEqual } from "node:crypto";

/** Access policy for the embedded Sanity Studio route. */
export type StudioAuthConfig = {
  user?: string;
  password?: string;
  isProduction: boolean;
};

function safeEqual(left: string, right: string): boolean {
  // Hash first so both inputs are always the same length for timingSafeEqual.
  const a = createHash("sha256").update(left).digest();
  const b = createHash("sha256").update(right).digest();
  return timingSafeEqual(a, b);
}

/** Parse and check an HTTP Basic `Authorization` header. */
export function isBasicAuthValid(
  authorization: string | null | undefined,
  user: string,
  password: string,
): boolean {
  if (!authorization) return false;

  const match = /^Basic\s+([A-Za-z0-9+/=]+)$/i.exec(authorization.trim());
  if (!match) return false;

  let decoded: string;
  try {
    decoded = Buffer.from(match[1], "base64").toString("utf8");
  } catch {
    return false;
  }

  const separator = decoded.indexOf(":");
  if (separator < 0) return false;

  return (
    safeEqual(decoded.slice(0, separator), user) &&
    safeEqual(decoded.slice(separator + 1), password)
  );
}

/** Whether Studio credentials have been configured. */
export function isStudioAuthConfigured(config: StudioAuthConfig): boolean {
  return Boolean(config.user && config.password);
}

/**
 * When credentials exist they are required everywhere. Without them the Studio
 * is hidden in production but stays usable on a local development machine.
 */
export function isStudioAccessAllowed(
  config: StudioAuthConfig,
  authorization: string | null | undefined,
): boolean {
  if (config.user && config.password) {
    return isBasicAuthValid(authorization, config.user, config.password);
  }
  return !config.isProduction;
}
