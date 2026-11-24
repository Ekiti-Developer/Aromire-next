import test from "node:test";
import assert from "node:assert/strict";
import { buildPages, type StorybookProgram } from "./storybook.ts";
import { getVideoThumbnailUrl } from "./video.ts";

function program(overrides: Partial<StorybookProgram> = {}): StorybookProgram {
  return {
    _id: "p1",
    title: "A test program",
    slug: "a-test-program",
    startDate: "2026-03-02",
    endDate: "2026-03-04",
    hook: "A hook",
    intro: "An introduction.",
    summary: "A summary.",
    ending: "Where it leads.",
    cover: { url: "https://cdn.sanity.io/cover.png", alt: "Cover" },
    partnersCount: 4,
    chapters: [],
    ...overrides,
  };
}

const photo = (key: string, mediaType: string = "image") => ({
  _key: key,
  mediaType,
  caption: `Caption ${key}`,
  storyLine: `Story line ${key}`,
  image: { url: `https://cdn.sanity.io/${key}.png`, alt: key },
  location: { name: "Apapa Community Hall" },
});

const chapter = (key: string, photos: ReturnType<typeof photo>[]) => ({
  _key: key,
  dayLabel: "Health checks",
  date: "2026-03-02",
  headline: `Headline ${key}`,
  narrative: "The narrative.",
  pullQuote: { text: "A quote", attribution: "A participant" },
  locations: [{ name: "Apapa Community Hall" }],
  photos,
});

test("YouTube videos use YouTube thumbnails", () => {
  assert.equal(
    getVideoThumbnailUrl("https://www.youtube.com/watch?v=abc123"),
    "https://i.ytimg.com/vi/abc123/hqdefault.jpg",
  );
  assert.equal(
    getVideoThumbnailUrl("https://youtu.be/abc123"),
    "https://i.ytimg.com/vi/abc123/hqdefault.jpg",
  );
  assert.equal(getVideoThumbnailUrl("https://vimeo.com/123"), null);
});

test("the page list is always even, even with no chapters", () => {
  const model = buildPages(program());
  assert.equal(model.pages.length % 2, 0);
  assert.equal(model.pages.length, 4);
  assert.deepEqual(
    model.pages.map((page) => page.kind),
    ["cover", "intro", "ending", "theEnd"],
  );
});

test("chapters and photos produce one spread each", () => {
  const model = buildPages(
    program({
      chapters: [chapter("day1", [photo("a"), photo("b"), photo("v", "video")]), chapter("day2", [photo("c")])],
    }),
  );
  assert.equal(model.pages.length % 2, 0);
  assert.equal(model.pages.length, 2 + (2 + 2 * 2) + (2 + 1 * 2) + 2);
});

test("video media stays in the data but is excluded from the picture-only book", () => {
  const video = {
    ...photo("v", "video"),
    videoUrl: "https://www.youtube.com/watch?v=abc123",
    poster: { url: "https://cdn.sanity.io/recap.png", alt: "Recap" },
  };
  const model = buildPages(program({ chapters: [chapter("day1", [photo("a"), video])] }));

  assert.equal(model.pages.length % 2, 0);
  assert.equal(model.pages.at(-1)?.kind, "theEnd");
  assert.equal(model.pages.some((page) => page.isVideo), false);
  assert.equal(model.pages.some((page) => page.kind === "photoPlate" && page.photoKey === "v"), false);
  assert.equal(model.totals.videos, 1);
});

test("textless photos share a spread instead of facing a blank caption page", () => {
  const silent = (key: string) => ({ ...photo(key), caption: "", storyLine: "", location: { name: "" } });
  const model = buildPages(program({ chapters: [chapter("day1", [silent("a"), silent("b")])] }));
  const plates = model.pages.filter((page) => page.kind === "photoPlate");

  assert.equal(model.pages.length % 2, 0);
  assert.equal(plates.length, 2);
  assert.equal(model.pages.some((page) => page.kind === "photoCaption"), false);
  assert.equal(plates[0].spread, plates[1].spread);
});

test("a textless photo pairs with the next picture, even when that one has a story", () => {
  const silent = { ...photo("silent"), caption: "", storyLine: "", location: { name: "" } };
  const model = buildPages(program({ chapters: [chapter("day1", [silent, photo("told")])] }));
  const silentPlate = model.pages.find((page) => page.photoKey === "silent");
  const toldPlate = model.pages.find((page) => page.photoKey === "told");
  const blankCaptions = model.pages.filter(
    (page) => page.kind === "photoCaption" && !(page.title || "").trim(),
  );

  assert.equal(model.pages.length % 2, 0);
  assert.equal(blankCaptions.length, 0);
  assert.equal(silentPlate?.spread, toldPlate?.spread);
  // No spare page for a caption, so the story is shown on the plate itself.
  assert.equal(toldPlate?.showCaptionInline, true);
});

test("a trailing textless photo never faces a blank caption page", () => {
  const silent = (key: string) => ({ ...photo(key), caption: "", storyLine: "", location: { name: "" } });
  const model = buildPages(program({ chapters: [chapter("day1", [photo("told"), silent("last")])] }));
  const blankCaptions = model.pages.filter(
    (page) => page.kind === "photoCaption" && !(page.title || "").trim(),
  );
  const toldPlate = model.pages.find((page) => page.photoKey === "told" && page.kind === "photoPlate");
  const lastPlate = model.pages.find((page) => page.photoKey === "last" && page.kind === "photoPlate");

  assert.equal(model.pages.length % 2, 0);
  assert.equal(blankCaptions.length, 0);
  assert.equal(toldPlate?.spread, lastPlate?.spread);
  assert.equal(toldPlate?.showCaptionInline, true);
});

