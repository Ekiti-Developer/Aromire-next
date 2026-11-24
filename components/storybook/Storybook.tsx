"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { normalizeInternalHref } from "@/lib/internal-href";
import { normalizeAlt } from "@/lib/alt-text";
import {
  buildPages,
  type StorybookNextStory,
  type StorybookPage,
  type StorybookProgram,
} from "@/lib/storybook";

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);
  return matches;
}

function blurProps(image?: { lqip?: string | null } | null) {
  return image?.lqip ? { placeholder: "blur" as const, blurDataURL: image.lqip } : {};
}

function StoryCta({ label, href }: { label?: string; href?: string }) {
  const text = label?.trim() || "Help us write the next one";
  const url = normalizeInternalHref(href);
  if (/^https?:\/\//i.test(url)) {
    return (
      <a className="storybook-donate" href={url} target="_blank" rel="noopener noreferrer">
        {text}
      </a>
    );
  }
  return <Link className="storybook-donate" href={url}>{text}</Link>;
}

function PlateImage({ page, sizes }: { page: StorybookPage; sizes: string }) {
  const image = page.image;
  if (image?.url) {
    return (
      <div className="storybook-plate-image">
        <Image src={image.url} alt={normalizeAlt(image.alt, page.caption || "")} fill sizes={sizes} {...blurProps(image)} />
      </div>
    );
  }
  return <div className="storybook-plate-empty" aria-hidden="true" />;
}

function StoryPageView({ page, isMobile }: { page: StorybookPage; isMobile: boolean }) {
  const sizes = isMobile ? "100vw" : "50vw";
  const className = `storybook-page storybook-page-${page.kind}`;

  if (page.kind === "cover") {
    return (
      <article className={className}>
        <div className="storybook-adire" aria-hidden="true" />
        <div className="storybook-cover-inner">
          <span className="storybook-logo-badge" aria-hidden="true">
            <Image src="/images/Logo.svg" alt="" width={38} height={38} />
          </span>
          <p className="storybook-cover-eyebrow">{page.eyebrow}</p>
          <h2>{page.title}</h2>
          {page.body && <p className="storybook-cover-hook">{page.body}</p>}
          {page.dateLabel && <p className="storybook-cover-dates">{page.dateLabel}</p>}
        </div>
      </article>
    );
  }

  if (page.kind === "chapterTitle") {
    return (
      <article className={className}>
        <div className="storybook-chapter-numeral" aria-hidden="true">{page.numeral}</div>
        <div className="storybook-ornament-line" aria-hidden="true"><span /></div>
        <p className="storybook-kicker">{page.eyebrow}</p>
        <h2>{page.title}</h2>
        {page.dateLabel && <p className="storybook-chapter-meta">{page.dateLabel}</p>}
      </article>
    );
  }

  if (page.kind === "chapterNarrative") {
    return (
      <article className={className}>
        <p className="storybook-kicker">{page.eyebrow || `Chapter ${page.chapterNumber}`}</p>
        <h3>{page.title}</h3>
        <p className="storybook-dropcap">{page.body}</p>
        {page.quote && (
          <blockquote>
            <p>{page.quote}</p>
            {page.attribution && <cite>{page.attribution}</cite>}
          </blockquote>
        )}
      </article>
    );
  }

  if (page.kind === "photoPlate" || page.kind === "photoCaption") {
    return (
      <article className={className}>
        {page.kind === "photoCaption" && (
          <>
            <p className="storybook-kicker">{page.eyebrow}</p>
            <h3 className="storybook-photo-heading">{page.title}</h3>
            {page.locationLabel && (
              <p className="storybook-location"><span aria-hidden="true">&#9679;</span> {page.locationLabel}</p>
            )}
            {page.body && <p className="storybook-storyline">{page.body}</p>}
          </>
        )}
        {page.kind === "photoPlate" && (
          <>
            {(page.caption || page.locationLabel) && (
              <div className="storybook-photo-topic">
                {page.caption && <h3 className="storybook-photo-heading">{page.caption}</h3>}
                {page.locationLabel && (
                  <p className="storybook-location"><span aria-hidden="true">&#9679;</span> {page.locationLabel}</p>
                )}
              </div>
            )}
            <div className="storybook-photo-mat">
              <PlateImage page={page} sizes={sizes} />
            </div>
            {isMobile && page.showCaptionInline && page.secondaryBody && (
              <div className="storybook-mobile-caption">
                <p className="storybook-kicker">
                  Chapter {String(page.chapterNumber ?? 1).padStart(2, "0")}
                </p>
                <p className="storybook-storyline">{page.secondaryBody}</p>
              </div>
            )}
          </>
        )}
      </article>
    );
  }

  if (page.kind === "ending") {
    return (
      <article className={className}>
        <p className="storybook-kicker">{page.eyebrow}</p>
        <h2>{page.title}</h2>
        <p className="storybook-dropcap">{page.body}</p>
        {page.testimonial && (
          <blockquote className="storybook-testimonial">
            <p>{page.testimonial.quote}</p>
            <cite>
              {page.testimonial.name}
              {page.testimonial.role ? ` · ${page.testimonial.role}` : ""}
            </cite>
          </blockquote>
        )}
        {page.facts && (
          <p className="storybook-facts">
            {page.facts.days} days · {page.facts.locations} locations · {page.facts.partners} partners · {page.facts.photos} photos · {page.facts.videos} videos
          </p>
        )}
      </article>
    );
  }

  if (page.kind === "theEnd") {
    return (
      <article className={className}>
        <h2>{page.title}</h2>
        <div className="storybook-ornament-line" aria-hidden="true"><span /></div>
        <p className="storybook-end-body">{page.body}</p>
        <StoryCta label={page.ctaLabel} href={page.ctaHref} />
        {page.nextStory && (
          <p className="storybook-next">
            Next story:{" "}
            <Link href={`/programs/${encodeURIComponent(page.nextStory.slug)}`}>
              {page.nextStory.title} →
            </Link>
          </p>
        )}
      </article>
    );
  }

  // Intro
  return (
    <article className={className}>
      <p className="storybook-kicker">{page.eyebrow || "The story so far"}</p>
      <h3>{page.title}</h3>
      <p className="storybook-dropcap">{page.body}</p>
      {page.facts && (
        <p className="storybook-facts">
          {page.facts.days} days · {page.facts.locations} locations · {page.facts.partners} partners · {page.facts.photos} photos · {page.facts.videos} videos
        </p>
      )}
      <p className="storybook-turn-cue">Turn the page →</p>
    </article>
  );
}

