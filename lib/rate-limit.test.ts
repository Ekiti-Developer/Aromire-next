import test from "node:test";
import assert from "node:assert/strict";

import { clientKey, rateLimit } from "./rate-limit.ts";

function requestWith(headers: Record<string, string>) {
  return new Request("http://localhost/api/newsletter", { method: "POST", headers });
}

test("client-supplied x-forwarded-for cannot split the bucket without a trusted proxy", () => {
  const a = clientKey(requestWith({ "x-forwarded-for": "10.0.0.1" }), 0);
  const b = clientKey(requestWith({ "x-forwarded-for": "203.0.113.5, 8.8.8.8" }), 0);
  const c = clientKey(requestWith({ "x-real-ip": "192.0.2.44" }), 0);

  assert.equal(a, "anonymous");
  assert.equal(b, "anonymous");
  assert.equal(c, "anonymous");
});

test("a trusted proxy hop uses the peer address the proxy appended", () => {
  const req = requestWith({ "x-forwarded-for": "1.2.3.4, 203.0.113.9" });
  assert.equal(clientKey(req, 1), "203.0.113.9");
});

test("a long spoofed chain still resolves to the proxy-appended address", () => {
  const req = requestWith({ "x-forwarded-for": "9.9.9.9, 8.8.8.8, 7.7.7.7, 203.0.113.9" });
  assert.equal(clientKey(req, 1), "203.0.113.9");
});

test("multiple trusted hops skip the proxy chain from the right", () => {
  const req = requestWith({ "x-forwarded-for": "9.9.9.9, 203.0.113.9, 10.0.0.5" });
  assert.equal(clientKey(req, 2), "203.0.113.9");
});

test("malformed or missing forwarding values fall back to the anonymous bucket", () => {
  assert.equal(clientKey(requestWith({ "x-forwarded-for": "not-an-ip" }), 1), "anonymous");
  assert.equal(clientKey(requestWith({}), 1), "anonymous");
});

test("spoofed forwarded-for headers cannot bypass the request limit", () => {
  const prefix = `spoof-test-${Date.now()}`;
  const results = [1, 2, 3, 4, 5, 6].map((n) => {
    const key = clientKey(requestWith({ "x-forwarded-for": `10.0.0.${n}` }), 0);
    return rateLimit(`${prefix}:${key}`, 5);
  });

  assert.deepEqual(results, [true, true, true, true, true, false]);
});
