"use client";

import Link from "next/link";
import { ArrowLeft, PlayCircle } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/site/container";

const stats = [
  { value: "+۵۰", label: "پکیج و ابزار" },
  { value: "+۱۲هزار", label: "کاربر فعال" },
  { value: "+۹۸٪", label: "رضایت مشتریان" },
];

export function Hero() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center overflow-hidden pt-28 pb-20"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px] dark:bg-primary/15"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.4] [background-image:linear-gradient(var(--color-border)_1px,transparent_1px),linear-gradient(90deg,var(--color-border)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]"
      />

      <Container className="relative z-10 flex flex-col items-center text-center">
        <motion.div
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          پلتفرم آموزش، هوش مصنوعی و رشد اینستاگرام
        </motion.div>

        <motion.h1
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="max-w-4xl text-balance text-4xl font-extrabold leading-[1.15] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
        >
          یک قدم جلوتر با{" "}
          <span className="bg-gradient-to-l from-primary to-primary/60 bg-clip-text text-transparent">
            محتوای هوشمند
          </span>
        </motion.h1>

        <motion.p
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 max-w-2xl text-balance text-base text-muted-foreground sm:text-lg"
        >
          پرامپت‌های رایگان تولید عکس و فیلم با هوش مصنوعی، پکیج‌های آموزشی تخصصی و
          خدمات طراحی سفارشی — همه‌چیز برای رشد سریع کسب‌وکار شما در یک پلتفرم.
        </motion.p>

        <motion.div
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          <Button size="lg" asChild>
            <Link href="/login">
              شروع رایگان
              <ArrowLeft size={18} />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="#ai-tools">
              <PlayCircle size={18} />
              مشاهده دموی ابزارها
            </a>
          </Button>
        </motion.div>

        <motion.div
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-16 grid w-full max-w-lg grid-cols-3 gap-6 border-t border-border pt-8"
        >
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl font-extrabold text-primary sm:text-3xl">
                {stat.value}
              </div>
              <div className="mt-1 text-xs text-muted-foreground sm:text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
