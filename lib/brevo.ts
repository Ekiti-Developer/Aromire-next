/**
 * Brevo's Contacts API can return transient 5xx responses (documented as
 * retryable). Contact upserts use updateEnabled, so replaying the same request
 * is safe. Returns the last response if all attempts fail.
 */
export async function brevoFetch(input: string, init: RequestInit, retries = 2): Promise<Response> {
  for (let attempt = 0; ; attempt += 1) {
    const response = await fetch(input, init);
    if (response.status < 500 || response.status > 599 || attempt >= retries) {
      return response;
    }
    await new Promise((resolve) => setTimeout(resolve, 300 * 2 ** attempt));
  }
}
