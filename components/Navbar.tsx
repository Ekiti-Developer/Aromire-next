"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/gallery", label: "Gallery" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile menu after navigating
  useEffect(() => setOpen(false), [pathname]);

  if (pathname.startsWith("/studio")) return null;

  return (
    <nav>
      <Link className="nav-logo" href="/">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/Logo.svg" alt="Aromire-Éko Logo" style={{ height: 42 }} />
      </Link>

      <ul className={`nav-links${open ? " open" : ""}`} id="nav-links">
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link href={href} className={pathname === href ? "active-link" : undefined}>
              {label}
            </Link>
          </li>
        ))}
        <li>
          <Link href="/contact" className="nav-cta">
            Get Involved
          </Link>
        </li>
      </ul>

      <button
        className={`hamburger${open ? " active" : ""}`}
        id="hamburger"
        aria-label="Toggle menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </nav>
  );
}
