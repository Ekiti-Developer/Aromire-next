/**
 * Pure page-model builder for the Programs storybook viewer.
 *
 * This module has no React / Next.js imports on purpose: it can be unit tested
 * directly with `node --test`. The input type is a structural subset of the
 * `ProgramDetail` type returned by the GROQ queries, so a fetched program can
 * be passed straight into `buildPages`.
 */

export type StorybookImage = {
  url?: string | null;
  alt?: string | null;
  lqip?: string | null;
};

export type StorybookPhoto = {
  _key: string;
  mediaType?: string | null;
  caption?: string | null;
  storyLine?: string | null;
  image?: StorybookImage | null;
  videoUrl?: string | null;
  poster?: StorybookImage | null;
  location?: { name?: string | null } | null;
};

export type StorybookChapter = {
  _key: string;
  dayLabel?: string | null;
  date?: string | null;
  headline?: string | null;
  narrative?: string | null;
  pullQuote?: { text?: string | null; attribution?: string | null } | null;
  locations?: Array<{ name?: string | null }> | null;
  photos?: StorybookPhoto[] | null;
};

export type StorybookProgram = {
  _id: string;
  title: string;
  slug: string;
  startDate?: string | null;
  endDate?: string | null;
  hook?: string | null;
  intro?: string | null;
  summary?: string | null;
  ending?: string | null;
  cover?: StorybookImage | null;
  partnersCount?: number | null;
  storyCta?: { label?: string; href?: string } | null;
  chapters?: StorybookChapter[] | null;
  featuredTestimonial?: {
    name?: string | null;
    role?: string | null;
    quote?: string | null;
    consentConfirmed?: boolean | null;
  } | null;
};

export type StorybookNextStory = { title: string; slug: string } | null;

export type StorybookPageKind =
  | "cover"
  | "intro"
  | "chapterTitle"
  | "chapterNarrative"
  | "photoPlate"
  | "photoCaption"
  | "ending"
  | "theEnd";

/**
 * A single page in the book. Optional fields are grouped here instead of in a
 * discriminated union so the renderer can stay a small, readable component.
 * `kind` is the discriminant used by the viewer.
 */
export type StorybookPage = {
  id: string;
  kind: StorybookPageKind;
  /** Zero-based spread (two facing pages) this page belongs to. */
  spread: number;
  side: "left" | "right";
  /** Printed page number; the cover is deliberately unnumbered. */
  printedNumber?: number;
  /** Caption pages are folded into the photo page on mobile. */
  skipOnMobile?: boolean;
  chapterNumber?: number;
  photoKey?: string;
  eyebrow?: string;
  title?: string;
  body?: string;
  secondaryBody?: string;
  numeral?: string;
  dateLabel?: string;
  locationLabel?: string;
  image?: StorybookImage | null;
  caption?: string;
  quote?: string;
  attribution?: string;
  isVideo?: boolean;
  videoUrl?: string | null;
  showCaptionInline?: boolean;
  facts?: {
    days: number;
    locations: number;
    partners: number;
    photos: number;
    videos: number;
  };
  testimonial?: {
    name: string;
    role: string;
    quote: string;
  } | null;
  nextStory?: StorybookNextStory;
  ctaLabel?: string;
  ctaHref?: string;
};

export type StorybookContentsItem = {
  label: string;
  page: number;
  chapterNumber: number;
};

export type StorybookModel = {
  pages: StorybookPage[];
  /** Photo `_key` -> index of its photo plate in `pages`. */
  photoToPage: Record<string, number>;
  contents: StorybookContentsItem[];
  totals: {
    days: number;
    locations: number;
    partners: number;
    photos: number;
    videos: number;
  };
};