test("each chapter's pictures stay in order after its own text", () => {
  const model = buildPages(
    program({
      chapters: [
        chapter("day1", [photo("a"), photo("b")]),
        chapter("day2", [photo("c"), photo("d")]),
      ],
    }),
  );
  const indexOf = (id: string) => model.pages.findIndex((page) => page.id === id);

  const markers = [
    "chapter-1-title",
    "chapter-1-narrative",
    "photo-a",
    "photo-b",
    "chapter-2-title",
    "chapter-2-narrative",
    "photo-c",
    "photo-d",
  ].map(indexOf);

  assert.equal(markers.every((value) => value >= 0), true);
  assert.deepEqual(markers, [...markers].sort((a, b) => a - b));
});

test("the cover is unnumbered and every other page is numbered", () => {
  const model = buildPages(program({ chapters: [chapter("day1", [photo("a")])] }));
  assert.equal(model.pages[0].printedNumber, undefined);
  model.pages.slice(1).forEach((page, index) => {
    assert.equal(page.printedNumber, index + 2);
  });
});

test("photoToPage points each photo at its plate page", () => {
  const model = buildPages(program({ chapters: [chapter("day1", [photo("a"), photo("b")])] }));
  for (const key of ["a", "b"]) {
    const target = model.pages[model.photoToPage[key]];
    assert.equal(target.kind, "photoPlate");
    assert.equal(target.photoKey, key);
  }
});

test("contents lists the cover, each chapter and the end, in order", () => {
  const model = buildPages(program({ chapters: [chapter("day1", []), chapter("day2", [])] }));
  assert.deepEqual(
    model.contents.map((item) => item.label),
    ["Cover", "Headline day1", "Headline day2", "The end"],
  );
  assert.deepEqual(model.contents.map((item) => item.chapterNumber), [0, 1, 2, 0]);
  for (const item of model.contents) {
    assert.equal(model.pages[item.page].id !== undefined, true);
  }
});

test("mobile drops caption pages and keeps every photo plate", () => {
  const desktop = buildPages(program({ chapters: [chapter("day1", [photo("a"), photo("b")])] }));
  const mobile = buildPages(program({ chapters: [chapter("day1", [photo("a"), photo("b")])] }), { mobile: true });

  assert.equal(mobile.pages.some((page) => page.kind === "photoCaption"), false);
  assert.equal(mobile.pages.filter((page) => page.kind === "photoPlate").length, 2);
  assert.ok(mobile.pages.length < desktop.pages.length);
  assert.ok(mobile.pages.every((page) => page.skipOnMobile !== true));
  assert.ok(mobile.pages.filter((page) => page.kind === "photoPlate").every((page) => page.showCaptionInline === true));
});

test("mobile remaps photo and contents indices", () => {
  const mobile = buildPages(program({ chapters: [chapter("day1", [photo("a"), photo("b")])] }), { mobile: true });
  for (const [key, index] of Object.entries(mobile.photoToPage)) {
    assert.equal(mobile.pages[index].photoKey, key);
  }
  for (const item of mobile.contents) {
    assert.ok(mobile.pages[item.page]);
  }
});

test("totals count days, locations, partners, photos and videos", () => {
  const model = buildPages(
    program({ chapters: [chapter("day1", [photo("a"), photo("b"), photo("v", "video")])] }),
  );
  assert.deepEqual(model.totals, { days: 1, locations: 1, partners: 4, photos: 2, videos: 1 });
});

test("testimonials are included only with consent", () => {
  const withConsent = buildPages(
    program({
      featuredTestimonial: { name: "A member", role: "Volunteer", quote: "Thank you", consentConfirmed: true },
    }),
  );
  assert.equal(withConsent.pages.at(-2)?.testimonial?.quote, "Thank you");

  const withoutConsent = buildPages(
    program({
      featuredTestimonial: { name: "A member", role: "Volunteer", quote: "Thank you", consentConfirmed: false },
    }),
  );
  assert.equal(withoutConsent.pages.at(-2)?.testimonial, null);
});

test("only the final 'The end' page has the CTA and next story", () => {
  const nextStory = { title: "Another story", slug: "another-story" };
  const model = buildPages(program(), { nextStory });
  const withCta = model.pages.filter((page) => page.ctaHref);
  const withNext = model.pages.filter((page) => page.nextStory);

  assert.equal(model.pages.at(-1)?.kind, "theEnd");
  assert.equal(model.pages.at(-1)?.title, "The end");
  assert.equal(model.pages.at(-2)?.title, "Where it leads");
  assert.deepEqual(withCta.map((page) => page.id), ["the-end"]);
  assert.deepEqual(withNext.map((page) => page.id), ["the-end"]);
  assert.equal(model.pages.find((page) => page.id === "ending")?.ctaHref, undefined);
});

test("missing optional content does not break the model", () => {
  const model = buildPages({
    _id: "p2",
    title: "Sparse",
    slug: "sparse",
    chapters: [{ _key: "day1", photos: [{ _key: "a" }] }],
  });
  assert.equal(model.pages.length % 2, 0);
  assert.equal(model.photoToPage.a !== undefined, true);
});
