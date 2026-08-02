"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Camera, Sparkles, Wand2 } from "lucide-react";
import { Container, SectionLabel } from "@/components/site/container";

const steps = [
  {
    icon: Camera,
    title: "یک عکس ساده بگیرید",
    desc: "با موبایل یا دوربین خودتون، فقط یک عکس ساده و خام از محصول یا صحنه‌ی مورد نظرتون بگیرید.",
  },
  {
    icon: Wand2,
    title: "پردازش با هوش مصنوعی",
    desc: "نور، رنگ، پس‌زمینه و جزئیات به‌صورت خودکار و حرفه‌ای بازسازی می‌شن.",
  },
  {
    icon: Sparkles,
    title: "یک اثر حرفه‌ای تحویل بگیرید",
    desc: "یک تصویر یا تیزر تبلیغاتی در حد استودیوهای حرفه‌ای، آماده انتشار.",
  },
];

export function ScrollStory() {
  const ref = useRef<HTMLDivElement>(null);
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

  const grayscale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.35, 0]);
  const saturate = useTransform(scrollYProgress, [0, 0.5, 1], [0.5, 1, 1.6]);
  const brightness = useTransform(scrollYProgress, [0, 0.5, 1], [0.75, 1, 1.1]);
  const filter = useTransform(
    [grayscale, saturate, brightness],
    ([g, s, b]) => `grayscale(${g}) saturate(${s}) brightness(${b})`,
  );
  const scale = useTransform(scrollYProgress, [0, 1], [0.94, 1.04]);
  const glow = useTransform(scrollYProgress, [0.55, 1], [0, 1]);
  const scanline = useTransform(scrollYProgress, [0.2, 0.55], [0, 1]);
  const scanlineOpacity = useTransform(scrollYProgress, [0.2, 0.4, 0.55], [0, 1, 0]);
  const scanlineY = useTransform(scanline, [0, 1], ["0%", "100%"]);

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
            از یک عکس ساده تا یک اثر حرفه‌ای
          </h2>
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
              <motion.div
                style={{ filter }}
                className="absolute inset-0 bg-[radial-gradient(circle_at_35%_30%,var(--color-primary)_0%,transparent_45%),radial-gradient(circle_at_70%_70%,var(--color-primary)_0%,transparent_55%)] bg-secondary"
              />
              <motion.div
                aria-hidden
                style={{ opacity: scanlineOpacity, top: scanlineY }}
                className="absolute inset-x-0 h-1 bg-primary shadow-[0_0_24px_6px_var(--color-primary)]"
              />
              <motion.div
                aria-hidden
                style={{ opacity: glow }}
                className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-primary/30 via-transparent to-primary/10"
              />
              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
            </motion.div>
          </div>
        </Container>
      </div>
    </section>
  );
}
