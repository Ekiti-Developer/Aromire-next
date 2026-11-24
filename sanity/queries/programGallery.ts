import type {GalleryEventDetailResult, GalleryEventResult} from "@/content/gallery";

const programGalleryFields = `
  _id, title, "slug": slug.current, "category": null, "caption": summary, "date": startDate,
  "photos": [],
  "legacyPhoto": null,
  "coverPhoto": {
    "src": cover.asset->url,
    "alt": cover.alt,
    "caption": null
  },
  "days": chapters[]{
    _key, "title": dayLabel, date,
    "photos": photos[mediaType == "image" && defined(image.asset)][]{
      _key,
      "src": image.asset->url,
      "alt": image.alt,
      caption
    }
  }
`;

export const programGalleryEventsQuery = `*[_type == "program" && status == "published" && isSample != true] | order(startDate desc) {${programGalleryFields}}`;

export const programGalleryEventQuery = `*[_type == "program" && slug.current == $slug && status == "published" && isSample != true][0]{
  ${programGalleryFields},
  "videos": chapters[].photos[mediaType == "video" && defined(videoUrl)][]{
    _key, "title": caption, "url": videoUrl, "caption": storyLine
  }
}`;

export const programGalleryEventTitleQuery = `*[_type == "program" && slug.current == $slug && status == "published" && isSample != true][0]{title}`;

export type ProgramGalleryEventResult = GalleryEventResult;
export type ProgramGalleryEventDetailResult = GalleryEventDetailResult;
