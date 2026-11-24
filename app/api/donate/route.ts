import { setDefaultResultOrder } from "node:dns";
import { NextResponse } from "next/server";

import { brevoFetch } from "@/lib/brevo";
import { clientKey, rateLimit } from "@/lib/rate-limit";

setDefaultResultOrder("ipv4first");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+\d\s()-]{7,32}$/;

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

export async function POST(request: Request) {
  if (!rateLimit(`donate:${clientKey(request)}`, 5)) {
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

  const fullName = typeof body.fullName === "string" ? body.fullName.trim().replace(/\s+/g, " ") : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const marketing = body.marketing === true;

  if (!fullName || fullName.length > 120 || !emailPattern.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Enter your name and a valid email address." }, { status: 400 });
  }
  if (phone && !phonePattern.test(phone)) {
    return NextResponse.json({ error: "Enter a valid phone number or leave it blank." }, { status: 400 });
  }
  if (body.consent !== true) {
    return NextResponse.json({ error: "Please agree to be contacted about giving." }, { status: 400 });
  }

  const apiKey = process.env.BREVO_API_KEY;
  const donationListId = Number(process.env.BREVO_DONATION_LIST_ID);
  const contactListId = Number(process.env.BREVO_CONTACT_LIST_ID);
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const recipientEmail = process.env.BREVO_RECIPIENT_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "Aromire-Eko";

  if (
    !apiKey ||
    !Number.isSafeInteger(donationListId) ||
    donationListId <= 0 ||
    !senderEmail ||
    !recipientEmail
  ) {
    return NextResponse.json({ error: "Donation contact signup is not configured yet." }, { status: 503 });
  }
  if (marketing && (!Number.isSafeInteger(contactListId) || contactListId <= 0)) {
    return NextResponse.json({ error: "Marketing list is not configured yet. Please try again later." }, { status: 503 });
  }

  const listIds = [donationListId];
  if (marketing && contactListId !== donationListId) listIds.push(contactListId);

  const [firstName, ...rest] = fullName.split(" ");
  const lastName = rest.join(" ");
  const attributes: Record<string, string> = { FIRSTNAME: firstName };
  if (lastName) attributes.LASTNAME = lastName;
  if (phone) attributes.PHONE = phone;

  try {
    const contactResponse = await brevoFetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: { accept: "application/json", "api-key": apiKey, "content-type": "application/json" },
      body: JSON.stringify({
        email,
        attributes,
        listIds,
        emailBlacklisted: false,
        smsBlacklisted: false,
        updateEnabled: true,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!contactResponse.ok) {
      console.error("Brevo donor contact upsert failed with status", contactResponse.status);
      return NextResponse.json({ error: "We couldn't save your details. Please try again." }, { status: 502 });
    }

    const lines = [
      `Name: ${fullName}`,
      `Email: ${email}`,
      `Phone: ${phone || "Not provided"}`,
      `Updates/opt-ins: ${marketing ? "yes" : "no"}`,
    ];
    const emailResponse = await brevoFetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { accept: "application/json", "api-key": apiKey, "content-type": "application/json" },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: recipientEmail }],
        replyTo: { email, name: fullName },
        subject: `Donation interest from ${fullName}`,
        textContent: lines.join("\n"),
        htmlContent: [
          `<p><strong>Name:</strong> ${escapeHtml(fullName)}</p>`,
          `<p><strong>Email:</strong> ${escapeHtml(email)}</p>`,
          `<p><strong>Phone:</strong> ${escapeHtml(phone || "Not provided")}</p>`,
          `<p><strong>Updates/opt-ins:</strong> ${marketing ? "yes" : "no"}</p>`,
        ].join(""),
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!emailResponse.ok) {
      console.error("Brevo donation notification failed with status", emailResponse.status);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Brevo donation request failed", error);
    return NextResponse.json({ error: "We couldn't reach the donation service. Please try again." }, { status: 502 });
  }
}
