import Link from "next/link";
import type { ReactNode } from "react";
import type { SiteSettings } from "@/sanity/queries/siteSettings";

/** Decorative brand mark. The link's aria-label supplies the accessible name. */
function SocialIcon({ platform }: { platform: string }) {
  const key = platform.toLowerCase().replace(/[\s.]/g, "");

  const paths: Record<string, ReactNode> = {
    instagram: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="17.4" cy="6.6" r="1.2" fill="currentColor" />
      </>
    ),
    facebook: (
      <path
        fill="currentColor"
        d="M14 8.5V7c0-.8.5-1 1-1h2V3h-3c-2.5 0-4 1.7-4 4v1.5H8v3h2V21h3v-9.5h2.5l.5-3H14Z"
      />
    ),
    x: (
      <path
        fill="currentColor"
        d="M17.5 3h3l-6.6 7.6L21.5 21h-6l-4.7-6.1L5.5 21h-3l7-8L4 3h6.2l4.2 5.6L17.5 3Zm-1 16h1.7L7.6 4.9H5.8L16.5 19Z"
      />
    ),
    twitter: (
      <path
        fill="currentColor"
        d="M17.5 3h3l-6.6 7.6L21.5 21h-6l-4.7-6.1L5.5 21h-3l7-8L4 3h6.2l4.2 5.6L17.5 3Zm-1 16h1.7L7.6 4.9H5.8L16.5 19Z"
      />
    ),
    linkedin: (
      <path
        fill="currentColor"
        d="M6.5 8.5v10h-3v-10h3ZM8 5.5a1.8 1.8 0 1 1-3.6 0 1.8 1.8 0 0 1 3.6 0ZM21 13.5c0-3.3-1.8-5-4.2-5-1.9 0-2.8 1-3.3 1.8V8.5h-3v10h3v-5.4c0-1.5.6-2.4 1.8-2.4 1.2 0 1.7.9 1.7 2.4v5.4H21v-5Z"
      />
    ),
    youtube: (
      <path
        fill="currentColor"
        d="M21.6 7.2c-.2-1-1-1.8-2-2C17.8 4.8 12 4.8 12 4.8s-5.8 0-7.6.4c-1 .2-1.8 1-2 2C2 9 2 12 2 12s0 3 .4 4.8c.2 1 1 1.8 2 2 1.8.4 7.6.4 7.6.4s5.8 0 7.6-.4c1-.2 1.8-1 2-2 .4-1.8.4-4.8.4-4.8s0-3-.4-4.8ZM10 15V9l5 3-5 3Z"
      />
    ),
    tiktok: (
      <path
        fill="currentColor"
        d="M16.5 3c.3 2.2 1.7 3.6 4 3.9v3c-1.5.1-2.9-.4-4-1.3v6.7a5.7 5.7 0 1 1-5.7-5.7c.3 0 .6 0 .9.1v3.1a2.7 2.7 0 1 0 1.8 2.5V3h3Z"
      />
    ),
    whatsapp: (
      <path
        fill="currentColor"
        d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20Zm4.4-6c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1-.2.3-.6.8-.8 1-.1.2-.3.2-.5.1-.3-.1-1.1-.4-2-1.3-.8-.7-1.3-1.5-1.4-1.7-.1-.2 0-.3.1-.4l.4-.5.2-.4v-.4c0-.1-.5-1.3-.7-1.8-.2-.4-.4-.4-.5-.4h-.4c-.1 0-.4.1-.6.3-.2.2-.8.8-.8 2s.8 2.3.9 2.5c.1.2 1.5 2.4 3.7 3.3.5.2.9.3 1.2.4.5.2 1 .2 1.4.1.4-.1 1.4-.6 1.6-1.2.2-.6.2-1 .1-1.2-.1-.1-.2-.2-.4-.3Z"
      />
    ),
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {paths[key] ?? (
        <path
          fill="currentColor"
          d="M14 3h7v7h-2V6.4l-8.3 8.3-1.4-1.4L17.6 5H14V3Zm3 11v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h5v2H5v10h10v-5h2Z"
        />
      )}
    </svg>
  );
}

export default function Footer({ settings }: { settings: SiteSettings }) {
  const whatsappNumber = settings.whatsapp?.replace(/[^\d]/g, "");

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-identity">
            <Link href="/" className="footer-brand-name">{settings.orgName}</Link>
            {settings.tagline && <p className="footer-about">{settings.tagline}</p>}
          </div>

          <div className="footer-col">
            <p className="footer-col-heading">Explore</p>
            <ul>
              <li><Link href="/programs">Programs</Link></li>
              <li><Link href="/blog">Blog</Link></li>
              <li><Link href="/about">About the foundation</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <p className="footer-col-heading">Get in touch</p>
            <ul>
              <li><Link className="footer-volunteer-link" href="/volunteer">Volunteer / Donate</Link></li>
              {settings.email && <li><a href={`mailto:${settings.email}`}>{settings.email}</a></li>}
              {settings.phone && <li><a href={`tel:${settings.phone}`}>{settings.phone}</a></li>}
              {whatsappNumber && (
                <li>
                  <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer">
                    WhatsApp
                  </a>
                </li>
              )}
            </ul>
            {settings.socials.length > 0 && (
              <div className="footer-socials">
                <ul className="footer-social-list">
                  {settings.socials.map((social) => (
                    <li key={social._key}>
                      <a
                        className="footer-social-link"
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Visit ${settings.orgName} on ${social.platform}`}
                      >
                        <SocialIcon platform={social.platform} />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">
            © {new Date().getFullYear()} {settings.orgName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
