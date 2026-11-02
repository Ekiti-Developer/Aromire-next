import type { Metadata } from "next";
import GalleryGrid from "@/components/GalleryGrid";
import { normalizeGalleryEvents } from "@/content/gallery";
import { client } from "@/sanity/lib/client";
import { galleryEventsQuery, type GalleryEventResult } from "@/sanity/queries/gallery";

export const metadata: Metadata = { title: "Gallery" };
export const revalidate = 60;

export default async function GalleryPage() {
  const results = await client.fetch<GalleryEventResult[]>(galleryEventsQuery);
  const items = normalizeGalleryEvents(results);

  return (
    <section id="gallery-page">
      <div className="gallery-page-inner">
        <header className="gallery-page-header">
          <p className="section-eyebrow">Aromire-Éko in action</p>
          <h1 className="section-title">Our Gallery</h1>
          <p className="section-lead">
            Moments from the people, programs, and communities behind our work.
          </p>
        </header>
        <GalleryGrid items={items} />
      </div>
    </section>
  );
}