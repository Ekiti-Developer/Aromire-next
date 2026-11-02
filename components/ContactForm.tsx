"use client";

import { useState, type FormEvent } from "react";
import { getCountries, getCountryCallingCode } from "libphonenumber-js";
import type { CountryCode } from "libphonenumber-js";
import englishCountryNames from "i18n-iso-countries/langs/en.json";

const englishNames = englishCountryNames.countries as Record<string, string | string[]>;
const countryNameOverrides: Record<string, string> = {
  AC: "Ascension Island",
  TA: "Tristan da Cunha",
};
const countries = getCountries()
  .map((country) => {
    const localizedName = englishNames[country];
    return {
      code: country,
      name:
        countryNameOverrides[country] ||
        (Array.isArray(localizedName) ? localizedName[0] : localizedName) ||
        country,
      callingCode: getCountryCallingCode(country),
    };
  })
  .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

export default function ContactForm({ initialCountry }: { initialCountry?: string }) {
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedCountry: CountryCode =
    countries.find((country) => country.code === initialCountry)?.code ?? "NG";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setIsSubmitting(true);
    setStatus("");

    const formData = new FormData(form);
    const payload = {
      fullName: String(formData.get("fullName") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      phoneCountry: String(formData.get("phoneCountry") ?? ""),
      message: String(formData.get("message") ?? ""),
      consent: formData.get("consent") === "on",
      website: String(formData.get("website") ?? ""),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok) {
        console.error("Contact form submission failed:", result.error || `HTTP ${response.status}`);
        return;
      }

      form.reset();
      if (typeof result.warning === "string") {
        console.warn("Contact form submission warning:", result.warning);
      }
      setStatus("Thank you. You will be contacted shortly.");
    } catch (error) {
      console.error("Contact form request failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="contact-honeypot" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="form-field">
        <label htmlFor="contact-name">Full name</label>
        <input
          id="contact-name"
          name="fullName"
          type="text"
          autoComplete="name"
          maxLength={120}
          required
        />
      </div>
      <div className="form-field">
        <label htmlFor="contact-email">Email</label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          maxLength={254}
          required
        />
      </div>
      <div className="form-field full">
        <label htmlFor="contact-phone">Phone number <span>(optional)</span></label>
        <div className="phone-input-group">
          <select
            id="contact-country"
            name="phoneCountry"
            defaultValue={selectedCountry}
            aria-label="Country calling code"
          >
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name} (+{country.callingCode})
              </option>
            ))}
          </select>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            autoComplete="tel-national"
            inputMode="tel"
            maxLength={32}
            placeholder="7012345678"
          />
        </div>
        <p className="phone-input-hint">Select your country and enter your phone number.</p>
      </div>
      <div className="form-field full">
        <label htmlFor="contact-message">Message</label>
        <textarea
          id="contact-message"
          name="message"
          maxLength={5000}
        />
      </div>
      <div className="form-field full">
        <label className="contact-consent" htmlFor="contact-consent">
          <input id="contact-consent" name="consent" type="checkbox" />
          <span>I agree to receive email and SMS updates and notifications from Aromire-Eko.</span>
        </label>
      </div>
      <div className="form-submit-wrap">
        <button className="btn-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Contact Us"}
        </button>
        <p className="contact-form-status" role="status" aria-live="polite">{status}</p>
      </div>
    </form>
  );
}