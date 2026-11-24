import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  buildPages,
  formatDate,
  formatDateRange,
  type StorybookProgram,
} from "@/lib/storybook";
import { normalizeInternalHref } from "@/lib/internal-href";
import { normalizeAlt } from "@/lib/alt-text";
import { getVideoThumbnailUrl } from "@/lib/video";
import ChapterNav, { type ChapterNavItem } from "@/components/storybook/ChapterNav";
import Reveal from "@/components/storybook/Reveal";
import StorybookButton from "@/components/storybook/StorybookButton";
import StorybookProvider from "@/components/storybook/StorybookProvider";
import VideoPoster from "@/components/storybook/VideoPoster";
import PhotoLightbox, { type LightboxItem } from "@/components/storybook/PhotoLightbox";
import {
  nextProgramQuery,
  programBySlugQuery,
  programMetadataQuery,
  programSlugsQuery,
  type ProgramChapter,
  type ProgramDetail,
  type ProgramPhoto,
} from "@/sanity/queries/programs";

export const revalidate = 60;

type PageProps = { params: Promise<{ slug: string }> };

type NextStory = { title: string; slug: string };

export async function generateStaticParams() {
  try {
    const programs = await sanityFetch<Array<{ slug: string }>>(programSlugsQuery, {}, ["program"]);
    return (programs ?? []).filter((program) => Boolean(program.slug)).map((program) => ({ slug: program.slug }));
  } catch (error) {
    console.error("Failed to fetch program slugs:", error);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const program = await sanityFetch<{ title: string; summary?: string; coverUrl?: string } | null>(
      programMetadataQuery,
      { slug },
      ["program"],
    );
    if (!program) return { title: "Program story" };
    return {
      title: program.title,
      description: program.summary,
      openGraph: {
        title: program.title,
        description: program.summary,
        images: program.coverUrl ? [{ url: program.coverUrl }] : [],
      },
    };
  } catch (error) {
    console.error("Failed to fetch program metadata:", error);
    return { title: "Program story" };
  }
}

function blurProps(image?: { lqip?: string } | null) {
  return image?.lqip ? { placeholder: "blur" as const, blurDataURL: image.lqip } : {};
}

function tileClasses(index: number, count: number, isVideo = false) {
  // A square cell keeps the embedded video from being stretched.
  if (isVideo) return "tile-c2 tile-r4";
  if (count === 1) return "tile-c4 tile-r3";
  if (count === 2) return "tile-c2 tile-r3";
  if (index === 0) return "tile-c2 tile-r4";
  if (index === 1 || index === 2) return "tile-c2 tile-r2";
  const remaining = count - 3;
  if (remaining > 0 && index === count - 1 && remaining % 2 === 1) return "tile-c4 tile-r2";
  return "tile-c2 tile-r2";
}

function photoImage(photo: ProgramPhoto) {
  return photo.mediaType === "video" ? photo.poster : photo.image;
}

function Facts({ facts }: { facts: ReturnType<typeof buildPages>["totals"] }) {
  return (
    <div className="story-facts" aria-label="Program at a glance">
      <div><strong>{facts.days}</strong><span>Days</span></div>
      <div><strong>{facts.locations}</strong><span>Locations</span></div>
      <div><strong>{facts.partners}</strong><span>Partners</span></div>
      <div><strong>{facts.photos}</strong><span>Photos</span></div>
      <div><strong>{facts.videos}</strong><span>Videos</span></div>
    </div>
  );
}

function PhotoTile({
  photo,
  chapterNumber,
  title,
  media,
  mediaIndex,
}: {
  photo: ProgramPhoto;
  chapterNumber: number;
  title: string;
  media: LightboxItem[];
  mediaIndex: number;
}) {
  const image = photoImage(photo);
  const isVideo = photo.mediaType === "video";
  const thumbnailUrl = isVideo ? getVideoThumbnailUrl(photo.videoUrl) : null;
  const imageSrc = thumbnailUrl || image?.url || null;

  // Videos are not part of the picture-only book, so play them here instead
  // of sending the tile to a page that does not exist.
  if (isVideo && photo.videoUrl) {
    return (
      <VideoPoster
        url={photo.videoUrl}
        posterUrl={imageSrc}
        posterAlt={image?.alt}
        title={photo.caption || `${title} video`}
        caption={photo.caption}
        sizes="(max-width: 600px) 50vw, 25vw"
        variant="tile"
        className="story-photo-tile"
      />
    );
  }

  const alt = normalizeAlt(image?.alt, photo.caption || `${title} photo`);
  return (
    <PhotoLightbox
      className="story-photo-tile"
      items={media}
      initialIndex={mediaIndex}
      label={`View fullscreen: ${photo.caption || `${title} photo`}`}
    >
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={alt}
          fill
          sizes="(max-width: 600px) 50vw, 25vw"
          {...(thumbnailUrl ? {} : blurProps(image))}
        />
      ) : (
        <span className="story-photo-tile-fallback" aria-hidden="true" />
      )}
      {photo.caption && <span className="story-photo-caption">{photo.caption}</span>}
      <span className="visually-hidden">Chapter {chapterNumber}</span>
    </PhotoLightbox>
  );
}

