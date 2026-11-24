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
  type PendingPage = Omit<StorybookPage, "spread" | "side" | "printedNumber">;
  type PhotoEntry = {
    photo: StorybookPhoto;
    chapterNumber: number;
    date?: string | null;
    hasStory: boolean;
  };

  const push = (page: Omit<StorybookPage, "spread" | "side" | "printedNumber"> & {
    side?: "left" | "right";
    printedNumber?: number;
  }) => {
    const side = page.side ?? (pages.length % 2 === 0 ? "left" : "right");
    const printedNumber = page.printedNumber ?? (pages.length === 0 ? undefined : pages.length + 1);
    pages.push({ ...page, spread, side, printedNumber });
  };

  const makePlate = (entry: PhotoEntry, inline: boolean): PendingPage => {
    const { photo, chapterNumber } = entry;
    return {
      id: `photo-${photo._key}`,
      kind: "photoPlate",
      chapterNumber,
      photoKey: photo._key,
      isVideo: false,
      videoUrl: photo.videoUrl ?? null,
      image: photo.image ?? null,
      caption: photo.caption ?? "",
      secondaryBody: photo.storyLine ?? undefined,
      locationLabel: photo.location?.name ?? undefined,
      showCaptionInline: mobile || inline,
    };
  };

  const makeCaption = (entry: PhotoEntry): PendingPage => {
    const { photo, chapterNumber, date } = entry;
    return {
      id: `photo-${photo._key}-caption`,
      kind: "photoCaption",
      chapterNumber,
      photoKey: photo._key,
      skipOnMobile: true,
      eyebrow: `Chapter ${pad(chapterNumber)}${date ? ` · ${formatDate(date)}` : ""}`,
      title: photo.caption ?? "",
      locationLabel: photo.location?.name ?? undefined,
      body: photo.storyLine ?? undefined,
      isVideo: false,
      videoUrl: photo.videoUrl ?? null,
      image: photo.image ?? null,
    };
  };

  // Pair pages as they arrive. A picture with no story never gets a caption
  // page — the next picture takes the facing page instead.
  let buffered: PendingPage | null = null;
  const pair = (page: PendingPage) => {
    if (!buffered) {
      buffered = page;
      return;
    }
    spread += 1;
    push(buffered);
    push(page);
    buffered = null;
  };

  const emitPhotos = (photos: StorybookPhoto[] | null | undefined, chapterNumber: number, date?: string | null) => {
    (photos ?? [])
      .filter((photo) => photo.mediaType !== "video")
      .forEach((photo) => {
        // A caption and location already sit on the plate. Only a real story
        // line earns a facing page; otherwise the next picture does.
        const hasStory = Boolean((photo.storyLine ?? "").trim());
        const entry: PhotoEntry = { photo, chapterNumber, date, hasStory };
        pair(makePlate(entry, !hasStory));
        if (hasStory && !mobile) pair(makeCaption(entry));
      });
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

    emitPhotos(chapter.photos, chapterNumber, chapter.date);
  });

  if (buffered) {
    const remaining: PendingPage = buffered;
    if (remaining.kind === "photoCaption") {
      // Final story has no facing picture: show it on the plate itself.
      const plate = pages.find((page) => page.kind === "photoPlate" && page.photoKey === remaining.photoKey);
      if (plate) plate.showCaptionInline = true;
    } else {
      // Final picture has no story: take the last caption slot so two pictures
      // share a spread instead of a blank page sitting beside it.
      let captionIndex = -1;
      for (let index = pages.length - 1; index >= 0; index -= 1) {
        if (pages[index].kind === "photoCaption") {
          captionIndex = index;
          break;
        }
      }
      if (captionIndex >= 0) {
        const caption = pages[captionIndex];
        const plate = pages.find((page) => page.kind === "photoPlate" && page.photoKey === caption.photoKey);
        if (plate) plate.showCaptionInline = true;
        pages[captionIndex] = {
          ...remaining,
          spread: caption.spread,
          side: caption.side,
          printedNumber: caption.printedNumber,
        };
      } else {
        // No authored story anywhere: pair the picture with the cover image.
        spread += 1;
        push(remaining);
        push({
          id: `photo-${remaining.photoKey}-companion`,
          kind: "photoCaption",
          chapterNumber: remaining.chapterNumber ?? 0,
          photoKey: remaining.photoKey,
          skipOnMobile: true,
          eyebrow: "The story so far",
          title: program.title,
          body: program.hook ?? undefined,
          image: program.cover ?? null,
        });
      }
    }
    buffered = null;
  }

  pages.forEach((page, index) => {
    if (page.kind === "photoPlate" && page.photoKey) photoToPage[page.photoKey] = index;
  });

  // Final spread: "Where it leads" on its own page, then "The end" as the
  // last page carrying the single CTA and (when available) the next story.
  spread += 1;
  const testimonial = program.featuredTestimonial?.consentConfirmed
    ? {
        name: program.featuredTestimonial.name || "A community member",
        role: program.featuredTestimonial.role || "",
        quote: program.featuredTestimonial.quote || "",
      }
    : null;
  const endingIndex = pages.length + 1;
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
