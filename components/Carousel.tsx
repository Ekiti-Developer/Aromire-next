"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import EventSlideshow from "@/components/EventSlideshow";
import type { GalleryEvent } from "@/content/gallery";

const EVENT_INTERVAL_MS = 7000;

export default function Carousel({
  events,
  children,
}: {
  events: GalleryEvent[];
  children: ReactNode;
}) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef(0);
  const count = events.length;

  useEffect(() => {
    if (paused || count < 2) return;
    const timer = setTimeout(
      () => setCurrent((index) => (index + 1) % count),
      EVENT_INTERVAL_MS,
    );
    return () => clearTimeout(timer);
  }, [current, paused, count]);

  return (
    <section
      id="home"
      className="hero-event-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="carousel-wrapper"
        aria-label="Featured events"
      >
        <div
          className="carousel-track"
          style={{ transform: `translateX(-${current * 100}%)` }}
          onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            const diff = touchStartX.current - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) {
              setCurrent((index) => (index + (diff > 0 ? 1 : -1) + count) % count);
            }
          }}
        >
          {events.map((event, index) => (
            <article className="carousel-slide" key={event._id}>
              <EventSlideshow
                photos={event.photos}
                coverPhoto={event.coverPhoto}
                eventTitle={event.title}
                sizes="100vw"
                priority={index === 0}
                paused={index !== current}
                speedUp={paused}
                intervalMs={3000}
                excludeCoverPhoto
              />
            </article>
          ))}
        </div>

        {count > 0 && (
          <div className="hero-carousel-shade" aria-hidden="true" />
        )}

        {count > 0 && (
          <div className="hero-event-caption" aria-live="polite">
            <div className="event-carousel-meta">
              {events[current]?.category && <span>{events[current].category}</span>}
              {events[current]?.date && (
                <time dateTime={events[current].date ?? undefined}>
                  {new Date(`${events[current].date}T00:00:00Z`).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    timeZone: "UTC",
                  })}
                </time>
              )}
            </div>
            <h2>{events[current]?.title}</h2>
            {events[current]?.caption && <p>{events[current].caption}</p>}
            <Link
              href={`/gallery/${encodeURIComponent(events[current]?.slug || events[current]?._id || "")}`}
              className="event-carousel-link"
            >
              View event <span aria-hidden="true">&#8594;</span>
            </Link>
          </div>
        )}

        {count > 1 && (
          <button
            className="carousel-btn carousel-prev"
            aria-label="Previous event"
            onClick={() => setCurrent((current - 1 + count) % count)}
          >
            &#8592;
          </button>
        )}
        {count > 1 && (
          <button
            className="carousel-btn carousel-next"
            aria-label="Next event"
            onClick={() => setCurrent((current + 1) % count)}
          >
            &#8594;
          </button>
        )}

        {count > 1 && (
          <div className="carousel-dots" aria-label="Choose an event">
            {events.map((event, index) => (
              <button
                key={event._id}
                type="button"
                className={`carousel-dot${index === current ? " active" : ""}`}
                aria-label={`Show event: ${event.title}`}
                aria-current={index === current ? "true" : undefined}
                onClick={() => setCurrent(index)}
              >
                <span className="visually-hidden">{event.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="hero-carousel-content">{children}</div>
    </section>
  );
}
