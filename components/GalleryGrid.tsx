import Link from "next/link";
import EventSlideshow from "@/components/EventSlideshow";
import type { GalleryEvent } from "@/content/gallery";

export default function GalleryGrid({ items }: { items: GalleryEvent[] }) {
  if (items.length === 0) {
    return <p className="gallery-empty">No gallery images have been published yet.</p>;
  }

  return (
    <div className="gallery-page-grid">
      {items.map((item) => (
        <article className="gallery-page-card" key={item._id}>
          {item.photos.length > 0 && (
            <div className="gallery-page-media">
              <EventSlideshow
                photos={item.photos}
                coverPhoto={item.coverPhoto}
                eventTitle={item.title}
                sizes="(max-width: 600px) 100vw, 50vw"
                controlsBelow
              />
              {item.category && <span className="gallery-tag">{item.category}</span>}
            </div>
          )}
          <div className="gallery-page-card-body">
            <div className="gallery-page-card-heading">
              <h2>{item.title}</h2>
              {item.date && (
                <time dateTime={item.date}>
                  {new Date(`${item.date}T00:00:00Z`).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    timeZone: "UTC",
                  })}
                </time>
              )}
            </div>
            {item.caption && <p>{item.caption}</p>}
            <Link
              className="gallery-card-action"
              href={`/gallery/${encodeURIComponent(item.slug || item._id)}`}
            >
              View event gallery <span aria-hidden="true">&#8594;</span>
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}