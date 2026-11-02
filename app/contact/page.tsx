import type { Metadata } from "next";
import { headers } from "next/headers";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = { title: "Contact Us" };

export default async function ContactPage() {
  const requestHeaders = await headers();
  const initialCountry = (
    requestHeaders.get("x-vercel-ip-country") ??
    requestHeaders.get("cf-ipcountry") ??
    ""
  )
    .trim()
    .toUpperCase();

  return (
    <section id="contact" className="contact-page">
      <div className="contact-inner">
        <p className="section-eyebrow">Get in touch</p>
        <div className="gold-divider" />
        <h1 className="section-title light">Contact Us</h1>
        <p className="section-lead light contact-page-lead">
          Leave your contact details and our team can follow up with you.
        </p>
        <ContactForm initialCountry={initialCountry || undefined} />
      </div>
    </section>
  );
}