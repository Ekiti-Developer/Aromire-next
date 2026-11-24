"use client";

import { useState } from "react";
import { getVideoEmbedUrl } from "@/lib/video";

export default function YouTubeEmbed({ url, title }: { url: string; title: string }) {
  const [playing, setPlaying] = useState(false);
  const embedUrl = getVideoEmbedUrl(url);

  if (!embedUrl) {
    return (
      <a className="blog-video-link" href={url} target="_blank" rel="noreferrer">
        Watch {title || "the video"} on YouTube <span aria-hidden="true">↗</span>
      </a>
    );
  }

  if (playing) {
    return (
      <div className="blog-video-frame">
        <iframe
          src={embedUrl}
          title={title || "Blog video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      className="blog-video-poster"
      onClick={() => setPlaying(true)}
      aria-label={`Play video: ${title || "Blog video"}`}
    >
      <span className="blog-video-play" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M8 5.5v13l11-6.5-11-6.5Z" /></svg>
      </span>
      <span className="blog-video-label">Tap to play video</span>
    </button>
  );
}
