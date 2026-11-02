import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Carousel from "@/components/Carousel";
import PartnersGrid from "@/components/PartnersGrid";
import { hero } from "@/content/home";
import { normalizeGalleryEvents } from "@/content/gallery";
import { client } from "@/sanity/lib/client";
import { galleryEventsQuery, type GalleryEventResult } from "@/sanity/queries/gallery";
import { partnersQuery, type Partner } from "@/sanity/queries/partners";

export const metadata: Metadata = { title: "Home" };
export const revalidate = 60;

type Pillar = {
  _id: string;
  heading: string;
  description: string;
  imageUrl: string | null;
  imageAlt: string | null;
};

const pillarsQuery = `*[_type == "pillar"] | order(sortOrder asc, _createdAt asc) {
  _id,
  heading,
  description,
  "imageUrl": image.asset->url,
  imageAlt
}`;

export default async function HomePage() {
  const [pillars, galleryResults, partners] = await Promise.all([
    client.fetch<Pillar[]>(pillarsQuery),
    client.fetch<GalleryEventResult[]>(galleryEventsQuery),
    client.fetch<Partner[]>(partnersQuery),
  ]);
  const events = normalizeGalleryEvents(galleryResults);

  return (
    <>
      <Carousel events={events}>
        <p className="hero-eyebrow">{hero.eyebrow}</p>
        <h1 className="hero-title">{hero.title}</h1>
        {hero.subtitle && <p className="hero-subtitle">{hero.subtitle}</p>}
        <div className="hero-actions">
          <Link href="/gallery" className="btn-primary">Our Gallery</Link>
          <Link href="/contact" className="btn-outline">Partner With Us</Link>
        </div>
      </Carousel>

      {pillars.length > 0 && (
        <section id="pillars">
          <div className="pillars-header">
            <p className="section-eyebrow">What We Stand For</p>
            <div className="gold-divider"></div>
            <h2 className="section-title light">Our Pillars of Empowerment</h2>
            <p className="section-lead light">
              Every initiative we run is grounded in one of our pillars — each one essential to a
              thriving, self-sustaining community.
            </p>
          </div>
          <div className="pillars-grid">
            {pillars.map((pillar) => (
              <div className="pillar-card" key={pillar._id}>
                {pillar.imageUrl && (
                  <div className="pillar-media">
                    <Image
                      className="pillar-image"
                      src={pillar.imageUrl}
                      alt={pillar.imageAlt || pillar.heading}
                      fill
                      sizes="(max-width: 600px) 100vw, 50vw"
                    />
                  </div>
                )}
                <div className="pillar-card-body">
                  <h3>{pillar.heading}</h3>
                  <p>{pillar.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {partners.length > 0 && (
        <section id="partners">
          <div className="partners-inner">
            <header className="partners-header">
              <p className="section-eyebrow">Together for lasting change</p>
              <h2 className="section-title">Our Partners</h2>
            </header>
            <PartnersGrid partners={partners} />
          </div>
        </section>
      )}
    </>
  );
}
