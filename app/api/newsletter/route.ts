import { setDefaultResultOrder } from "node:dns";
import { NextResponse } from "next/server";

import { brevoFetch } from "@/lib/brevo";
import { clientKey, rateLimit } from "@/lib/rate-limit";

setDefaultResultOrder("ipv4first");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  if (!rateLimit(`newsletter:${clientKey(request)}`, 5)) {
    return NextResponse.json({ error: "Too many requests. Please try again in a minute." }, { status: 429 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const body = payload as Record<string, unknown>;
  if (typeof body.website === "string" && body.website.trim()) {
    return NextResponse.json({ ok: true });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!emailPattern.test(email) || email.length > 254 || body.consent !== true) {
    return NextResponse.json({ error: "Enter a valid email address and tick the consent box." }, { status: 400 });
  }

  const apiKey = process.env.BREVO_API_KEY;
  const listId = Number(process.env.BREVO_CONTACT_LIST_ID);
  if (!apiKey || !Number.isSafeInteger(listId) || listId <= 0) {
    return NextResponse.json({ error: "Newsletter signup is not configured yet." }, { status: 503 });
  }

  try {
    const response = await brevoFetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email,
        attributes: {},
        listIds: [listId],
        emailBlacklisted: false,
        smsBlacklisted: false,
        updateEnabled: true,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error("Brevo newsletter signup failed with status", response.status);
      return NextResponse.json({ error: "We couldn't save your subscription. Please try again." }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Brevo newsletter request failed", error);
    return NextResponse.json({ error: "We couldn't reach the newsletter service. Please try again." }, { status: 502 });
  }
}
