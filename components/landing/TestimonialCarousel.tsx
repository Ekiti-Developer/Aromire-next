"use client";

import Image from "next/image";
import { useState } from "react";
import type { Testimonial } from "@/sanity/queries/content";

export default function TestimonialCarousel({ items }: { items: Testimonial[] }) {
  const [current, setCurrent] = useState(0);
  const count = items.length;
  const go = (direction: number) => setCurrent((index) => (index + direction + count) % count);
  const item = items[current];

  return (
    <div className="landing-testimonial-slider">
      <div className="landing-testimonial-card">
        <div className="landing-testimonial-author">
          {item.photo?.url && (
            <span className="landing-testimonial-logo">
              <Image src={item.photo.url} alt={item.photo.alt || item.name} width={80} height={80} />
            </span>
          )}
          <span className="landing-testimonial-details">
            <strong>{item.name}</strong>
            <span>{item.role || (item.program ? item.program.title : "Community partner")}</span>
          </span>
        </div>
        <blockquote>{item.quote}</blockquote>
      </div>

      {count > 1 && (
        <>
          <button className="landing-slider-arrow prev" type="button" onClick={() => go(-1)} aria-label="Previous testimonial">&#8249;</button>
          <button className="landing-slider-arrow next" type="button" onClick={() => go(1)} aria-label="Next testimonial">&#8250;</button>
          <div className="landing-slider-dots" role="group" aria-label="Choose a testimonial">
            {items.map((entry, index) => (
              <button
                key={entry._id}
                type="button"
                className={`landing-slider-dot${index === current ? " active" : ""}`}
                aria-label={`Show testimonial ${index + 1} of ${count}`}
                aria-current={index === current ? "true" : undefined}
                onClick={() => setCurrent(index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
