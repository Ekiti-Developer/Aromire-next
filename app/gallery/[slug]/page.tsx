import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { normalizeGalleryEvents } from "@/content/gallery";
import type { GalleryVideo } from "@/content/gallery";
import { client } from "@/sanity/lib/client";
import { galleryEventQuery, galleryEventTitleQuery } from "@/sanity/queries/gallery";
import type { GalleryEventDetailResult } from "@/content/gallery";

export const revalidate = 60;

type EventPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await client.fetch<{ title: string } | null>(galleryEventTitleQuery, { slug });
  return { title: event?.title ?? "Event Gallery" };
}

function getEmbedUrl(rawUrl: string) {
  try {
    const url = new URL(rawUrl);
    if (url.protocol !== "https:") return null;

    if (url.hostname === "youtu.be" || ["youtube.com", "www.youtube.com", "m.youtube.com"].includes(url.hostname)) {
      const videoId = url.hostname === "youtu.be"
        ? url.pathname.slice(1)
        : url.searchParams.get("v") ?? url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1];
      return videoId ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}` : null;
    }

    if (["vimeo.com", "www.vimeo.com", "player.vimeo.com"].includes(url.hostname)) {
      const videoId = url.pathname.match(/\d+/)?.[0];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
    }
  } catch {
    return null;
  }

  return null;
}

function isDirectVideoUrl(rawUrl: string) {
  try {
    const url = new URL(rawUrl);
    return url.protocol === "https:" && /\.(mp4|webm|ogg)$/i.test(url.pathname);
  } catch {
    return false;
  }
}

function EventVideo({ video }: { video: GalleryVideo }) {
  const embedUrl = getEmbedUrl(video.url);
  const isDirectVideo = isDirectVideoUrl(video.url);

  return (
    <article className="event-video-card">
      {embedUrl ? (
        <div className="event-video-frame">
          <iframe
            src={embedUrl}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ) : isDirectVideo ? (
        <video className="event-video-frame" controls preload="metadata" playsInline>
          <source src={video.url} />
        </video>
      ) : (
        <a className="event-video-link" href={video.url} target="_blank" rel="noreferrer">
          Watch {video.title}
        </a>
      )}
      {video.caption && <p>{video.caption}</p>}
    </article>
  );
}

export default async function EventGalleryPage({ params }: EventPageProps) {
  const { slug } = await params;
  const result = await client.fetch<GalleryEventDetailResult | null>(galleryEventQuery, { slug });
  if (!result) notFound();

  const event = normalizeGalleryEvents([result])[0];
  const videos = result.videos ?? [];

  return (
    <section id="event-gallery-page">
      <div className="event-gallery-inner">
        <Link href="/gallery" className="gallery-back-link">&#8592; All events</Link>
        <header className="event-gallery-header">
          <div className="event-gallery-meta">
            {event.category && <span>{event.category}</span>}
            {event.date && (
              <time dateTime={event.date}>
                {new Date(`${event.date}T00:00:00Z`).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  timeZone: "UTC",
                })}
              </time>
            )}
          </div>
          <h1 className="section-title">{event.title}</h1>
          {event.caption && (
            <div className="event-gallery-summary">
              <h2>About this event</h2>
              <p>{event.caption}</p>
            </div>
          )}
        </header>

        <div className="event-gallery-photos">
          {event.photos.map((photo, index) => (
            <figure className="event-gallery-photo" key={`${photo.src}-${index}`}>
              <div className="event-gallery-image-wrap">
                <Image
                  src={photo.src}
                  alt={photo.alt || `${event.title}, photo ${index + 1}`}
                  fill
                  sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
                  priority={index === 0}
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </div>
              {photo.caption && <figcaption>{photo.caption}</figcaption>}
            </figure>
          ))}
        </div>

        {videos.length > 0 && (
          <section className="event-gallery-videos" aria-labelledby="event-videos-title">
            <h2 id="event-videos-title" className="section-title">Event videos</h2>
            <div className="event-video-grid">
              {videos.map((video) => <EventVideo key={video._key} video={video} />)}
            </div>
          </section>
        )}
      </div>
    </section>
  );
}