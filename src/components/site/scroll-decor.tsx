"use client";

import { AtSign, Camera, Clapperboard, Film, Sparkles, Wand2 } from "lucide-react";
import { motion, useScroll, useTransform, useReducedMotion, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

// Fills the large empty side gutters next to the centered `Container` (only
// visible from lg up, where there's actually room) with a handful of
// content/editing/Instagram-themed icons that drift at scroll-linked
// parallax speeds. Purely decorative (aria-hidden, pointer-events-none) so
// it can't get in the way of any real UI, and hidden below lg so it never
// competes with content on the screens where space is already tight.
const items: {
  Icon: typeof Clapperboard;
  top: string;
  side: "left" | "right";
  size: number;
  range: [number, number];
}[] = [
  { Icon: Clapperboard, top: "6%", side: "left", size: 26, range: [0, 260] },
  { Icon: AtSign, top: "16%", side: "right", size: 22, range: [0, -220] },
  { Icon: Camera, top: "34%", side: "left", size: 24, range: [0, 300] },
  { Icon: Sparkles, top: "48%", side: "right", size: 20, range: [0, -260] },
  { Icon: Film, top: "64%", side: "left", size: 28, range: [0, 240] },
  { Icon: Wand2, top: "80%", side: "right", size: 22, range: [0, -280] },
];

function DecorIcon({
  Icon,
  top,
  side,
  size,
  scrollYProgress,
  range,
  reduceMotion,
}: {
  Icon: typeof Clapperboard;
  top: string;
  side: "left" | "right";
  size: number;
  scrollYProgress: MotionValue<number>;
  range: readonly [number, number];
  reduceMotion: boolean;
}) {
  const yRange: number[] = reduceMotion ? [0, 0] : [...range];
  const rotateRange: number[] = reduceMotion ? [0, 0] : [0, side === "left" ? 20 : -20];
  const y = useTransform(scrollYProgress, [0, 1], yRange);
  const rotate = useTransform(scrollYProgress, [0, 1], rotateRange);

  return (
    <motion.div
      aria-hidden
      style={{ y, rotate, top }}
      className={cn(
        "pointer-events-none absolute hidden h-14 w-14 items-center justify-center rounded-2xl border border-border/60 bg-card/40 text-primary/40 backdrop-blur-sm lg:flex",
        side === "left" ? "left-2 xl:left-8" : "right-2 xl:right-8",
      )}
    >
      <Icon size={size} strokeWidth={1.5} />
    </motion.div>
  );
}

export function ScrollDecor() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      {items.map((item) => (
        <DecorIcon
          key={item.top}
          {...item}
          scrollYProgress={scrollYProgress}
          reduceMotion={!!prefersReducedMotion}
        />
      ))}
    </div>
  );
}
