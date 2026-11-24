"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { SiteSettings } from "@/sanity/queries/siteSettings";

export default function Navbar({ settings }: { settings: SiteSettings }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && open) {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    }

    function closeOnDesktopResize() {
      if (window.innerWidth > 820) setOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", closeOnDesktopResize);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", closeOnDesktopResize);
    };
  }, [open]);

  if (pathname.startsWith("/studio")) return null;

  return (
    <header className="site-header">
      <nav className="site-nav" aria-label="Main navigation">
        <Link className="nav-brand" href="/" aria-label={`${settings.orgName} home`}>
          <Image
            src={settings.logoUrl || "/images/Logo.svg"}
            alt={settings.logoAlt || `${settings.orgName} logo`}
            width={180}
            height={66}
            priority
          />
        </Link>

        <div className={`nav-panel${open ? " open" : ""}`} id="nav-panel">
          <ul className="nav-links">
            <li>
              <Link
                href="/programs"
                className={pathname.startsWith("/programs") ? "active-link" : undefined}
                aria-current={pathname.startsWith("/programs") ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                Programs
              </Link>
            </li>
            <li>
              <Link
                href="/blog"
                className={pathname.startsWith("/blog") ? "active-link" : undefined}
                aria-current={pathname.startsWith("/blog") ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                Blog
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className={pathname.startsWith("/about") ? "active-link" : undefined}
                aria-current={pathname.startsWith("/about") ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/volunteer"
                className={`nav-cta${pathname.startsWith("/volunteer") ? " active-link" : ""}`}
                aria-current={pathname.startsWith("/volunteer") ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                Volunteer / Donate
              </Link>
            </li>
          </ul>
        </div>

        <button
          ref={menuButtonRef}
          className={`hamburger${open ? " active" : ""}`}
          type="button"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          aria-controls="nav-panel"
          onClick={() => setOpen((isOpen) => !isOpen)}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </nav>
    </header>
  );
}
