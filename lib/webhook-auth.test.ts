import test from "node:test";
import assert from "node:assert/strict";

import { verifyWebhookFreshness } from "./webhook-auth.ts";

const NOW = 1_800_000_000_000;

function sig(id: string, timestamp: number) {
  return `t=${timestamp},v1=${id}`;
}

test("accepts a signature inside the freshness window", () => {
  assert.equal(verifyWebhookFreshness(sig("fresh-1", NOW - 60_000), NOW).ok, true);
});

test("rejects a signature from 2021 - the original replay exploit", () => {
  const result = verifyWebhookFreshness(sig("old-1", 1_609_459_200_000), NOW);
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.error, /too old/);
});

test("rejects a timestamp too far in the future", () => {
  const result = verifyWebhookFreshness(sig("future-1", NOW + 5 * 60_000), NOW);
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.error, /future/);
});

test("allows small clock skew", () => {
  assert.equal(verifyWebhookFreshness(sig("skew-1", NOW + 30_000), NOW).ok, true);
});

test("rejects malformed signature headers", () => {
  assert.equal(verifyWebhookFreshness("garbage", NOW).ok, false);
  assert.equal(verifyWebhookFreshness("t=abc,v1=x", NOW).ok, false);
});

test("rejects an exact replay of a consumed signature", () => {
  const signature = sig("replay-1", NOW - 1000);
  assert.equal(verifyWebhookFreshness(signature, NOW).ok, true);
  const replay = verifyWebhookFreshness(signature, NOW + 1000);
  assert.equal(replay.ok, false);
  if (!replay.ok) assert.match(replay.error, /already been used/);
});

test("normalizes whitespace in replay detection", () => {
  const signature = sig("replay-2", NOW - 1000);
  assert.equal(verifyWebhookFreshness(signature, NOW).ok, true);
  assert.equal(verifyWebhookFreshness(`  ${signature}  `, NOW + 1000).ok, false);
});