function LocationPhotoGroup({
  location,
  photos,
  chapterNumber,
  title,
  media,
}: {
  location: string;
  photos: ProgramPhoto[];
  chapterNumber: number;
  title: string;
  media: LightboxItem[];
}) {
  return (
    <section className="story-location-group" aria-label={`Photos at ${location}`}>
      <h3 className="story-location-label"><span aria-hidden="true">&#9679;</span> At {location}</h3>
      <div className="story-photo-grid">
        {photos.map((photo, index) => (
          <div className={`story-photo-cell ${tileClasses(index, photos.length, photo.mediaType === "video")}`} key={photo._key}>
            <PhotoTile
              photo={photo}
              chapterNumber={chapterNumber}
              title={title}
              media={media}
              mediaIndex={media.findIndex((item) => item.key === photo._key)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function ChapterSection({
  chapter,
  index,
  title,
  media,
}: {
  chapter: ProgramChapter;
  index: number;
  title: string;
  media: LightboxItem[];
}) {
  const chapterNumber = index + 1;
  const groups = new Map<string, ProgramPhoto[]>();
  for (const photo of chapter.photos ?? []) {
    const location = photo.location?.name?.trim() || "the program";
    const existing = groups.get(location) ?? [];
    existing.push(photo);
    groups.set(location, existing);
  }

  return (
    <Reveal className="story-chapter" id={`chapter-${chapterNumber}`}>
      <div className="story-chapter-rail" aria-hidden="true">
        <span className="story-chapter-number">{String(chapterNumber).padStart(2, "0")}</span>
        {chapter.date && <time dateTime={chapter.date}>{formatDate(chapter.date)}</time>}
      </div>
      <div className="story-chapter-content">
        <p className="section-eyebrow">{chapter.dayLabel || `Chapter ${chapterNumber}`}</p>
        <h2>{chapter.headline}</h2>
        <p className="story-narrative">{chapter.narrative}</p>
        {chapter.pullQuote?.text && (
          <blockquote className="story-pull-quote">
            <p>{chapter.pullQuote.text}</p>
            {chapter.pullQuote.attribution && <cite>{chapter.pullQuote.attribution}</cite>}
          </blockquote>
        )}
        {Array.from(groups.entries()).map(([location, photos]) => (
          <LocationPhotoGroup
            key={location}
            location={location}
            photos={photos}
            chapterNumber={chapterNumber}
            title={title}
            media={media}
          />
        ))}
      </div>
    </Reveal>
  );
}

export default async function ProgramStoryPage({ params }: PageProps) {
  const { slug } = await params;

  let program: ProgramDetail | null = null;
  try {
    program = await sanityFetch<ProgramDetail | null>(programBySlugQuery, { slug }, ["program", "partner"]);
  } catch (error) {
    console.error("Failed to fetch program story:", error);
  }
  if (!program) notFound();

  let nextStory: NextStory | null = null;
  try {
    nextStory = await sanityFetch<NextStory | null>(
      nextProgramQuery,
      { currentStartDate: program.startDate },
      ["program"],
    );
  } catch (error) {
    console.error("Failed to fetch next story:", error);
  }

  const storybookProgram = program as StorybookProgram;
  const model = buildPages(storybookProgram, { nextStory });
  const chapters = program.chapters ?? [];
  const media: LightboxItem[] = chapters.flatMap((chapter) =>
    (chapter.photos ?? []).map((photo) => {
      const image = photoImage(photo);
      const isVideo = photo.mediaType === "video";
      const thumb = isVideo ? getVideoThumbnailUrl(photo.videoUrl) : null;
      return {
        key: photo._key,
        type: isVideo ? ("video" as const) : ("image" as const),
        src: image?.url || thumb || "",
        alt: normalizeAlt(image?.alt, photo.caption || `${program.title} photo`),
        caption: photo.caption,
        videoUrl: photo.videoUrl,
      };
    }),
  );
  const dateRange = formatDateRange(program.startDate, program.endDate);
  const chapterItems: ChapterNavItem[] = chapters.map((chapter, index) => ({
    id: `chapter-${index + 1}`,
    number: index + 1,
    label: chapter.dayLabel || chapter.headline || `Chapter ${index + 1}`,
  }));
  const testimonial = program.featuredTestimonial?.consentConfirmed ? program.featuredTestimonial : null;

  return (
    <StorybookProvider program={storybookProgram} nextStory={nextStory}>
      <article className="story-page" id="program-story">
        <header className="story-cover">
          <div className="story-cover-inner">
            <Link href="/programs" className="story-back-link">&#8592; All programs</Link>
            <div className="story-cover-heading">
              {dateRange && <p className="story-cover-date">{dateRange}</p>}
              <h1>{program.title}</h1>
              {program.hook && <p className="story-cover-hook">{program.hook}</p>}
            </div>

            {program.cover?.url && (
              <div className="story-cover-media">
                <Image
                  src={program.cover.url}
                  alt={normalizeAlt(program.cover.alt, program.title)}
                  fill
                  priority
                  sizes="(max-width: 900px) 100vw, 90vw"
                  {...blurProps(program.cover)}
                />
              </div>
            )}

            <div className="story-cover-actions">
              <StorybookButton className="story-open-button" page={0}>
                Open as a storybook <span aria-hidden="true">&#8594;</span>
              </StorybookButton>
              <p className="story-scroll-cue">or scroll to follow the story <span aria-hidden="true">&#8595;</span></p>
            </div>
          </div>
        </header>

        <ChapterNav items={chapterItems} storyId="program-story" />

        <div className="story-content">
          <Reveal className="story-intro">
            <p className="story-intro-text">{program.intro || program.summary}</p>
            <Facts facts={model.totals} />
          </Reveal>

          {chapters.map((chapter, index) => (
            <ChapterSection
              key={chapter._key}
              chapter={chapter}
              index={index}
              title={program.title}
              media={media}
            />
          ))}

          {program.partners && program.partners.length > 0 && (
            <Reveal className="story-partners">
              <div className="act-container">
                <p className="section-eyebrow">Partners</p>
                <h2>Together with the community</h2>
                <ul className="story-partner-list">
                  {program.partners.map((partner) => (
                    <li className="story-partner" key={partner._id}>
                      {partner.website ? (
                        <a href={partner.website} target="_blank" rel="noopener noreferrer">
                          {partner.logo ? (
                            <Image
                              src={partner.logo}
                              alt={normalizeAlt(partner.logoAlt, partner.name)}
                              width={160}
                              height={64}
                              sizes="160px"
                            />
                          ) : (
                            <span>{partner.name}</span>
                          )}
                        </a>
                      ) : partner.logo ? (
                        <Image
                          src={partner.logo}
                          alt={normalizeAlt(partner.logoAlt, partner.name)}
                          width={160}
                          height={64}
                          sizes="160px"
                        />
                      ) : (
                        <span>{partner.name}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          )}

          <Reveal className="story-ending">
            <p className="section-eyebrow">Where it leads</p>
            <p className="story-ending-text">{program.ending || program.summary}</p>
            <Facts facts={model.totals} />

            {testimonial && (
              <figure className="story-testimonial">
                {testimonial.videoUrl ? (
                  <VideoPoster
                    url={testimonial.videoUrl}
                    posterUrl={testimonial.videoPoster?.url}
                    posterAlt={testimonial.videoPoster?.alt}
                    title={testimonial.name || "Program testimonial"}
                  />
                ) : testimonial.photo?.url ? (
                  <div className="story-testimonial-photo">
                    <Image
                      src={testimonial.photo.url}
                      alt={normalizeAlt(testimonial.photo.alt, testimonial.name || "Program participant")}
                      fill
                      sizes="(max-width: 700px) 100vw, 320px"
                      {...blurProps(testimonial.photo)}
                    />
                  </div>
                ) : null}
                <blockquote>
                  <p>{testimonial.quote}</p>
                  <figcaption>
                    {testimonial.name}
                    {testimonial.role ? ` · ${testimonial.role}` : ""}
                  </figcaption>
                </blockquote>
              </figure>
            )}

            <div className="story-cta-band">
              <p className="section-eyebrow">Keep the story going</p>
              <h2>{program.storyCta?.label?.trim() || "Help us write the next chapter"}</h2>
              {(() => {
                const href = normalizeInternalHref(program.storyCta?.href);
                return /^https?:\/\//i.test(href) ? (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="btn-gold">
                    {program.storyCta?.label?.trim() || "Volunteer / Donate"} <span aria-hidden="true">↗</span>
                  </a>
                ) : (
                  <Link href={href} className="btn-gold">
                    {program.storyCta?.label?.trim() || "Volunteer / Donate"}
                  </Link>
                );
              })()}
            </div>

          </Reveal>
        </div>
      </article>
    </StorybookProvider>
  );
}
