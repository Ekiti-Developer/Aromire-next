"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { getVideoEmbedUrl, isDirectVideoUrl } from "@/lib/video";

export type LightboxItem = {
  key: string;
  type: "image" | "video";
  src: string;
  alt: string;
  caption?: string | null;
  videoUrl?: string | null;
};

/** Fullscreen viewer with previous/next controls across all program media. */
export default function PhotoLightbox({
  items,
  initialIndex,
  className,
  label,
  children,
}: {
  items: LightboxItem[];
  initialIndex: number;
  className: string;
  label: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(initialIndex);
  const closeRef = useRef<HTMLButtonElement>(null);
  const item = items[index] ?? items[0];

  const go = useCallback(
    (delta: number) => setIndex((current) => (current + delta + items.length) % items.length),
    [items.length],
  );

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      else if (event.key === "ArrowRight") go(1);
      else if (event.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    const frame = requestAnimationFrame(() => closeRef.current?.focus({ preventScroll: true }));
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, go]);

  if (!item) return <>{children}</>;

  const embedUrl = item.type === "video" ? getVideoEmbedUrl(item.videoUrl) : null;
  const direct = item.type === "video" && isDirectVideoUrl(item.videoUrl);

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => {
          setIndex(initialIndex);
          setOpen(true);
        }}
        aria-label={label}
      >
        {children}
      </button>
      {open && (
        <div
          className="photo-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={item.caption || item.alt || "Media"}
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            ref={closeRef}
            className="photo-lightbox-close"
            onClick={() => setOpen(false)}
            aria-label="Close photo"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>

          {items.length > 1 && (
            <button
              type="button"
              className="photo-lightbox-nav prev"
              onClick={(event) => {
                event.stopPropagation();
                go(-1);
              }}
              aria-label="Previous media"
            >
              &#8249;
            </button>
          )}

          <figure className="photo-lightbox-figure" onClick={(event) => event.stopPropagation()}>
            {embedUrl ? (
              <iframe
                className="photo-lightbox-video"
                src={embedUrl}
                title={item.caption || item.alt || "Video"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : direct ? (
              <video className="photo-lightbox-video" controls autoPlay playsInline>
                <source src={item.videoUrl ?? ""} />
              </video>
            ) : (
              // Full-size original: the optimised thumbnail is only for the grid.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.src} alt={item.alt} />
            )}
            <figcaption>
              {item.caption || item.alt}
              {items.length > 1 && <span className="photo-lightbox-count"> · {index + 1} / {items.length}</span>}
            </figcaption>
          </figure>

          {items.length > 1 && (
            <button
              type="button"
              className="photo-lightbox-nav next"
              onClick={(event) => {
                event.stopPropagation();
                go(1);
              }}
              aria-label="Next media"
            >
              &#8250;
            </button>
          )}
        </div>
      )}
    </>
  );
}