export default function Storybook({
  program,
  nextStory = null,
  initialPage,
  initialPhotoKey,
  onPageChange,
  onClose,
}: {
  program: StorybookProgram;
  nextStory?: StorybookNextStory;
  initialPage: number;
  initialPhotoKey?: string;
  onPageChange: (page: number) => void;
  onClose: () => void;
}) {
  const isMobile = useMediaQuery("(max-width: 820px)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const model = useMemo(
    () => buildPages(program, { mobile: isMobile, nextStory }),
    [program, isMobile, nextStory],
  );
  const total = model.pages.length;
  const step = isMobile ? 1 : 2;

  const [page, setPage] = useState(() => {
    const fromKey = initialPhotoKey ? model.photoToPage[initialPhotoKey] : undefined;
    const candidate = fromKey ?? initialPage;
    return Number.isFinite(candidate) ? Math.min(Math.max(candidate, 0), Math.max(total - step, 0)) : 0;
  });
  const [hasNavigated, setHasNavigated] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const animatingRef = useRef(false);
  const pageRef = useRef(page);
  const touchStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  // Re-align when crossing the desktop/mobile breakpoint.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setPage((current) => {
        const aligned = isMobile ? current : current - (current % 2);
        return Math.min(Math.max(aligned, 0), Math.max(total - step, 0));
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [isMobile, total, step]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // The viewer is dynamically imported and the page grid remounts via
    // `key={page}`. Focus after two frames so the close control is the one
    // that receives it, not a transient Next-page button or <body>.
    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        closeRef.current?.focus({ preventScroll: true });
      });
    });

    return () => {
      cancelAnimationFrame(firstFrame);
      if (secondFrame) cancelAnimationFrame(secondFrame);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const commit = useCallback(
    (target: number) => {
      setPage(target);
      pageRef.current = target;
      onPageChange(target);
    },
    [onPageChange],
  );

  const visibleElements = useCallback(() => {
    return Array.from(dialogRef.current?.querySelectorAll<HTMLElement>("[data-book-page]") ?? []);
  }, []);

  const turnTo = useCallback(
    async (target: number) => {
      if (animatingRef.current) return;
      const current = pageRef.current;
      if (target === current || target < 0 || target >= total) return;

      animatingRef.current = true;
      const direction = target > current ? -1 : 1;
      const shadow = (sign: number) => `${sign * 18}px 0 44px rgba(10, 8, 25, 0.45)`;
      const clean = (elements: Element[], animations: Animation[]) => {
        animations.forEach((animation) => animation.cancel());
        elements.forEach((element) => {
          const node = element as HTMLElement;
          node.style.willChange = "";
          node.style.transformOrigin = "";
        });
      };
      const settled = (animations: Animation[]) =>
        Promise.all(animations.map((animation) => animation.finished.catch(() => undefined)));

      // Reduced motion: keep the state change legible with a gentle crossfade,
      // but remove the spatial turn entirely.
      if (reducedMotion) {
        const outgoing = visibleElements();
        const fadeOut = outgoing.map((element) =>
          element.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, easing: "ease-out", fill: "forwards" }),
        );
        await settled(fadeOut);
        clean(outgoing, fadeOut);

        commit(target);
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

        const incoming = visibleElements();
        const fadeIn = incoming.map((element) =>
          element.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, easing: "ease-out", fill: "forwards" }),
        );
        await settled(fadeIn);
        clean(incoming, fadeIn);
        animatingRef.current = false;
        return;
      }

      const outgoing = visibleElements();
      const outAnimations = outgoing.map((element, index) => {
        const node = element as HTMLElement;
        // Hinge on the spine so the spread swings like a book, not a card.
        const isLeft = step === 2 && index === 0;
        node.style.transformOrigin = step === 1 ? (direction < 0 ? "left center" : "right center") : isLeft ? "right center" : "left center";
        node.style.willChange = "transform, opacity, filter, box-shadow";
        // The page closer to the spine travels less; the outer page leads.
        const factor = step === 1 ? 1 : direction < 0 ? (isLeft ? 0.45 : 1) : isLeft ? 1 : 0.45;
        return node.animate(
          [
            { transform: "rotateY(0deg) translateZ(0)", opacity: 1, filter: "blur(0px)", boxShadow: "0 0 0 rgba(10, 8, 25, 0)" },
            {
              transform: `rotateY(${direction * 84 * factor}deg) translateZ(28px)`,
              opacity: 0.18,
              filter: "blur(2px)",
              boxShadow: shadow(direction),
            },
          ],
          { duration: 260, easing: "cubic-bezier(0.5, 0.05, 0.2, 1.02)", fill: "forwards" },
        );
      });
      await settled(outAnimations);
      clean(outgoing, outAnimations);

      commit(target);
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

      const incoming = visibleElements();
      const inAnimations = incoming.map((element, index) => {
        const node = element as HTMLElement;
        const isLeft = step === 2 && index === 0;
        node.style.transformOrigin = step === 1 ? (direction < 0 ? "right center" : "left center") : isLeft ? "right center" : "left center";
        node.style.willChange = "transform, opacity, filter, box-shadow";
        const factor = step === 1 ? 1 : direction < 0 ? (isLeft ? 0.45 : 1) : isLeft ? 1 : 0.45;
        return node.animate(
          [
            {
              transform: `rotateY(${-direction * 80 * factor}deg) translateZ(28px)`,
              opacity: 0.2,
              filter: "blur(2px)",
              boxShadow: shadow(-direction),
            },
            {
              transform: `rotateY(${direction * 2.5 * factor}deg) translateZ(0)`,
              opacity: 1,
              filter: "blur(0px)",
              boxShadow: "0 0 0 rgba(10, 8, 25, 0)",
              offset: 0.8,
            },
            { transform: "rotateY(0deg) translateZ(0)", opacity: 1, filter: "blur(0px)", boxShadow: "0 0 0 rgba(10, 8, 25, 0)" },
          ],
          { duration: 440, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" },
        );
      });
      await settled(inAnimations);
      clean(incoming, inAnimations);
      animatingRef.current = false;
    },
    [commit, reducedMotion, step, total, visibleElements],
  );

  const next = useCallback(() => {
    setHasNavigated(true);
    void turnTo(Math.min(pageRef.current + step, total - step));
  }, [step, total, turnTo]);
  const previous = useCallback(() => {
    setHasNavigated(true);
    void turnTo(Math.max(pageRef.current - step, 0));
  }, [step, turnTo]);
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === "Tab") {
        const focusable = Array.from(
          dialogRef.current?.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ) ?? [],
        ).filter((element) => element.offsetParent !== null);
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
        return;
      }
      if (event.key === "ArrowRight" || event.key === "PageDown") {
        event.preventDefault();
        next();
      } else if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        previous();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [next, onClose, previous]);

  const visiblePages = useMemo(() => {
    const result: StorybookPage[] = [];
    for (let offset = 0; offset < step && page + offset < total; offset += 1) {
      const candidate = model.pages[page + offset];
      // Caption pages only disappear on phones; on desktop they are the
      // facing page of their photo plate and must stay in the spread.
      if (candidate && (!isMobile || !candidate.skipOnMobile)) result.push(candidate);
    }
    return result;
  }, [isMobile, model.pages, page, step, total]);

  const activePage = model.pages[page];
  const chapterLabel = activePage?.chapterNumber
    ? `Chapter ${String(activePage.chapterNumber).padStart(2, "0")}`
    : page === 0
      ? "Cover"
      : page >= total - step
        ? "The end"
        : "Introduction";

  return (
    <div
      className="storybook-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Storybook viewer"
      ref={dialogRef}
    >
      <h1 className="visually-hidden">{program.title} — storybook</h1>
      <div className="storybook-topbar">
        <span className="storybook-topbar-spacer" aria-hidden="true" />
        <span className="storybook-topbar-title">{program.title}</span>
        <button
          type="button"
          ref={closeRef}
          className="storybook-topbtn storybook-close"
          onClick={onClose}
          aria-label="Close storybook"
          autoFocus
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <div className="storybook-book-wrap">
        <div
          className={`storybook-book${isMobile ? " mobile" : ""}`}
          onTouchStart={(event) => {
            const touch = event.touches[0];
            touchStart.current = { x: touch?.clientX ?? 0, y: touch?.clientY ?? 0 };
          }}
          onTouchCancel={() => {
            touchStart.current = { x: 0, y: 0 };
          }}
          onTouchEnd={(event) => {
            const touch = event.changedTouches[0];
            const diffX = touchStart.current.x - (touch?.clientX ?? 0);
            const diffY = touchStart.current.y - (touch?.clientY ?? 0);
            touchStart.current = { x: 0, y: 0 };
            // Ignore vertical scrolling and interrupted gestures.
            if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY) * 1.2) {
              if (diffX > 0) next();
              else previous();
            }
          }}
        >
          <div className="storybook-pages" key={page}>
            {visiblePages.map((storyPage, index) => (
              <div
                className="storybook-page-slot"
                data-book-page
                data-page-index={page + index}
                key={storyPage.id}
              >
                {storyPage.printedNumber !== undefined && !isMobile && (
                  <span className="storybook-page-number" aria-hidden="true">{storyPage.printedNumber}</span>
                )}
                <StoryPageView page={storyPage} isMobile={isMobile} />
                <p className="storybook-end-signature" aria-hidden="true">{program.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isMobile && !hasNavigated && (
        <p className="storybook-swipe-hint">Swipe left or right to turn pages</p>
      )}

      <div className="storybook-bottombar">
        <button
          type="button"
          className="storybook-arrow"
          onClick={previous}
          disabled={page === 0}
          aria-label="Previous page"
        >
          &#8592;
        </button>
        <span className="storybook-page-indicator" aria-live="polite">
          {isMobile
            ? `Page ${page + 1} of ${total}`
            : `Pages ${page + 1}–${Math.min(page + 2, total)} of ${total} · ${chapterLabel}`}
        </span>
        <button
          type="button"
          className="storybook-arrow"
          onClick={next}
          disabled={page >= total - step}
          aria-label="Next page"
        >
          &#8594;
        </button>
      </div>
    </div>
  );
}
