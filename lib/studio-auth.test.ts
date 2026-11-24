import test from "node:test";
import assert from "node:assert/strict";

import {
  isBasicAuthValid,
  isStudioAccessAllowed,
  isStudioAuthConfigured,
} from "./studio-auth.ts";

function basic(user: string, password: string) {
  return `Basic ${Buffer.from(`${user}:${password}`).toString("base64")}`;
}

const configured = { user: "editor", password: "s3cret", isProduction: true };

test("configured credentials accept the correct Basic header", () => {
  assert.equal(isBasicAuthValid(basic("editor", "s3cret"), "editor", "s3cret"), true);
});

test("configured credentials reject wrong or missing credentials", () => {
  assert.equal(isBasicAuthValid(basic("editor", "wrong"), "editor", "s3cret"), false);
  assert.equal(isBasicAuthValid(basic("admin", "s3cret"), "editor", "s3cret"), false);
  assert.equal(isBasicAuthValid(null, "editor", "s3cret"), false);
  assert.equal(isBasicAuthValid("Bearer token", "editor", "s3cret"), false);
  assert.equal(isBasicAuthValid("Basic !!!", "editor", "s3cret"), false);
});

test("passwords containing a colon are handled correctly", () => {
  assert.equal(isBasicAuthValid(basic("editor", "a:b:c"), "editor", "a:b:c"), true);
  assert.equal(isBasicAuthValid(basic("editor", "a:b"), "editor", "a:b:c"), false);
});

test("configured Studio requires auth in every environment", () => {
  assert.equal(isStudioAuthConfigured(configured), true);
  assert.equal(isStudioAccessAllowed(configured, basic("editor", "s3cret")), true);
  assert.equal(isStudioAccessAllowed(configured, null), false);
  assert.equal(isStudioAccessAllowed({ ...configured, isProduction: false }, null), false);
});

test("unconfigured Studio is hidden in production", () => {
  const unconfigured = { isProduction: true };
  assert.equal(isStudioAuthConfigured(unconfigured), false);
  assert.equal(isStudioAccessAllowed(unconfigured, null), false);
});

test("unconfigured Studio stays available in development", () => {
  assert.equal(isStudioAccessAllowed({ isProduction: false }, null), true);
});

test("a partial configuration is not treated as configured", () => {
  assert.equal(isStudioAuthConfigured({ user: "editor", isProduction: true }), false);
  assert.equal(isStudioAccessAllowed({ user: "editor", isProduction: true }, basic("editor", "")), false);
});
