import test, { after } from "node:test";
import assert from "node:assert/strict";

import { getSiteUrl } from "./site-url.ts";

const originalSiteUrl = process.env.SITE_URL;
const originalPublicSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

function setEnv(siteUrl?: string, publicSiteUrl?: string) {
  if (siteUrl === undefined) delete process.env.SITE_URL;
  else process.env.SITE_URL = siteUrl;
  if (publicSiteUrl === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
  else process.env.NEXT_PUBLIC_SITE_URL = publicSiteUrl;
}

after(() => setEnv(originalSiteUrl, originalPublicSiteUrl));

test("falls back to a safe local URL when nothing is configured", () => {
  setEnv();
  assert.equal(getSiteUrl(), "http://localhost:3000");
});

test("uses the configured canonical origin", () => {
  setEnv("https://aromire-eko.example");
  assert.equal(getSiteUrl(), "https://aromire-eko.example");
});

test("normalizes trailing slashes and preserves a path prefix", () => {
  setEnv("https://aromire-eko.example/");
  assert.equal(getSiteUrl(), "https://aromire-eko.example");
  setEnv("https://aromire-eko.example/blog/");
  assert.equal(getSiteUrl(), "https://aromire-eko.example/blog");
});

test("SITE_URL takes precedence over the legacy public variable", () => {
  setEnv("https://private.example", "https://public.example");
  assert.equal(getSiteUrl(), "https://private.example");
});

test("the legacy public variable still works", () => {
  setEnv(undefined, "https://public.example");
  assert.equal(getSiteUrl(), "https://public.example");
});

test("invalid or credentialed URLs fall back instead of being reflected", () => {
  for (const value of ["javascript:alert(1)", "https://user:pass@example.com", "not a url"]) {
    setEnv(value);
    assert.equal(getSiteUrl(), "http://localhost:3000", value);
  }
});

test("a spoofed request Host cannot influence the result", () => {
  setEnv("https://aromire-eko.example");
  const request = new Request("http://evil.example/sitemap.xml", {
    headers: { host: "evil.example", "x-forwarded-host": "evil.example" },
  });
  // getSiteUrl deliberately accepts no request argument.
  assert.equal(getSiteUrl(), "https://aromire-eko.example");
  void request;
});
