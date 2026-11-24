"use client";

import { useState, type FormEvent } from "react";

const INTERESTS = [
  "Community outreach",
  "Health support",
  "Skills training",
  "Fundraising & partnerships",
  "Other",
];

const AVAILABILITY = ["Weekdays", "Weekends", "Flexible"];

export default function VolunteerForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/volunteer", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          fullName: data.get("fullName"),
          email: data.get("email"),
          phone: data.get("phone"),
          interest: data.get("interest"),
          availability: data.get("availability"),
          message: data.get("message"),
          consent: data.get("consent") === "on",
          marketing: data.get("marketing") === "on",
          website: data.get("website"),
        }),
      });
      const result = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) {
        setStatus("error");
        setMessage(result.error || "Your inquiry could not be saved. Please try again.");
        return;
      }
      setStatus("success");
      setMessage("Thank you. We have your details and will be in touch soon.");
      form.reset();
    } catch {
      setStatus("error");
      setMessage("Your inquiry could not be saved. Please try again.");
    }
  }

  return (
    <form className="volunteer-form" onSubmit={submit} aria-label="Volunteer contact form">
      <div className="volunteer-form-grid">
        <div className="volunteer-field">
          <label htmlFor="volunteer-name">Full name <span aria-hidden="true">*</span></label>
          <input id="volunteer-name" name="fullName" type="text" autoComplete="name" maxLength={120} required />
        </div>
        <div className="volunteer-field">
          <label htmlFor="volunteer-email">Email address <span aria-hidden="true">*</span></label>
          <input id="volunteer-email" name="email" type="email" autoComplete="email" maxLength={254} required />
        </div>
        <div className="volunteer-field">
          <label htmlFor="volunteer-phone">Phone number <span className="volunteer-optional">(optional)</span></label>
          <input id="volunteer-phone" name="phone" type="tel" autoComplete="tel" maxLength={32} placeholder="+234 800 000 0000" />
        </div>
        <div className="volunteer-field">
          <label htmlFor="volunteer-interest">How would you like to help? <span aria-hidden="true">*</span></label>
          <select id="volunteer-interest" name="interest" defaultValue="" required>
            <option value="" disabled>Choose an area</option>
            {INTERESTS.map((interest) => <option key={interest} value={interest}>{interest}</option>)}
          </select>
        </div>
        <div className="volunteer-field">
          <label htmlFor="volunteer-availability">Availability <span className="volunteer-optional">(optional)</span></label>
          <select id="volunteer-availability" name="availability" defaultValue="">
            <option value="">Not specified</option>
            {AVAILABILITY.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>
      </div>

      <div className="volunteer-field">
        <label htmlFor="volunteer-message">Tell us a little about yourself <span className="volunteer-optional">(optional)</span></label>
        <textarea id="volunteer-message" name="message" rows={5} maxLength={2000} placeholder="Skills, experience, or why you'd like to help…" />
      </div>

      <div className="volunteer-honeypot" aria-hidden="true">
        <label htmlFor="volunteer-website">Website</label>
        <input id="volunteer-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <label className="volunteer-consent">
        <input type="checkbox" name="consent" required />
        <span>I agree to be contacted by Aromire-Éko about volunteering opportunities.</span>
      </label>

      <label className="volunteer-consent volunteer-marketing">
        <input type="checkbox" name="marketing" />
        <span>Also email me news, updates and ways to support the foundation. I can unsubscribe at any time.</span>
      </label>

      <button className="act-btn act-btn-primary" type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Sending…" : "Send volunteer inquiry"}
      </button>

      {message && (
        <p className={`volunteer-status ${status}`} role="status">
          {message}
        </p>
      )}
    </form>
  );
}
