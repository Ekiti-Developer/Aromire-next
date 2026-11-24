"use client";

import { usePathname } from "next/navigation";

import Footer from "@/components/Footer";
import type { SiteSettings } from "@/sanity/queries/siteSettings";

export default function FooterGate({ settings }: { settings: SiteSettings }) {
  const pathname = usePathname();
  if (pathname.startsWith("/studio")) return null;
  return <Footer settings={settings} />;
}
