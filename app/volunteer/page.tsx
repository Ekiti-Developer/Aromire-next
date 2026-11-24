import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import GetInvolvedForm from "@/components/volunteer/GetInvolvedForm";
import { getSiteSettings } from "@/sanity/queries/siteSettings";

export const metadata: Metadata = {
  title: "Volunteer / Donate",
  description:
    "Give your time or support Aromire-Éko with a donation. Volunteer with community-led programs in Lagos or find out how to give.",
};

const ways = [
  {
    title: "Community outreach",
    text: "Help with on-the-ground coordination, registration and welcoming neighbours at program events.",
  },
  {
    title: "Health support",
    text: "Support screening days with logistics, guidance and clear information for participants.",
  },
  {
    title: "Skills training",
    text: "Share a practical skill or help participants work through hands-on training exercises.",
  },
  {
    title: "Fundraising & partnerships",
    text: "Help connect the foundation with organisations and people who can support community work.",
  },
];

const steps = [
  { number: "01", title: "Choose your path", text: "Give your time as a volunteer, or support the work with a donation." },
  { number: "02", title: "Take the next step", text: "Complete the volunteer form, or open the donation options and follow the instructions there." },
  { number: "03", title: "Stay connected", text: "We follow up about volunteering opportunities and can help with any giving questions." },
];

export default async function VolunteerPage() {
  const settings = await getSiteSettings();
  const donateUrl = settings.donateUrl?.trim();
  const isExternalDonate = Boolean(donateUrl && /^https?:\/\//i.test(donateUrl));

  const donateCta = (className: string) => {
    if (!donateUrl) {
      if (!settings.email) return null;
      return <a className={className} href={`mailto:${settings.email}`}>Ask how to donate</a>;
    }
    if (isExternalDonate) {
      return (
        <a className={className} href={donateUrl} target="_blank" rel="noopener noreferrer">
          Go to donation page <span aria-hidden="true">↗</span>
        </a>
      );
    }
    return <Link className={className} href={donateUrl}>Go to donation page</Link>;
  };

  return (
    <div className="volunteer-page">
      <header className="volunteer-hero">
        <div className="act-container">
          <h1>Volunteer / Donate</h1>
          <p className="volunteer-hero-lead">
            Give your time and skills to community-led programs in Lagos, or support the work with a
            donation. Choose the path that works for you and we will help you take the next step.
          </p>
          <div className="volunteer-hero-actions">
            <Link className="act-btn act-btn-primary" href="/volunteer?mode=volunteer#volunteer-form">Volunteer your time</Link>
            <Link className="act-btn act-btn-outline" href="/volunteer?mode=donate#volunteer-form">Make a donation</Link>
          </div>
        </div>
      </header>

      <section className="act-section volunteer-ways" aria-labelledby="volunteer-ways-title">
        <div className="act-container">
          <h2 id="volunteer-ways-title">Find your place in the work</h2>
          <div className="volunteer-way-grid">
            {ways.map((way) => (
              <article className="volunteer-way" key={way.title}>
                <h3>{way.title}</h3>
                <p>{way.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="act-section volunteer-steps" aria-labelledby="volunteer-steps-title">
        <div className="act-container">
          <h2 id="volunteer-steps-title">Three simple steps</h2>
          <ol className="volunteer-step-list">
            {steps.map((step) => (
              <li key={step.number}>
                <span className="volunteer-step-number" aria-hidden="true">{step.number}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="act-section volunteer-donate" id="donate" aria-labelledby="donate-title">
        <div className="act-container volunteer-donate-inner">
          <div>
            <h2 id="donate-title">Make a donation</h2>
            <p>
              {donateUrl
                ? "Follow the link to our donation page to complete your gift. If you have a question about giving, you can reach us directly."
                : "We are arranging our online giving options. In the meantime, get in touch with us and we will share the current ways to give."}
            </p>
            {(settings.email || settings.phone) && (
              <div className="volunteer-direct">
                <p>Prefer to talk to us first?</p>
                {settings.email && <a href={`mailto:${settings.email}`}>{settings.email}</a>}
                {settings.phone && <a href={`tel:${settings.phone}`}>{settings.phone}</a>}
              </div>
            )}
          </div>
          <div className="volunteer-donate-action">
            {donateCta("act-btn act-btn-primary")}
          </div>
        </div>
      </section>

      <section className="act-section volunteer-contact" id="volunteer-form" aria-labelledby="volunteer-form-title">
        <div className="act-container volunteer-contact-inner">
          <div className="volunteer-contact-copy">
            <h2 id="volunteer-form-title">Get involved</h2>
            <p>
              Choose volunteering or donating, then leave your details. We only use them to follow up
              about the option you select.
            </p>
            {(settings.email || settings.phone) && (
              <div className="volunteer-direct">
                <p>Prefer to reach us directly?</p>
                {settings.email && <a href={`mailto:${settings.email}`}>{settings.email}</a>}
                {settings.phone && <a href={`tel:${settings.phone}`}>{settings.phone}</a>}
              </div>
            )}
          </div>
          <Suspense fallback={<p className="form-mode-note">Loading the form…</p>}>
            <GetInvolvedForm />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
