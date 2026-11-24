"use client";

import { useState, type FormEvent } from "react";

export default function DonationForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/donate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          fullName: data.get("fullName"),
          email: data.get("email"),
          phone: data.get("phone"),
          consent: data.get("consent") === "on",
          marketing: data.get("marketing") === "on",
          website: data.get("website"),
        }),
      });
      const result = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) {
        setStatus("error");
        setMessage(result.error || "Your details could not be saved. Please try again.");
        return;
      }
      setStatus("success");
      setMessage("Thank you. We'll be in touch about how to give.");
      form.reset();
    } catch {
      setStatus("error");
      setMessage("Your details could not be saved. Please try again.");
    }
  }

  return (
    <form className="volunteer-form" onSubmit={submit} aria-labelledby="donation-form-title">
      <h3 id="donation-form-title" className="form-mode-title">Donation contact details</h3>
      <p className="form-mode-note">We only need your contact details. No payment is taken here.</p>

      <div className="volunteer-form-grid">
        <div className="volunteer-field">
          <label htmlFor="donation-name">Full name <span aria-hidden="true">*</span></label>
          <input id="donation-name" name="fullName" type="text" autoComplete="name" maxLength={120} required />
        </div>
        <div className="volunteer-field">
          <label htmlFor="donation-email">Email address <span aria-hidden="true">*</span></label>
          <input id="donation-email" name="email" type="email" autoComplete="email" maxLength={254} required />
        </div>
        <div className="volunteer-field">
          <label htmlFor="donation-phone">Phone number <span className="volunteer-optional">(optional)</span></label>
          <input id="donation-phone" name="phone" type="tel" autoComplete="tel" maxLength={32} placeholder="+234 800 000 0000" />
        </div>
      </div>

      <div className="volunteer-honeypot" aria-hidden="true">
        <label htmlFor="donation-website">Website</label>
        <input id="donation-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <label className="volunteer-consent">
        <input type="checkbox" name="consent" required />
        <span>I agree to be contacted by Aromire-Éko about supporting the foundation.</span>
      </label>

      <label className="volunteer-consent volunteer-marketing">
        <input type="checkbox" name="marketing" />
        <span>Also email me news, updates and ways to support the foundation. I can unsubscribe at any time.</span>
      </label>

      <button className="act-btn act-btn-primary" type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Sending…" : "Register my interest in giving"}
      </button>

      {message && (
        <p className={`volunteer-status ${status}`} role={status === "error" ? "alert" : "status"}>
          {message}
        </p>
      )}
    </form>
  );
}
