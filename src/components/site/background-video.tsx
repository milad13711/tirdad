"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useScroll, useReducedMotion } from "framer-motion";

const VIDEO_SRC = "/videos/majidtirdad-story.mp4";
const VIDEO_POSTER = "/videos/majidtirdad-story-poster.jpg";

/**
 * Fixed, full-viewport video sitting behind the entire homepage. Its
 * currentTime is driven by whole-page scroll progress (0 at the top of the
 * document, the clip's full length at the bottom) instead of playing on its
 * own timeline — scrolling the page *is* scrubbing the footage.
 *
 * The dimming overlay uses `bg-background` (the theme token, not a fixed
 * black/white) so it automatically inverts with dark/light mode: a near-black
 * veil in dark mode, a pale white veil in light mode — same video, correct
 * contrast either way, with no separate light/dark branching needed here.
 */
export function BackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = useReducedMotion();
  // Server always sees prefersReducedMotion as null/false; swapping the
  // rendered tree straight off it would cause a hydration mismatch for
  // anyone with OS-level reduced motion on. Defer the swap to a post-mount
  // effect so the first paint is identical on server and client.
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduceMotion(!!prefersReducedMotion);
  }, [prefersReducedMotion]);

  const { scrollYProgress } = useScroll();

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const video = videoRef.current;
    if (!video || !video.duration || Number.isNaN(video.duration)) return;
    video.currentTime = progress * video.duration;
  });

  return (
    <div className="fixed inset-0 -z-10" aria-hidden>
      {reduceMotion ? (
        <div
          className="h-full w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${VIDEO_POSTER})` }}
        />
      ) : (
        <video
          ref={videoRef}
          src={VIDEO_SRC}
          poster={VIDEO_POSTER}
          className="h-full w-full scale-105 object-cover blur-md"
          muted
          playsInline
          preload="auto"
        />
      )}
      {/* Blurring the footage smooths out locally-bright frames (e.g. the
          well-lit studio shots) so no single scroll position can wash out
          text sitting on top of it. The scrim below is the second line of
          defense: strong enough that even the brightest frame stays legible
          in both themes, without ever going fully opaque. */}
      <div className="absolute inset-0 bg-background/90" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/60 to-background" />
    </div>
  );
}
