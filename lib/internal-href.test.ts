import test from "node:test";
import assert from "node:assert/strict";

import { normalizeInternalHref } from "./internal-href.ts";

test("lowercases an uppercase route segment", () => {
  assert.equal(normalizeInternalHref("/VOLUNTEER"), "/volunteer");
});

test("lowercases the first segment of a nested path but preserves the slug", () => {
  assert.equal(normalizeInternalHref("/PROGRAMS/My-Story"), "/programs/My-Story");
});

test("leaves query strings and fragments intact", () => {
  assert.equal(normalizeInternalHref("/VOLUNTEER?mode=donate#form"), "/volunteer?mode=donate#form");
});

test("adds a leading slash to a bare path", () => {
  assert.equal(normalizeInternalHref("volunteer"), "/volunteer");
});

test("keeps external URLs and missing values", () => {
  assert.equal(normalizeInternalHref("https://Example.com/Donate"), "https://Example.com/Donate");
  assert.equal(normalizeInternalHref(undefined), "/volunteer");
  assert.equal(normalizeInternalHref("   "), "/volunteer");
});
