"use client";

import { useState, type FormEvent } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, consent, website }),
      });
      const result = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) {
        setStatus("error");
        setMessage(result.error || "Your subscription could not be saved. Please try again.");
        return;
      }
      setStatus("success");
      setMessage("Your subscription has been successful.");
      setEmail("");
      setConsent(false);
      setWebsite("");
    } catch {
      setStatus("error");
      setMessage("Your subscription could not be saved. Please try again.");
    }
  }

  return (
    <form className="landing-newsletter-form" onSubmit={submit}>
      <div className="visually-hidden" aria-hidden="true">
        <label htmlFor="newsletter-website">Website</label>
        <input
          id="newsletter-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </div>
      <div className="landing-newsletter-row">
        <label className="visually-hidden" htmlFor="newsletter-email">Email address</label>
        <input
          id="newsletter-email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <button className="act-btn act-btn-primary" type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Subscribing…" : "Subscribe"}
        </button>
      </div>
      <label className="landing-newsletter-consent">
        <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} required />
        <span>I agree to receive notifications, updates, publications, alerts, and newsletters from Aromire-Éko.</span>
      </label>
      <p className="landing-newsletter-note">You may unsubscribe at any time using the link in our newsletter.</p>
      {message && (
        <p className={`landing-newsletter-status ${status}`} role="status">
          {message}
        </p>
      )}
    </form>
  );
}
