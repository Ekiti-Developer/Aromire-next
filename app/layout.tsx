import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import FooterGate from "@/components/FooterGate";
import { getSiteSettings } from "@/sanity/queries/siteSettings";
import "./globals.css";
import "./landing.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Aromire-Éko Empowerment Foundation",
    template: "%s — Aromire-Éko Empowerment Foundation",
  },
  description:
    "Aromire-Éko Empowerment Foundation champions community-led solutions through health, skills and sustainable livelihoods in Lagos, Nigeria.",
  openGraph: {
    type: "website",
    siteName: "Aromire-Éko Empowerment Foundation",
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <html lang="en" data-theme="light" data-scroll-behavior="smooth">
      <body className={`${inter.variable} ${cormorant.variable}`}>
        <a className="skip-to-content" href="#main-content">Skip to content</a>
        <Navbar settings={settings} />
        <main id="main-content">{children}</main>
        <FooterGate settings={settings} />
      </body>
    </html>
  );
}
