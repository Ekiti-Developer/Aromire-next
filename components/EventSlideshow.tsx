"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { GalleryPhoto } from "@/content/gallery";

const PHOTO_INTERVAL_MS = 2000;
const HOVER_PHOTO_INTERVAL_MS = 1000;

export default function EventSlideshow({
  photos,
  coverPhoto,
  eventTitle,
  sizes,
  paused = false,
  speedUp = false,
  intervalMs,
  excludeCoverPhoto = false,
  controlsBelow = false,
  priority = false,
}: {
  photos: GalleryPhoto[];
  coverPhoto?: GalleryPhoto | null;
  eventTitle: string;
  sizes: string;
  paused?: boolean;
  speedUp?: boolean;
  intervalMs?: number;
  excludeCoverPhoto?: boolean;
  controlsBelow?: boolean;
  priority?: boolean;
}) {
  const slides = excludeCoverPhoto
    ? photos.filter((photo) => photo.src !== coverPhoto?.src)
    : coverPhoto
      ? [coverPhoto, ...photos.filter((photo) => photo.src !== coverPhoto.src)]
      : photos;
  const [current, setCurrent] = useState(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const timer = setTimeout(
      () => setCurrent((index) => (index + 1) % slides.length),
      intervalMs ?? (hovered || speedUp ? HOVER_PHOTO_INTERVAL_MS : PHOTO_INTERVAL_MS),
    );
    return () => clearTimeout(timer);
  }, [current, hovered, intervalMs, paused, slides.length, speedUp]);

  if (slides.length === 0) return null;
  const photo = slides[current] ?? slides[0];

  return (
    <div
      className={`event-photo-slideshow${controlsBelow ? " controls-below" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="group"
      aria-label={`${eventTitle} photos`}
    >
      <div className="event-photo-stage">
        <Image
          key={photo.src}
          src={photo.src}
          alt={photo.alt || eventTitle}
          fill
          sizes={sizes}
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          className="event-photo-image"
        />
        {photo.caption && <p className="event-photo-caption">{photo.caption}</p>}
      </div>
      {slides.length > 1 && (
        <div className="event-photo-controls">
          <button
            className="event-photo-arrow"
            type="button"
            aria-label="Previous photo"
            onClick={() => setCurrent((index) => (index - 1 + slides.length) % slides.length)}
          >
            &#8592;
          </button>
          <div className="event-photo-dots" role="group" aria-label={`Choose a ${eventTitle} photo`}>
            {slides.map((slide, index) => (
              <button
                key={`${slide.src}-${index}`}
                className={`event-photo-dot${index === current ? " active" : ""}`}
                type="button"
                aria-label={`Show photo ${index + 1} of ${slides.length}`}
                aria-current={index === current ? "true" : undefined}
                onClick={() => setCurrent(index)}
              />
            ))}
          </div>
          <button
            className="event-photo-arrow"
            type="button"
            aria-label="Next photo"
            onClick={() => setCurrent((index) => (index + 1) % slides.length)}
          >
            &#8594;
          </button>
        </div>
      )}
    </div>
  );
}