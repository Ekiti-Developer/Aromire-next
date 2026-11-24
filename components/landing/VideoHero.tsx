"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type NetworkInformation = {
  saveData?: boolean;
  effectiveType?: string;
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
};

/**
 * Full-bleed looping video hero. The 3.3 MB file is only requested when the
 * connection and motion preferences allow it; otherwise the lightweight poster
 * is shown. When enabled, playback pauses offscreen or on a hidden tab.
 */
export default function VideoHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [allowVideo, setAllowVideo] = useState(false);

  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => {
      const slow = Boolean(
        connection?.saveData || ["slow-2g", "2g"].includes(connection?.effectiveType ?? ""),
      );
      setAllowVideo(!slow && !motionQuery.matches);
    };

    update();
    connection?.addEventListener?.("change", update);
    motionQuery.addEventListener("change", update);
    return () => {
      connection?.removeEventListener?.("change", update);
      motionQuery.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!allowVideo || !section || !video) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const inView = () => {
      const rect = section.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < window.innerHeight;
    };

    const sync = () => {
      // Read readiness straight from the element: the `canplay` event can fire
      // before React hydrates, so a state flag would miss it. Visibility is
      // measured from the rect so playback starts even if the observer is slow.
      const ready = video.readyState >= 3;
      const shouldPlay = inView() && ready && !motionQuery.matches && !document.hidden;
      if (shouldPlay) {
        const attempt = video.play();
        if (attempt) void attempt.catch(() => undefined);
      } else {
        video.pause();
      }
    };

    // On slow devices the element can be 0×0 at mount and the `canplay` event
    // can arrive before this effect attaches. Re-check briefly until playing
    // starts so those early signals cannot leave the video paused forever.
    let retryId = 0;
    let attempts = 0;
    const stopRetry = () => {
      if (retryId) window.clearInterval(retryId);
      retryId = 0;
    };
    const startRetry = () => {
      retryId = window.setInterval(() => {
        attempts += 1;
        if (video.readyState >= 3 && inView()) sync();
        if (!video.paused || attempts >= 20) stopRetry();
      }, 250);
    };

    const observer = new IntersectionObserver(sync, { threshold: 0.15 });
    observer.observe(section);

    const onReady = () => sync();
    const onVisibility = () => sync();
    const onMotionChange = () => sync();

    video.addEventListener("loadeddata", onReady);
    video.addEventListener("canplay", onReady);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("scroll", onVisibility, { passive: true });
    window.addEventListener("resize", onVisibility);
    motionQuery.addEventListener("change", onMotionChange);

    sync();
    startRetry();

    return () => {
      stopRetry();
      observer.disconnect();
      video.removeEventListener("loadeddata", onReady);
      video.removeEventListener("canplay", onReady);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("scroll", onVisibility);
      window.removeEventListener("resize", onVisibility);
      motionQuery.removeEventListener("change", onMotionChange);
      video.pause();
    };
  }, [allowVideo]);

  return (
    <section className="video-hero" ref={sectionRef} aria-label="Aromire-Éko community work">
      <div className="video-hero-media" aria-hidden="true">
        {allowVideo && (
          <video
            ref={videoRef}
            className="video-hero-video"
            poster="/images/hero-poster.jpg"
            muted
            loop
            playsInline
            preload="metadata"
            width={832}
            height={464}
          >
            <source src="/videos/hero-loop.mp4" type="video/mp4" />
          </video>
        )}
      </div>
      <div className="video-hero-shade" aria-hidden="true" />

      <div className="act-container video-hero-content">
        <h1>Community-led change, from the field.</h1>
        <p className="video-hero-lead">
          We work with communities across Lagos on health, skills and sustainable livelihoods —
          every program a story told by the people who lived it.
        </p>
        <div className="landing-hero-actions">
          <Link className="act-btn act-btn-primary" href="/programs">Explore our programs</Link>
          <Link className="act-btn act-btn-ghost" href="/about">Learn more about us</Link>
        </div>
      </div>
    </section>
  );
}
