"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useScroll, useReducedMotion } from "framer-motion";

const VIDEO_SRC = "/videos/majidtirdad-story.mp4";
const VIDEO_POSTER = "/videos/majidtirdad-story-poster.jpg";

/**
 * Small fixed video card in the corner of the viewport — not a full-page
 * background. Its currentTime is driven by whole-page scroll progress (0 at
 * the top of the document, the clip's full length at the bottom) instead of
 * playing on its own timeline, so scrolling the page scrubs the footage.
 *
 * Kept small and off to the side (rather than covering the page) so it
 * illustrates the brand story without competing with the actual content for
 * attention. Sized down further on small screens and pinned low enough that
 * it never sits under a heading or button.
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

  useEffect(() => {
    if (reduceMotion) return;
    const video = videoRef.current;
    if (!video) return;
    // Some browsers (Safari in particular, and some Chromium builds) never
    // decode a single frame of a <video> that hasn't actually played —
    // setting currentTime alone renders nothing. Kick off a muted
    // play/pause once so the decoder is primed, then hand control back to
    // the scroll handler above.
    video.play()?.then(() => video.pause()).catch(() => {});
  }, [reduceMotion]);

  return (
    <div
      className="pointer-events-none fixed bottom-6 start-6 z-40 hidden overflow-hidden rounded-xl border border-border/60 bg-card shadow-lg sm:block sm:h-44 sm:w-28 md:h-56 md:w-36 lg:h-64 lg:w-44"
      aria-hidden
    >
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
          className="h-full w-full object-cover"
          muted
          playsInline
          preload="auto"
        />
      )}
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
    </div>
  );
}
