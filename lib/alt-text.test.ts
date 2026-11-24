import test from "node:test";
import assert from "node:assert/strict";

import { normalizeAlt } from "./alt-text.ts";

test("keeps a real authored description", () => {
  assert.equal(normalizeAlt("Women sorting produce at the Ijora market", "Title"), "Women sorting produce at the Ijora market");
});

test("rejects the SETUP PICTURE placeholder", () => {
  assert.equal(normalizeAlt("SETUP PICTURE", "Program title"), "Program title");
  assert.equal(normalizeAlt("setup picture", "Program title"), "Program title");
});

test("rejects other placeholder-only values", () => {
  for (const value of ["image", "IMG_1234", "Photo", "test image", "", "   "]) {
    assert.equal(normalizeAlt(value, "Fallback"), "Fallback", value);
  }
});

test("keeps short but meaningful names", () => {
  assert.equal(normalizeAlt("Amina", "Participant"), "Amina");
  assert.equal(normalizeAlt("Logo", "Fallback"), "Logo");
});

test("decorative images can request an empty fallback", () => {
  assert.equal(normalizeAlt("SETUP PICTURE"), "");
});
