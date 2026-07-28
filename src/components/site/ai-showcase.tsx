"use client";

import { useState } from "react";
import { ImageIcon, Wand2, Zap } from "lucide-react";
import { Container, SectionLabel, SectionTitle } from "@/components/site/container";
import { Reveal } from "@/components/site/reveal";
import { aiTools } from "@/lib/content";

export function AiShowcase() {
  const [position, setPosition] = useState(52);

  return (
    <section id="ai-tools" className="py-24 md:py-32">
      <Container>
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <Reveal from="right">
            <div
              className="group relative aspect-4/3 w-full select-none overflow-hidden rounded-2xl border border-border"
              onPointerMove={(event) => {
                if (event.buttons !== 1) return;
                const rect = event.currentTarget.getBoundingClientRect();
                const ratio = ((event.clientX - rect.left) / rect.width) * 100;
                setPosition(Math.min(100, Math.max(0, ratio)));
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-secondary to-background">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ImageIcon size={40} />
                  <span className="text-xs">قبل از پردازش هوش مصنوعی</span>
                </div>
              </div>
              <div
                className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/25 via-primary/10 to-background"
                style={{ clipPath: `inset(0 0 0 ${position}%)` }}
              >
                <div className="flex flex-col items-center gap-2 text-primary">
                  <Wand2 size={40} />
                  <span className="text-xs">بعد از پردازش هوش مصنوعی</span>
                </div>
              </div>
              <div
                className="absolute inset-y-0 flex w-10 -translate-x-1/2 cursor-ew-resize items-center justify-center"
                style={{ left: `${position}%` }}
              >
                <div className="h-full w-px bg-primary" />
                <div className="absolute flex h-9 w-9 items-center justify-center rounded-full border border-primary bg-background text-primary shadow-lg">
                  <Zap size={14} />
                </div>
              </div>
              <span className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-background/80 px-3 py-1 text-[11px] text-muted-foreground backdrop-blur">
                برای مقایسه بکشید
              </span>
            </div>
          </Reveal>

          <Reveal>
            <SectionLabel>ابزارهای هوش مصنوعی</SectionLabel>
            <SectionTitle className="mb-6">
              خروجی حرفه‌ای، بدون
              <br /> نیاز به تخصص
            </SectionTitle>
            <p className="mb-10 leading-8 text-muted-foreground">
              فایل خود را آپلود کنید، ابزار موردنظر را انتخاب کنید و در چند ثانیه خروجی
              آماده انتشار دریافت کنید. پرامپت‌های حرفه‌ای پشت صحنه، کاملاً برای شما
              پنهان می‌ماند.
            </p>

            <div className="space-y-4">
              {aiTools.map((tool) => (
                <div
                  key={tool.title}
                  className="flex items-start justify-between gap-4 rounded-lg border border-border bg-card p-5"
                >
                  <div>
                    <h3 className="font-semibold">{tool.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {tool.description}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {tool.credits} کردیت
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
