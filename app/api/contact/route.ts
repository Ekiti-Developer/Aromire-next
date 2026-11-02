import { setDefaultResultOrder } from "node:dns";
import { NextResponse } from "next/server";
import { getCountries, parsePhoneNumberFromString } from "libphonenumber-js";
import type { CountryCode } from "libphonenumber-js";

setDefaultResultOrder("ipv4first");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  const phoneCountry =
    typeof body.phoneCountry === "string" &&
    getCountries().some((country) => country === body.phoneCountry)
      ? (body.phoneCountry as CountryCode)
      : undefined;
  const parsedPhone = phone
    ? phoneCountry
      ? parsePhoneNumberFromString(phone, phoneCountry)
      : undefined
    : undefined;
  const normalizedPhone = parsedPhone?.isValid() ? parsedPhone.number : "";
  const contactMessage = typeof body.message === "string" ? body.message.trim() : "";
  const consent = body.consent;

  if (!fullName || fullName.length > 120 || !emailPattern.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Enter a valid name and email address." }, { status: 400 });
  }
  if (typeof consent !== "boolean") {
    return NextResponse.json({ error: "Invalid consent selection." }, { status: 400 });
  }
  if (phone.length > 32 || (phone && !normalizedPhone)) {
    return NextResponse.json(
      { error: "Enter a valid phone number for the selected country." },
      { status: 400 },
    );
  }
  if (contactMessage.length > 5000) {
    return NextResponse.json({ error: "Your message must be 5,000 characters or fewer." }, { status: 400 });
  }

  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const recipientEmail = process.env.BREVO_RECIPIENT_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "Aromire-Eko";

  if (!apiKey || !senderEmail || !recipientEmail) {
    return NextResponse.json(
      { error: "Contact delivery is not configured yet. Please try again later." },
      { status: 503 },
    );
  }

  const safeName = escapeHtml(fullName);
  const safeEmail = escapeHtml(email);
  const safePhone = escapeHtml(normalizedPhone || "Not provided");
  const safeMessage = escapeHtml(contactMessage);
  const emailMessage = [
    `Name: ${fullName}`,
    `Email: ${email}`,
    `Phone: ${normalizedPhone || "Not provided"}`,
    ...(contactMessage ? ["", "Message:", contactMessage] : []),
  ].join("\n");

  let brevoOperation = "contact upsert";
  let phoneOmittedFromBrevo = false;
  let contactCreated = false;
  try {
    if (consent) {
      const contactAttributes: Record<string, string> = { FIRSTNAME: fullName };
      if (normalizedPhone) {
        contactAttributes.SMS = normalizedPhone;
      }

      const contactResponse = await fetch("https://api.brevo.com/v3/contacts", {
        method: "POST",
        headers: {
          accept: "application/json",
          "api-key": apiKey,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email,
          attributes: contactAttributes,
          emailBlacklisted: false,
          smsBlacklisted: false,
          updateEnabled: true,
        }),
        signal: AbortSignal.timeout(10000),
      });

      if (contactResponse.ok) {
        contactCreated = contactResponse.status === 201;
      } else {
        const errorText = await contactResponse.text();
        let errorDetails: { code?: unknown; message?: unknown } = {};
        try {
          const parsed: unknown = JSON.parse(errorText);
          if (parsed && typeof parsed === "object") {
            errorDetails = parsed as { code?: unknown; message?: unknown };
          }
        } catch {
          errorDetails = {};
        }

        const brevoMessage = typeof errorDetails.message === "string" ? errorDetails.message : "";
        const errorCode = typeof errorDetails.code === "string" ? errorDetails.code : "unknown";
        const isPhoneConflict =
          contactResponse.status === 400 &&
          Boolean(normalizedPhone) &&
          ((errorCode === "invalid_parameter" && /invalid phone number/i.test(brevoMessage)) ||
            (errorCode === "duplicate_parameter" && /(phone|sms)/i.test(brevoMessage)));

        if (isPhoneConflict) {
          delete contactAttributes.SMS;
          const retryResponse = await fetch("https://api.brevo.com/v3/contacts", {
            method: "POST",
            headers: {
              accept: "application/json",
              "api-key": apiKey,
              "content-type": "application/json",
            },
            body: JSON.stringify({
              email,
              attributes: contactAttributes,
              emailBlacklisted: false,
              smsBlacklisted: false,
              updateEnabled: true,
            }),
            signal: AbortSignal.timeout(10000),
          });

          if (retryResponse.ok) {
            phoneOmittedFromBrevo = true;
            contactCreated = retryResponse.status === 201;
          } else {
            console.error("Brevo contact upsert retry without phone failed with status", retryResponse.status);
            return NextResponse.json(
              { error: "We couldn't save your contact details. Please try again later." },
              { status: 502 },
            );
          }
        } else {
          let errorMessage = brevoMessage;
          for (const value of [fullName, email, phone, normalizedPhone]) {
            if (value) {
              errorMessage = errorMessage.replaceAll(value, "[redacted]");
            }
          }

          console.error("Brevo contact upsert failed", {
            status: contactResponse.status,
            code: errorCode,
            message: errorMessage.slice(0, 300) || "No error message returned",
          });
          return NextResponse.json(
            { error: "We couldn't save your contact details. Please try again later." },
            { status: 502 },
          );
        }
      }

      console.info(
        contactCreated ? "Brevo contact created" : "Brevo existing contact updated",
      );
    }

    brevoOperation = "notification email";
    const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: recipientEmail }],
        replyTo: { email, name: fullName },
        subject: `Contact inquiry from ${fullName}`,
        textContent: emailMessage,
        htmlContent: `<p><strong>Name:</strong> ${safeName}</p><p><strong>Email:</strong> ${safeEmail}</p><p><strong>Phone:</strong> ${safePhone}</p>${contactMessage ? `<p><strong>Message:</strong></p><p style="white-space: pre-wrap">${safeMessage}</p>` : ""}`,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!brevoResponse.ok) {
      console.error("Brevo contact delivery failed with status", brevoResponse.status);
      return NextResponse.json(
        { error: "We couldn't send your inquiry. Please try again later." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      ...(phoneOmittedFromBrevo
        ? { warning: "Your inquiry was sent, but Brevo couldn't save the phone number for SMS notifications." }
        : {}),
    });
  } catch (error) {
    console.error(`Brevo ${brevoOperation} request failed`, error);
    return NextResponse.json(
      { error: `We couldn't reach Brevo during ${brevoOperation}. Please try again shortly.` },
      { status: 502 },
    );
  }
}