"use client";

import { useRef } from "react";
import { ArrowLeft, BookOpen, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container, SectionLabel, SectionTitle } from "@/components/site/container";
import { Reveal } from "@/components/site/reveal";
import { courses } from "@/lib/content";

export function Courses() {
  const trackRef = useRef<HTMLDivElement>(null);

  return (
    <section id="courses" className="py-24 md:py-32">
      <Container className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <Reveal>
          <SectionLabel>پکیج‌های آموزشی</SectionLabel>
          <SectionTitle>
            یادگیری گام‌به‌گام
            <br /> با پشتیبانی کامل
          </SectionTitle>
        </Reveal>
        <Reveal delay={0.15}>
          <Button variant="outline">
            مشاهده همه پکیج‌ها
            <ArrowLeft size={16} />
          </Button>
        </Reveal>
      </Container>

      <div
        ref={trackRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-4 md:px-10"
      >
        {courses.map((course, index) => (
          <Reveal key={course.title} delay={index * 0.1} className="shrink-0 snap-start">
            <article className="flex h-full w-[300px] flex-col rounded-2xl border border-border bg-card p-7 sm:w-[340px]">
              <span className="mb-6 w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {course.category}
              </span>
              <h3 className="mb-4 text-xl font-bold leading-8">{course.title}</h3>
              <div className="mb-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <BookOpen size={15} /> {course.lessons} درس
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={15} /> {course.duration}
                </span>
              </div>
              <div className="mt-auto flex items-center justify-between border-t border-border pt-5">
                <span className="text-sm text-muted-foreground">{course.level}</span>
                <span className="text-lg font-extrabold">
                  {course.price}
                  <span className="mr-1 text-xs font-normal text-muted-foreground">
                    تومان
                  </span>
                </span>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
