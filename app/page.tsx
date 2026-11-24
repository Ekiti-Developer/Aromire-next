import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { hero } from "@/content/home";
import { formatGalleryEventDate, normalizeGalleryEvents, type GalleryPhoto } from "@/content/gallery";
import { sanityFetch } from "@/sanity/lib/fetch";
import { programGalleryEventsQuery, type ProgramGalleryEventResult } from "@/sanity/queries/programGallery";
import {
  pillarsQuery,
  type Pillar,
  type Testimonial,
  testimonialsQuery,
} from "@/sanity/queries/content";
import { partnersQuery, type Partner } from "@/sanity/queries/partners";
import VideoHero from "@/components/landing/VideoHero";
import FocusIcon from "@/components/landing/FocusIcon";
import LagosImpactMap from "@/components/landing/LagosImpactMap";
import TestimonialCarousel from "@/components/landing/TestimonialCarousel";
import NewsletterForm from "@/components/landing/NewsletterForm";
import PartnerMarquee from "@/components/landing/PartnerMarquee";

export const metadata: Metadata = {
  title: { absolute: "Home — Aromire-Éko Empowerment Foundation" },
  description:
    "Aromire-Éko Empowerment Foundation champions community-led solutions through health, skills and sustainable livelihoods in Lagos, Nigeria.",
};
export const revalidate = 60;

const landingStatsQuery = `{
  "programs": count(*[_type == "program" && status == "published" && isSample != true]),
  "locations": count(*[_type == "location" && isSample != true]),
  "moments": count(*[_type == "program" && status == "published" && isSample != true].chapters[].photos),
  "days": count(*[_type == "program" && status == "published" && isSample != true].chapters[])
}`;

const pillarFallback = [
  { id: "health", title: "Health", text: "Screenings, awareness and practical care delivered with local volunteers.", imageUrl: null, imageLqip: null, imageAlt: null },
  { id: "skills", title: "Skills", text: "Hands-on training that opens doors to work and independence.", imageUrl: null, imageLqip: null, imageAlt: null },
  { id: "livelihoods", title: "Livelihoods", text: "Support for local enterprise and sustainable incomes.", imageUrl: null, imageLqip: null, imageAlt: null },
  { id: "education", title: "Education", text: "Learning opportunities for every stage of life.", imageUrl: null, imageLqip: null, imageAlt: null },
];

function hashOrder(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }
  return hash;
}

