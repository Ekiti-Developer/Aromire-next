export type GalleryPhoto = {
  src: string;
  alt: string | null;
  caption: string | null;
};

export type GalleryEvent = {
  _id: string;
  title: string;
  slug: string | null;
  category: string | null;
  caption: string | null;
  date: string | null;
  photos: GalleryPhoto[];
  coverPhoto: GalleryPhoto | null;
};

type GalleryPhotoResult = Omit<GalleryPhoto, "src"> & {
  _key?: string;
  src: string | null;
};

export type GalleryEventResult = Omit<GalleryEvent, "photos" | "coverPhoto"> & {
  photos: GalleryPhotoResult[] | null;
  legacyPhoto: GalleryPhotoResult | null;
  coverPhoto: GalleryPhotoResult | null;
};

export type GalleryVideo = {
  _key: string;
  title: string;
  url: string;
  caption: string | null;
};

export type GalleryEventDetailResult = GalleryEventResult & {
  videos: GalleryVideo[] | null;
};

export function normalizeGalleryEvents(events: GalleryEventResult[]): GalleryEvent[] {
  return events.map(({ photos, legacyPhoto, coverPhoto, ...event }) => {
    const eventPhotos = (photos ?? []).flatMap((photo) =>
      photo.src ? [{ src: photo.src, alt: photo.alt, caption: photo.caption }] : [],
    );

    if (eventPhotos.length === 0 && legacyPhoto?.src) {
      eventPhotos.push({
        src: legacyPhoto.src,
        alt: legacyPhoto.alt,
        caption: legacyPhoto.caption,
      });
    }

    const normalizedCover = coverPhoto?.src
      ? { src: coverPhoto.src, alt: coverPhoto.alt, caption: coverPhoto.caption }
      : eventPhotos[0] ?? null;

    return { ...event, photos: eventPhotos, coverPhoto: normalizedCover };
  });
}