export type BuildPagesOptions = {
  /** Mobile omits standalone caption pages and shows captions under photos. */
  mobile?: boolean;
  nextStory?: StorybookNextStory;
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function joinedNames(items: Array<{ name?: string | null }> | null | undefined) {
  const names = (items ?? []).map((item) => item?.name).filter((name): name is string => Boolean(name));
  return names.length > 0 ? names.join(", ") : undefined;
}

/**
 * Build the flat, even-length page list for a program.
 *
 * Every spread contributes exactly two pages (cover/intro, chapter
 * title/narrative, photo plate/caption, ending/the end), so the result is
 * always even — which matters for the two-up desktop book.
 */
export function buildPages(program: StorybookProgram, options: BuildPagesOptions = {}): StorybookModel {
  const mobile = options.mobile === true;
  const chapters = program.chapters ?? [];
  const allMedia = chapters.flatMap((chapter) => chapter.photos ?? []);
  const allPhotos = allMedia.filter((photo) => photo.mediaType !== "video");
  const allVideos = allMedia.filter((photo) => photo.mediaType === "video");
  const uniqueLocations = new Set<string>();
  for (const chapter of chapters) {
    for (const location of chapter.locations ?? []) {
      if (location?.name) uniqueLocations.add(location.name);
    }
  }
  for (const photo of allPhotos) {
    if (photo.location?.name) uniqueLocations.add(photo.location.name);
  }

  const facts = {
    days: chapters.length,
    locations: uniqueLocations.size,
    partners: typeof program.partnersCount === "number" ? program.partnersCount : 0,
    photos: allPhotos.length,
    videos: allVideos.length,
  };

  const pages: StorybookPage[] = [];
  const photoToPage: Record<string, number> = {};
  const contents: StorybookContentsItem[] = [];
  let spread = 0;
  const textless = { photo: null as { emitPlate: () => void; emitCaption: () => void } | null };

  const push = (page: Omit<StorybookPage, "spread" | "side" | "printedNumber"> & {
    side?: "left" | "right";
    printedNumber?: number;
  }) => {
    const side = page.side ?? (pages.length % 2 === 0 ? "left" : "right");
    const printedNumber = page.printedNumber ?? (pages.length === 0 ? undefined : pages.length + 1);
    pages.push({ ...page, spread, side, printedNumber });
  };

  // Spread 1: cover + intro
  push({
    id: "cover",
    kind: "cover",
    eyebrow: "A story from the field",
    title: program.title,
    body: program.hook ?? undefined,
    dateLabel: formatDateRange(program.startDate, program.endDate),
    image: program.cover ?? null,
    printedNumber: undefined,
  });
  push({
    id: "intro",
    kind: "intro",
    eyebrow: "The story so far",
    title: program.title,
    body: program.intro ?? program.summary ?? "",
    facts,
  });
  contents.push({ label: "Cover", page: 0, chapterNumber: 0 });

  chapters.forEach((chapter, chapterIndex) => {
    const chapterNumber = chapterIndex + 1;
    spread += 1;
    const titleIndex = pages.length;
    push({
      id: `chapter-${chapterNumber}-title`,
      kind: "chapterTitle",
      chapterNumber,
      numeral: pad(chapterNumber),
      eyebrow: `Chapter ${pad(chapterNumber)}`,
      title: chapter.headline || chapter.dayLabel || `Chapter ${chapterNumber}`,
      dateLabel: [chapter.date ? formatDate(chapter.date) : null, joinedNames(chapter.locations)]
        .filter(Boolean)
        .join(" · "),
    });
    push({
      id: `chapter-${chapterNumber}-narrative`,
      kind: "chapterNarrative",
      chapterNumber,
      title: chapter.headline || chapter.dayLabel || `Chapter ${chapterNumber}`,
      body: chapter.narrative ?? "",
      quote: chapter.pullQuote?.text ?? undefined,
      attribution: chapter.pullQuote?.attribution ?? undefined,
    });
    contents.push({
      label: chapter.headline || chapter.dayLabel || `Chapter ${chapterNumber}`,
      page: titleIndex,
      chapterNumber,
    });

    (chapter.photos ?? [])
      .filter((photo) => photo.mediaType !== "video")
      .forEach((photo) => {
      const locationLabel = photo.location?.name ?? undefined;
      const isVideo = photo.mediaType === "video";
      const image = isVideo ? photo.poster ?? null : photo.image ?? null;
      const caption = photo.caption ?? "";
      const hasText = Boolean(
        caption.trim() || (photo.storyLine ?? "").trim() || (locationLabel ?? "").trim(),
      );

      const emitPlate = () => {
        push({
          id: `photo-${photo._key}`,
          kind: "photoPlate",
          chapterNumber,
          photoKey: photo._key,
          isVideo,
          videoUrl: photo.videoUrl ?? null,
          image,
          caption,
          secondaryBody: photo.storyLine ?? undefined,
          locationLabel,
          showCaptionInline: mobile,
        });
        photoToPage[photo._key] = pages.length - 1;
      };

      const emitCaption = () => {
        push({
          id: `photo-${photo._key}-caption`,
          kind: "photoCaption",
          chapterNumber,
          photoKey: photo._key,
          skipOnMobile: true,
          eyebrow: `Chapter ${pad(chapterNumber)}${chapter.date ? ` · ${formatDate(chapter.date)}` : ""}`,
          title: caption,
          locationLabel,
          body: photo.storyLine ?? undefined,
          isVideo,
          videoUrl: photo.videoUrl ?? null,
          image,
        });
      };

      if (mobile) {
        spread += 1;
        emitPlate();
        return;
      }

      // With no caption, story line or location, two photos share one spread so
      // they sit side by side instead of facing a blank caption page.
      if (!hasText) {
        if (textless.photo) {
          spread += 1;
          textless.photo.emitPlate();
          emitPlate();
          textless.photo = null;
        } else {
          textless.photo = { emitPlate, emitCaption };
        }
        return;
      }

      if (textless.photo) {
        spread += 1;
        textless.photo.emitPlate();
        textless.photo.emitCaption();
        textless.photo = null;
      }
      spread += 1;
      emitPlate();
      emitCaption();
    });
  });

  if (textless.photo) {
    spread += 1;
    textless.photo.emitPlate();
    textless.photo.emitCaption();
  }

  // Final spread: where it leads + a video recap (or the end when no video).
  spread += 1;
  const testimonial = program.featuredTestimonial?.consentConfirmed
    ? {
        name: program.featuredTestimonial.name || "A community member",
        role: program.featuredTestimonial.role || "",
        quote: program.featuredTestimonial.quote || "",
      }
    : null;
  const endingIndex = pages.length;
  const ctaLabel = program.storyCta?.label?.trim() || "Help us write the next one";
  const ctaHref = program.storyCta?.href?.trim() || "/volunteer";
  push({
    id: "ending",
    kind: "ending",
    eyebrow: "Where it leads",
    title: "Where it leads",
    body: program.ending ?? "Every chapter was written with the people we met. Help us write the next one.",
    facts,
    testimonial,
    nextStory: options.nextStory ?? null,
    ctaLabel,
    ctaHref,
  });

  push({
    id: "the-end",
    kind: "theEnd",
    eyebrow: "The end",
    title: "The end",
    body: "Every chapter was written with the people we met. Help us write the next one.",
    quote: testimonial?.quote,
    attribution: testimonial?.name,
    nextStory: options.nextStory ?? null,
    ctaLabel,
    ctaHref,
  });
  contents.push({ label: "The end", page: endingIndex, chapterNumber: 0 });

  const filteredPages = mobile ? pages.filter((page) => !page.skipOnMobile) : pages;
  const filteredMap = mobile ? remapPhotoIndices(photoToPage, pages, filteredPages) : photoToPage;
  const filteredContents = mobile ? remapContents(contents, pages, filteredPages) : contents;

  return {
    pages: filteredPages,
    photoToPage: filteredMap,
    contents: filteredContents,
    totals: facts,
  };
}

function indexMap(pages: StorybookPage[], filteredPages: StorybookPage[]) {
  const oldToNew = new Map<number, number>();
  filteredPages.forEach((page) => {
    const originalIndex = pages.findIndex((candidate) => candidate.id === page.id);
    oldToNew.set(originalIndex, filteredPages.indexOf(page));
  });
  return oldToNew;
}

function remapPhotoIndices(
  photoToPage: Record<string, number>,
  pages: StorybookPage[],
  filteredPages: StorybookPage[],
) {
  const oldToNew = indexMap(pages, filteredPages);
  const result: Record<string, number> = {};
  for (const [key, index] of Object.entries(photoToPage)) {
    const mapped = oldToNew.get(index);
    if (mapped !== undefined) result[key] = mapped;
  }
  return result;
}

function remapContents(
  contents: StorybookContentsItem[],
  pages: StorybookPage[],
  filteredPages: StorybookPage[],
) {
  const oldToNew = indexMap(pages, filteredPages);
  return contents.map((item) => ({
    ...item,
    page: oldToNew.get(item.page) ?? item.page,
  }));
}

export function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatDateRange(start?: string | null, end?: string | null) {
  const first = formatDate(start);
  const last = formatDate(end);
  if (!first) return "";
  return last && last !== first ? `${first} – ${last}` : first;
}
