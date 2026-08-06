"use client";

import { useEffect, useState } from "react";
import { GraduationCap, ShieldCheck, Sparkles as SparklesIcon, Star, Users } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/site/container";
import type { SiteContent } from "@/lib/site-content";

const VIDEO_MP4 = "/videos/hero-portrait.mp4";
const VIDEO_WEBM = "/videos/hero-portrait.webm";
const VIDEO_POSTER = "/videos/hero-portrait-poster.jpg";
// Keeps the subject's face/eyes inside the visible crop at every
// breakpoint's aspect ratio (object-fit: cover trims the sides of this
// landscape source down to a portrait-feeling frame).
const VIDEO_OBJECT_POSITION = "42% 32%";

const trustIndicators = [
  { icon: Users, label: "+۱۲هزار کاربر فعال" },
  { icon: Star, label: "۹۸٪ رضایت مشتریان" },
  { icon: ShieldCheck, label: "+۵۰ پکیج و ابزار" },
];

export function Hero({ content }: { content: SiteContent }) {
  const prefersReducedMotion = useReducedMotion();
  // Server always sees prefersReducedMotion as null/false; swapping the
  // rendered tree (video vs. static poster) straight off it would cause a
  // hydration mismatch for anyone with OS-level reduced motion on. Defer
  // the swap to a post-mount effect so the first paint is identical on
  // server and client — same pattern used by ScrollDecor/BackgroundVideo.
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReduceMotion(!!prefersReducedMotion);
  }, [prefersReducedMotion]);

  return (
    <section id="home" className="relative overflow-hidden bg-background pt-28 pb-20 md:pb-28">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 start-1/4 h-[520px] w-[520px] rounded-full bg-primary/15 blur-[130px]"
      />

      <Container className="relative z-10 grid items-center gap-14 lg:grid-cols-[45%_55%] lg:gap-10">
        {/* Text column — first in source order, so it lands on the
            reading-start side under both the site's RTL layout and a
            plain LTR fallback. */}
        <div className="flex flex-col items-start text-start">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            هر روز که می‌گذرد، رقبای تو دارند از هوش مصنوعی جلو می‌افتند
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-balance text-4xl font-extrabold leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl"
          >
            {content.heroTitle}{" "}
            <span className="bg-gradient-to-l from-primary to-primary/60 bg-clip-text text-transparent">
              {content.heroTitleHighlight}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 max-w-xl text-balance text-base leading-8 text-muted-foreground sm:text-lg"
          >
            {content.heroSubtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center"
          >
            <Button size="lg" asChild>
              <a href="#ai-tools">
                <SparklesIcon size={18} />
                پرامپت‌های رایگان را امتحان کن
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#courses">
                <GraduationCap size={18} />
                با دوره‌ها از بقیه جلو بیفت
              </a>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border pt-6"
          >
            {trustIndicators.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-xs text-muted-foreground">
                <item.icon size={14} className="text-primary/70" />
                {item.label}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Video column — floats as a contained card, never full-bleed, so
            it stays a supporting visual rather than the focal point. */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mx-auto w-full max-w-md lg:mx-0 lg:max-w-[480px]"
        >
          <div className="relative h-[280px] w-full overflow-hidden rounded-[28px] bg-black shadow-[0_40px_120px_-24px_rgba(0,0,0,0.65)] sm:h-[320px] lg:h-auto lg:aspect-[4/5]">
            {reduceMotion ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={VIDEO_POSTER}
                alt=""
                className="h-full w-full object-cover opacity-90"
                style={{ objectPosition: VIDEO_OBJECT_POSITION }}
              />
            ) : (
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster={VIDEO_POSTER}
                aria-hidden
                className="h-full w-full object-cover opacity-90"
                style={{ objectPosition: VIDEO_OBJECT_POSITION }}
              >
                <source src={VIDEO_WEBM} type="video/webm" />
                <source src={VIDEO_MP4} type="video/mp4" />
              </video>
            )}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
