"use client";

import Image from "next/image";
import { useState } from "react";
import { getVideoEmbedUrl, getVideoThumbnailUrl, isDirectVideoUrl } from "@/lib/video";

export default function VideoPoster({
  url,
  posterUrl,
  posterAlt,
  title,
  className = "",
}: {
  url?: string | null;
  posterUrl?: string | null;
  posterAlt?: string | null;
  title: string;
  className?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const embedUrl = getVideoEmbedUrl(url);
  const thumbnailUrl = getVideoThumbnailUrl(url);
  const posterSrc = thumbnailUrl || posterUrl;
  const direct = isDirectVideoUrl(url);

  if (playing && embedUrl) {
    return (
      <div className={`video-poster-frame ${className}`}>
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
      <div className={`video-poster-frame ${className}`}>
        <video controls autoPlay playsInline preload="metadata">
          <source src={url ?? ""} />
        </video>
      </div>
    );
  }

  return (
    <button
      type="button"
      className={`video-poster ${className}`}
      onClick={() => setPlaying(true)}
      aria-label={`Play video: ${title}`}
    >
      {posterSrc ? (
        <Image src={posterSrc} alt={posterAlt || title} fill sizes="(max-width: 700px) 100vw, 50vw" />
      ) : (
        <span className="video-poster-fallback" aria-hidden="true">&#9654;</span>
      )}
      <span className="video-poster-play" aria-hidden="true">&#9654;</span>
    </button>
  );
}
