export type GalleryPhoto = {
  src: string;
  alt: string | null;
  caption: string | null;
};

export type GalleryDay = {
  _key: string;
  title: string | null;
  date: string | null;
  photos: GalleryPhoto[];
};

export type GalleryEvent = {
  _id: string;
  title: string;
  slug: string | null;
  category: string | null;
  caption: string | null;
  date: string | null;
  days: GalleryDay[];
  photos: GalleryPhoto[];
  coverPhoto: GalleryPhoto | null;
};

type GalleryPhotoResult = Omit<GalleryPhoto, "src"> & {
  _key?: string;
  src: string | null;
};

type GalleryDayResult = Omit<GalleryDay, "photos"> & {
  photos: GalleryPhotoResult[] | null;
};

export type GalleryEventResult = Omit<GalleryEvent, "photos" | "coverPhoto" | "days"> & {
  photos: GalleryPhotoResult[] | null;
  legacyPhoto: GalleryPhotoResult | null;
  coverPhoto: GalleryPhotoResult | null;
  days: GalleryDayResult[] | null;
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
  return events.map(({ photos, legacyPhoto, coverPhoto, days, ...event }) => {
    let eventPhotos = (photos ?? []).flatMap((photo) =>
      photo.src ? [{ src: photo.src, alt: photo.alt, caption: photo.caption }] : [],
    );

    if (eventPhotos.length === 0 && legacyPhoto?.src) {
      eventPhotos.push({
        src: legacyPhoto.src,
        alt: legacyPhoto.alt,
        caption: legacyPhoto.caption,
      });
    }

    const eventDays = (days ?? []).map((day) => ({
      ...day,
      photos: (day.photos ?? []).flatMap((photo) =>
        photo.src ? [{ src: photo.src, alt: photo.alt, caption: photo.caption }] : [],
      ),
    }));

    if (eventDays.length > 0 && eventPhotos.length > 0) {
      eventDays.unshift({
        _key: "event-photos",
        title: "Other event photos",
        date: event.date,
        photos: eventPhotos,
      });
    } else if (eventDays.length > 0) {
      eventPhotos = eventDays.flatMap((day) => day.photos);
    }

    const allPhotos = eventDays.length > 0 ? eventDays.flatMap((day) => day.photos) : eventPhotos;
    const normalizedCover = coverPhoto?.src
      ? { src: coverPhoto.src, alt: coverPhoto.alt, caption: coverPhoto.caption }
      : allPhotos[0] ?? null;

    return { ...event, days: eventDays, photos: allPhotos, coverPhoto: normalizedCover };
  });
}

export function formatGalleryEventDate(event: Pick<GalleryEvent, "date" | "days">) {
  const dayDates = event.days.map((day) => day.date).filter((date): date is string => Boolean(date));
  const firstDate = dayDates[0] ?? event.date;
  const lastDate = dayDates.at(-1) ?? firstDate;
  if (!firstDate) return null;

  const formatDate = (date: string) =>
    new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });

  return lastDate && lastDate !== firstDate
    ? `${formatDate(firstDate)} – ${formatDate(lastDate)}`
    : formatDate(firstDate);
}