export default async function HomePage() {
  let events: ReturnType<typeof normalizeGalleryEvents> = [];
  let testimonials: Testimonial[] = [];
  let partners: Partner[] = [];
  let pillars: Pillar[] = [];
  let stats = { programs: 0, locations: 0, moments: 0, days: 0 };

  const [eventsResult, testimonialsResult, statsResult, partnersResult, pillarsResult] = await Promise.allSettled([
    sanityFetch<ProgramGalleryEventResult[]>(programGalleryEventsQuery, {}, ["program"]),
    sanityFetch<Testimonial[]>(testimonialsQuery, {}, ["program"]),
    sanityFetch<{ programs: number; locations: number; moments: number; days: number }>(landingStatsQuery, {}, ["program", "location"]),
    sanityFetch<Partner[]>(partnersQuery, {}, ["partner"]),
    sanityFetch<Pillar[]>(pillarsQuery, {}, ["pillar"]),
  ]);

  if (eventsResult.status === "fulfilled") events = normalizeGalleryEvents(eventsResult.value ?? []);
  else console.error("Failed to fetch programs:", eventsResult.reason);

  if (testimonialsResult.status === "fulfilled") testimonials = testimonialsResult.value ?? [];
  if (partnersResult.status === "fulfilled") partners = partnersResult.value ?? [];

  // "1" is the only meaningful priority. Everything with order 0 (or unset)
  // follows in a deterministic, hash-scattered order (random-looking without
  // calling impure Math.random during render).
  const priorityPartners = partners
    .filter((partner) => partner.sortOrder === 1)
    .sort((a, b) => hashOrder(a._id) - hashOrder(b._id));
  const otherPartners = partners
    .filter((partner) => partner.sortOrder !== 1)
    .sort((a, b) => hashOrder(a._id) - hashOrder(b._id));
  const orderedPartners = [...priorityPartners, ...otherPartners];
  if (pillarsResult.status === "fulfilled") pillars = pillarsResult.value ?? [];
  if (statsResult.status === "fulfilled" && statsResult.value) stats = statsResult.value;

  // Photography for the pillars and news sections. The hero itself is the
  // looping video defined in VideoHero.
  const allPhotos: GalleryPhoto[] = events.flatMap((event) => [...event.photos, ...(event.coverPhoto ? [event.coverPhoto] : [])])
    .filter((photo): photo is GalleryPhoto => Boolean(photo?.src));

  const hasAuthoredStats =
    stats.programs > 0 || stats.locations > 0 || stats.moments > 0 || stats.days > 0;
  const impactStats = [
    { value: stats.programs, label: "Programs documented" },
    { value: stats.moments, label: "Moments shared" },
    { value: stats.days, label: "Days in the field" },
    { value: stats.locations, label: "Communities reached" },
  ].filter((stat) => stat.value > 0);

  const newsItems = events.slice(0, 3);
  const authoredPillars = pillars.filter((pillar) => pillar.title && pillar.text);
  const displayPillars = authoredPillars.length > 0 ? authoredPillars : pillarFallback;

  return (
    <div className="landing-page">
      <VideoHero />

      <section className="act-section landing-about">
        <div className="act-container">
          <h2>Empowering communities through health, skills and sustainable livelihoods.</h2>
          <div className="landing-about-actions">
            <Link className="act-btn act-btn-primary" href="/about">Learn more about us</Link>
            <Link className="act-btn act-btn-outline" href="/programs">Explore our programs</Link>
          </div>
          <p className="landing-about-text">
            Aromire-Éko Empowerment Foundation works directly with communities in Lagos, Nigeria,
            to create lasting change. Every program is designed with local voices at the centre,
            ensuring real impact that addresses genuine needs. Through funding, capacity building
            and strategic delivery with local partners, we help communities turn local vision into
            lasting social impact.
          </p>
        </div>
      </section>

      {hasAuthoredStats && (
        <section className="act-section landing-impact" aria-labelledby="landing-impact-title">
          <LagosImpactMap />
          <div className="act-container">
            <h2 id="landing-impact-title">Transforming Communities, Building Societies</h2>
            <div className="landing-impact-grid">
              {impactStats.map((stat) => (
                <div className="landing-impact-item" key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="act-section landing-focus" aria-labelledby="landing-pillars-title">
        <div className="act-container">
          <h2 id="landing-pillars-title">Our Pillars</h2>
          <div className="landing-focus-grid">
            {displayPillars.map((pillar, index) => {
              const photo = allPhotos[index % Math.max(allPhotos.length, 1)];
              const imageUrl = pillar.imageUrl || photo?.src;
              return (
                <Link className="landing-focus-card" href="/programs" key={"id" in pillar ? pillar.id : pillar._id}>
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt=""
                      fill
                      sizes="(max-width: 700px) 100vw, 50vw"
                      {...(pillar.imageLqip ? { placeholder: "blur" as const, blurDataURL: pillar.imageLqip } : {})}
                    />
                  ) : (
                    <span className="landing-focus-image-fallback" aria-hidden="true" />
                  )}
                  <span className="landing-focus-content">
                    <span className="landing-focus-icon"><FocusIcon name={pillar.title.toLowerCase()} /></span>
                    <strong>{pillar.title}</strong>
                    <span className="landing-focus-text">{pillar.text}</span>
                    <span className="landing-focus-link">Learn more about {pillar.title} <span aria-hidden="true">&#8250;</span></span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {orderedPartners.length > 0 && (
        <section className="act-section landing-partners" aria-labelledby="landing-partners-title">
          <div className="act-container">
            <h2 id="landing-partners-title">Organizations we work with</h2>
            <p className="landing-partners-lead">
              We work alongside local and regional organizations who share our commitment to
              community-led change.
            </p>
            <PartnerMarquee partners={orderedPartners} />
          </div>
        </section>
      )}

      {testimonials.length > 0 && (
        <section className="act-section landing-testimonials" aria-labelledby="landing-testimonials-title">
          <div className="act-container">
            <h2 id="landing-testimonials-title">From Vision to Reality: Impact Stories</h2>
            <TestimonialCarousel items={testimonials} />
          </div>
        </section>
      )}

      {newsItems.length > 0 && (
        <section className="act-section landing-news" aria-labelledby="landing-news-title">
          <div className="act-container">
            <header className="landing-news-header">
              <div>
                <h2 id="landing-news-title">News from the field</h2>
              </div>
              <Link className="landing-text-link" href="/programs">View More <span aria-hidden="true">→</span></Link>
            </header>
            <div className="landing-news-grid">
              {newsItems.map((event) => (
                <Link className="landing-news-card" href={`/programs/${encodeURIComponent(event.slug || event._id)}`} key={event._id}>
                  <div className="landing-news-image">
                    {(() => {
                      const photo = event.photos[0] ?? event.coverPhoto;
                      return photo?.src ? (
                        <Image src={photo.src} alt="" fill sizes="(max-width: 700px) 100vw, 33vw" />
                      ) : (
                        <span className="landing-news-image-fallback" aria-hidden="true" />
                      );
                    })()}
                    <div className="landing-news-overlay">
                      <span>{formatGalleryEventDate(event) || hero.eyebrow}</span>
                      <strong>{event.title}</strong>
                    </div>
                  </div>
                  <div className="landing-news-body">
                    <span>Learn More <span aria-hidden="true">→</span></span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="act-section landing-newsletter" aria-labelledby="landing-newsletter-title">
        <div className="act-container">
          <h2 id="landing-newsletter-title">Stay Updated with News about us</h2>
          <p>Get the latest updates on our initiatives and impact.</p>
          <NewsletterForm />
        </div>
      </section>
    </div>
  );
}
