"use client";

import { useEffect, useRef, useState } from "react";

export type ChapterNavItem = {
  id: string;
  number: number;
  label: string;
};

export default function ChapterNav({
  items,
  storyId,
}: {
  items: ChapterNavItem[];
  storyId: string;
}) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);
  const barRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => Boolean(element));
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-38% 0px -56% 0px", threshold: 0 },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items]);

  useEffect(() => {
    const story = document.getElementById(storyId);
    if (!story) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const node = document.getElementById(storyId);
      if (!node) return;
      const start = node.getBoundingClientRect().top + window.scrollY;
      const distance = Math.max(node.offsetHeight - window.innerHeight, 1);
      const progress = Math.min(Math.max((window.scrollY - start) / distance, 0), 1);
      barRef.current?.style.setProperty("--story-progress", `${progress * 100}%`);
    };
    const onScroll = () => {
      if (frame === 0) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [storyId]);

  useEffect(() => {
    const active = barRef.current?.querySelector<HTMLElement>('[data-active="true"]');
    active?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeId]);

  if (items.length === 0) return null;

  return (
    <nav className="story-chapter-bar" aria-label="Story chapters" ref={barRef}>
      <div className="story-chapter-bar-track" aria-hidden="true">
        <span />
      </div>
      <div className="story-chapter-bar-scroll">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className="story-chapter-chip"
            data-active={activeId === item.id}
            aria-current={activeId === item.id ? "location" : undefined}
            onClick={(event) => {
              event.preventDefault();
              document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
            <span className="story-chapter-chip-num">{String(item.number).padStart(2, "0")}</span>
            <span>{item.label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
