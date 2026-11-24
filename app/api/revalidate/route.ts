import { isValidSignature, SIGNATURE_HEADER_NAME } from "@sanity/webhook";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { verifyWebhookFreshness } from "@/lib/webhook-auth";

const documentTags: Record<string, string[]> = {
  aboutPage: ["aboutPage"],
  partner: ["partner"],
  post: ["post"],
  pillar: ["pillar"],
  author: ["post"],
  category: ["post"],
  blockContent: ["post"],
  location: ["location", "program"],
  program: ["program"],
  testimonial: ["testimonial", "program"],
  siteSettings: ["siteSettings"],
};

type SanityWebhookPayload = {
  _type?: unknown;
  document?: { _type?: unknown };
};

export async function POST(request: Request) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    console.error("SANITY_REVALIDATE_SECRET is not configured.");
    return NextResponse.json({ error: "Webhook revalidation is not configured." }, { status: 500 });
  }

  const signature = request.headers.get(SIGNATURE_HEADER_NAME);
  const rawBody = await request.text();
  if (!signature || !(await isValidSignature(rawBody, signature, secret))) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  const freshness = verifyWebhookFreshness(signature);
  if (!freshness.ok) {
    return NextResponse.json({ error: freshness.error }, { status: freshness.status });
  }

  let payload: SanityWebhookPayload;
  try {
    const parsed: unknown = JSON.parse(rawBody);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return NextResponse.json({ error: "Webhook body must be a JSON object." }, { status: 400 });
    }
    payload = parsed as SanityWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Webhook body must be valid JSON." }, { status: 400 });
  }

  const documentType = payload._type ?? payload.document?._type;
  if (typeof documentType !== "string" || !documentTags[documentType]) {
    return NextResponse.json({ error: "Unsupported or missing Sanity document type." }, { status: 400 });
  }

  for (const tag of documentTags[documentType]) {
    revalidateTag(tag, "max");
  }

  return NextResponse.json({ revalidated: true, documentType });
}
