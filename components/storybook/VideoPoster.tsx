"use client";

import Image from "next/image";
import { useState } from "react";
import { getVideoEmbedUrl, getVideoThumbnailUrl, isDirectVideoUrl } from "@/lib/video";
import { normalizeAlt } from "@/lib/alt-text";

export default function VideoPoster({
  url,
  posterUrl,
  posterAlt,
  title,
  caption,
  sizes = "(max-width: 700px) 100vw, 50vw",
  variant = "default",
  className = "",
}: {
  url?: string | null;
  posterUrl?: string | null;
  posterAlt?: string | null;
  title: string;
  caption?: string | null;
  sizes?: string;
  variant?: "default" | "tile";
  className?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const embedUrl = getVideoEmbedUrl(url);
  const thumbnailUrl = getVideoThumbnailUrl(url);
  const posterSrc = thumbnailUrl || posterUrl;
  const direct = isDirectVideoUrl(url);
  const modifier = variant === "tile" ? " video-poster-tile" : "";

  if (playing && embedUrl) {
    return (
      <div className={`video-poster-frame ${className}${modifier}`}>
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  if (playing && direct) {
    return (
      <div className={`video-poster-frame ${className}${modifier}`}>
        <video controls autoPlay playsInline preload="metadata">
          <source src={url ?? ""} />
        </video>
      </div>
    );
  }

  return (
    <button
      type="button"
      className={`video-poster ${className}${modifier}`}
      onClick={() => setPlaying(true)}
      aria-label={`Play video: ${title}`}
    >
      {posterSrc ? (
        <Image src={posterSrc} alt={normalizeAlt(posterAlt, title)} fill sizes={sizes} />
      ) : (
        <span className="video-poster-fallback" aria-hidden="true">&#9654;</span>
      )}
      <span className="video-poster-play" aria-hidden="true">&#9654;</span>
      {caption && <span className="story-photo-caption">{caption}</span>}
    </button>
  );
}
