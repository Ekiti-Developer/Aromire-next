import type { GalleryEventResult } from "@/content/gallery";

export const galleryEventsQuery = `*[_type == "galleryItem"] | order(date desc, _createdAt desc) {
  _id,
  title,
  "slug": slug.current,
  category,
  caption,
  date,
  "photos": images[]{
    _key,
    "src": asset->url + "?auto=format&fit=max&w=1600&q=80",
    alt,
    caption
  },
  "legacyPhoto": {
    "src": image.asset->url + "?auto=format&fit=max&w=1600&q=80",
    "alt": image.alt,
    "caption": null
  },
  "coverPhoto": {
    "src": coverImage.asset->url + "?auto=format&fit=max&w=1600&q=80",
    "alt": coverImage.alt,
    "caption": null
  }
}`;

export const galleryEventQuery = `*[_type == "galleryItem" && (slug.current == $slug || _id == $slug)][0] {
  _id,
  title,
  "slug": slug.current,
  category,
  caption,
  date,
  "photos": images[]{
    _key,
    "src": asset->url + "?auto=format&fit=max&w=1600&q=80",
    alt,
    caption
  },
  "legacyPhoto": {
    "src": image.asset->url + "?auto=format&fit=max&w=1600&q=80",
    "alt": image.alt,
    "caption": null
  },
  "coverPhoto": {
    "src": coverImage.asset->url + "?auto=format&fit=max&w=1600&q=80",
    "alt": coverImage.alt,
    "caption": null
  },
  "videos": videos[]{_key, title, url, caption}
}`;

export const galleryEventTitleQuery = `*[_type == "galleryItem" && (slug.current == $slug || _id == $slug)][0]{title}`;

export type { GalleryEventResult };