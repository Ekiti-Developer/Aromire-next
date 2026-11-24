/** Shared helpers for safely embedding video URLs from Sanity. */

function getYouTubeId(rawUrl?: string | null) {
  if (!rawUrl) return null;
  try {
    const url = new URL(rawUrl);
    if (url.protocol !== "https:") return null;
    const isYouTube =
      url.hostname === "youtu.be" ||
      ["youtube.com", "www.youtube.com", "m.youtube.com", "www.youtube-nocookie.com"].includes(
        url.hostname,
      );
    if (!isYouTube) return null;
    const id =
      url.hostname === "youtu.be"
        ? url.pathname.slice(1)
        : url.searchParams.get("v") ?? url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1];
    return id || null;
  } catch {
    return null;
  }
}

export function getVideoEmbedUrl(rawUrl?: string | null) {
  const id = getYouTubeId(rawUrl);
  if (id) return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`;

  if (!rawUrl) return null;
  try {
    const url = new URL(rawUrl);
    if (url.protocol !== "https:") return null;
    if (["vimeo.com", "www.vimeo.com", "player.vimeo.com"].includes(url.hostname)) {
      const videoId = url.pathname.match(/\d+/)?.[0];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
    }
  } catch {
    return null;
  }
  return null;
}

/** YouTube's public thumbnail for a video, used instead of an uploaded poster. */
export function getVideoThumbnailUrl(rawUrl?: string | null) {
  const id = getYouTubeId(rawUrl);
  return id ? `https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg` : null;
}

export function isDirectVideoUrl(rawUrl?: string | null) {
  if (!rawUrl) return false;
  try {
    const url = new URL(rawUrl);
    return url.protocol === "https:" && /\.(mp4|webm|ogg)$/i.test(url.pathname);
  } catch {
    return false;
  }
}
