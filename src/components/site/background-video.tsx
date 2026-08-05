"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useScroll, useReducedMotion } from "framer-motion";

const VIDEO_SRC = "/videos/majidtirdad-video.webm";
const VIDEO_POSTER = "/videos/majidtirdad-video-poster.png";

/**
 * Small fixed video in the corner of the viewport — not a full-page
 * background. Its currentTime is driven by whole-page scroll progress (0 at
 * the top of the document, the clip's full length at the bottom) instead of
 * playing on its own timeline, so scrolling the page scrubs the footage.
 *
 * The source is a VP9 webm with an alpha channel (background keyed out), so
 * it's drawn onto a <canvas> frame-by-frame instead of shown as a plain
 * <video> — the <video> element itself ignores alpha and paints black where
 * the footage is transparent, but drawImage() onto a 2D canvas respects it.
 * That lets the subject sit directly on the page background with no card,
 * border, or box around it.
 */
export function BackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Some browsers (Safari in particular, and some Chromium builds) never
    // decode a single frame of a <video> that hasn't actually played —
    // setting currentTime alone renders nothing. Kick off a muted
    // play/pause once so the decoder is primed, then hand control back to
    // the scroll handler above.
    video.play()?.then(() => video.pause()).catch(() => {});

    let raf = 0;
    const draw = () => {
      if (video.videoWidth && video.videoHeight) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(raf);
  }, [reduceMotion]);

  return (
    <div
      className="pointer-events-none fixed bottom-6 start-6 z-40 hidden h-44 w-28 sm:block md:h-56 md:w-36 lg:h-64 lg:w-44"
      aria-hidden
    >
      {reduceMotion ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={VIDEO_POSTER} alt="" className="h-full w-full object-contain object-bottom" />
      ) : (
        <>
          <video ref={videoRef} src={VIDEO_SRC} className="hidden" muted playsInline preload="auto" />
          <canvas ref={canvasRef} className="h-full w-full object-contain object-bottom" />
        </>
      )}
    </div>
  );
}
