import { sanityFetch } from "@/sanity/lib/fetch";

export type SiteSettings = {
  orgName: string;
  tagline: string | null;
  logoUrl: string | null;
  logoAlt: string | null;
  donateUrl: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  socials: { _key: string; platform: string; url: string }[];
};

const siteSettingsQuery = `*[_type == "siteSettings"][0]{
  orgName,
  tagline,
  "logoUrl": logo.asset->url,
  "logoAlt": logo.alt,
  donateUrl,
  email,
  phone,
  whatsapp,
  socials[]{_key, platform, url}
}`;

const defaultSiteSettings: SiteSettings = {
  orgName: "Aromire-Éko Empowerment Foundation",
  tagline: "Empowering communities through health, skills, and sustainable livelihoods.",
  logoUrl: null,
  logoAlt: null,
  donateUrl: null,
  email: null,
  phone: null,
  whatsapp: null,
  socials: [],
};

export async function getSiteSettings(): Promise<SiteSettings> {
  let settings: Partial<SiteSettings> | null = null;
  try {
    settings = await sanityFetch<Partial<SiteSettings> | null>(
      siteSettingsQuery,
      {},
      ["siteSettings"],
    );
  } catch (error) {
    console.error("Failed to fetch site settings; using defaults:", error);
  }

  return {
    ...defaultSiteSettings,
    ...settings,
    orgName: settings?.orgName || defaultSiteSettings.orgName,
    socials: settings?.socials ?? [],
  };
}
