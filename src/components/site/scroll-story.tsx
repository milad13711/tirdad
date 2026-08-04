"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { Camera, Sparkles, Wand2 } from "lucide-react";
import { Container, SectionLabel } from "@/components/site/container";

const steps = [
  {
    icon: Camera,
    title: "می‌چرخد به سمت دوربین",
    desc: "مجید تیرداد پشت صحنه آماده می‌شود؛ استودیو، نور و حس کار در یک قاب ساده شکل می‌گیرد.",
  },
  {
    icon: Wand2,
    title: "شروع عکاسی از پیتزا",
    desc: "دوربین بالا می‌آید و کار اصلی شروع می‌شود — قاب‌بندی دقیق، نور درست، لحظه‌ی درست.",
  },
  {
    icon: Sparkles,
    title: "یک عکس زیبا خلق می‌کند",
    desc: "نتیجه‌ی نهایی: یک تصویر تبلیغاتی در حد استودیوهای حرفه‌ای، آماده انتشار.",
  },
];

const VIDEO_SRC = "/videos/majidtirdad-story.mp4";
const VIDEO_POSTER = "/videos/majidtirdad-story-poster.jpg";

export function ScrollStory() {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = useReducedMotion();
  // Rendering a structurally different tree straight off useReducedMotion()
  // (server always sees it as null/false) would cause a hydration mismatch
  // for anyone with OS-level reduced-motion on. Deferring the swap to a
  // post-mount effect keeps the first paint identical on server and client.
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    // Standard hydration-safe mount-detection pattern — this is exactly the
    // "subscribe to an external system" case the lint rule allows for.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduceMotion(!!prefersReducedMotion);
  }, [prefersReducedMotion]);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // Scrub the video's currentTime directly off scroll progress instead of
  // playing it — this is what turns "scroll the page" into "scroll through
  // the footage" (turn to camera -> shoot the pizza -> final shot).
  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const video = videoRef.current;
    if (!video || !video.duration || Number.isNaN(video.duration)) return;
    video.currentTime = progress * video.duration;
  });

  const scale = useTransform(scrollYProgress, [0, 1], [0.94, 1.04]);
  const opacity1 = useTransform(scrollYProgress, [0, 0.28, 0.34], [1, 1, 0]);
  const opacity2 = useTransform(scrollYProgress, [0.34, 0.4, 0.62, 0.68], [0, 1, 1, 0]);
  const opacity3 = useTransform(scrollYProgress, [0.68, 0.74, 1], [0, 1, 1]);
  const opacities = [opacity1, opacity2, opacity3];

  if (reduceMotion) {
    return (
      <section ref={ref} className="py-24 md:py-32">
        <Container>
          <SectionLabel>فرآیند کار</SectionLabel>
          <h2 className="mb-14 max-w-2xl text-balance text-3xl font-extrabold leading-tight tracking-tight md:text-5xl">
            از یک ایده تا یک اثر حرفه‌ای
          </h2>
          <div className="mb-10 overflow-hidden rounded-3xl border border-border">
            <video
              src={VIDEO_SRC}
              poster={VIDEO_POSTER}
              className="aspect-video w-full object-cover"
              controls
              playsInline
              preload="metadata"
            />
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.title} className="rounded-2xl border border-border bg-card p-6">
                <step.icon size={22} className="mb-4 text-primary" />
                <h3 className="mb-2 font-bold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section ref={ref} className="relative h-[320vh]">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <Container className="grid w-full items-center gap-12 lg:grid-cols-2">
          <div className="relative order-2 h-56 lg:order-1 lg:h-72">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                style={{ opacity: opacities[index] }}
                className="absolute inset-0 flex flex-col justify-center"
              >
                <SectionLabel>{`مرحله ${index + 1} از ۳`}</SectionLabel>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <step.icon size={22} />
                </div>
                <h3 className="mb-3 text-balance text-2xl font-extrabold leading-tight md:text-4xl">
                  {step.title}
                </h3>
                <p className="max-w-md text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="order-1 lg:order-2">
            <motion.div
              style={{ scale }}
              className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-3xl border border-border shadow-2xl"
            >
              <video
                ref={videoRef}
                src={VIDEO_SRC}
                poster={VIDEO_POSTER}
                className="absolute inset-0 h-full w-full object-cover"
                muted
                playsInline
                preload="auto"
                aria-hidden
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
            </motion.div>
          </div>
        </Container>
      </div>
    </section>
  );
}
