import { setDefaultResultOrder } from "node:dns";
import { NextResponse } from "next/server";

import { brevoFetch } from "@/lib/brevo";
import { clientKey, rateLimit } from "@/lib/rate-limit";

setDefaultResultOrder("ipv4first");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+\d\s()-]{7,32}$/;

const INTERESTS = ["Community outreach", "Health support", "Skills training", "Fundraising & partnerships", "Other"] as const;
const AVAILABILITY = ["Weekdays", "Weekends", "Flexible", ""] as const;

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
  if (!rateLimit(`volunteer:${clientKey(request)}`, 5)) {
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
  const interest = typeof body.interest === "string" ? body.interest : "";
  const availability = typeof body.availability === "string" ? body.availability : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const consent = body.consent;
  const marketing = body.marketing === true;

  if (!fullName || fullName.length > 120 || !emailPattern.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Enter your name and a valid email address." }, { status: 400 });
  }
  if (phone && !phonePattern.test(phone)) {
    return NextResponse.json({ error: "Enter a valid phone number or leave it blank." }, { status: 400 });
  }
  if (!(INTERESTS as readonly string[]).includes(interest)) {
    return NextResponse.json({ error: "Choose how you would like to help." }, { status: 400 });
  }
  if (!(AVAILABILITY as readonly string[]).includes(availability)) {
    return NextResponse.json({ error: "Choose a valid availability." }, { status: 400 });
  }
  if (message.length > 2000) {
    return NextResponse.json({ error: "Your message must be 2,000 characters or fewer." }, { status: 400 });
  }
  if (consent !== true) {
    return NextResponse.json({ error: "Please agree to be contacted about volunteering." }, { status: 400 });
  }

  const apiKey = process.env.BREVO_API_KEY;
  const volunteerListId = Number(process.env.BREVO_VOLUNTEER_LIST_ID);
  const contactListId = Number(process.env.BREVO_CONTACT_LIST_ID);
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const recipientEmail = process.env.BREVO_RECIPIENT_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "Aromire-Eko";

  if (!apiKey || !Number.isSafeInteger(volunteerListId) || volunteerListId <= 0 || !senderEmail || !recipientEmail) {
    return NextResponse.json({ error: "Volunteer signup is not configured yet. Please try again later." }, { status: 503 });
  }
  if (marketing && (!Number.isSafeInteger(contactListId) || contactListId <= 0)) {
    return NextResponse.json({ error: "Marketing list is not configured yet. Please try again later." }, { status: 503 });
  }

  const listIds = [volunteerListId];
  if (marketing && contactListId !== volunteerListId) listIds.push(contactListId);

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
      console.error("Brevo volunteer contact upsert failed with status", contactResponse.status);
      return NextResponse.json({ error: "We couldn't save your details. Please try again." }, { status: 502 });
    }

    const lines = [
      `Name: ${fullName}`,
      `Email: ${email}`,
      `Phone: ${phone || "Not provided"}`,
      `Interest: ${interest}`,
      `Availability: ${availability || "Not specified"}`,
      `Updates/opt-ins: ${marketing ? "yes" : "no"}`,
      ...(message ? ["", "Message:", message] : []),
    ];
    const textContent = lines.join("\n");

    const emailResponse = await brevoFetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { accept: "application/json", "api-key": apiKey, "content-type": "application/json" },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: recipientEmail }],
        replyTo: { email, name: fullName },
        subject: `Volunteer inquiry from ${fullName}`,
        textContent,
        htmlContent: [
          `<p><strong>Name:</strong> ${escapeHtml(fullName)}</p>`,
          `<p><strong>Email:</strong> ${escapeHtml(email)}</p>`,
          `<p><strong>Phone:</strong> ${escapeHtml(phone || "Not provided")}</p>`,
          `<p><strong>Interest:</strong> ${escapeHtml(interest)}</p>`,
          `<p><strong>Availability:</strong> ${escapeHtml(availability || "Not specified")}</p>`,
          `<p><strong>Updates/opt-ins:</strong> ${marketing ? "yes" : "no"}</p>`,
          message ? `<p><strong>Message:</strong></p><p style="white-space: pre-wrap">${escapeHtml(message)}</p>` : "",
        ].join(""),
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!emailResponse.ok) {
      console.error("Brevo volunteer notification failed with status", emailResponse.status);
      return NextResponse.json({ error: "We couldn't send your inquiry. Please try again." }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Brevo volunteer request failed", error);
    return NextResponse.json({ error: "We couldn't reach the volunteer service. Please try again." }, { status: 502 });
  }
}
