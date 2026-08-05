import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container, SectionLabel, SectionTitle } from "@/components/site/container";
import { Reveal } from "@/components/site/reveal";
import { PublicCourseCard } from "@/components/site/public-course-card";
import { getLandingCourses } from "@/lib/queries/courses-public";

export async function Courses() {
  const courses = await getLandingCourses(3);
  if (courses.length === 0) return null;

  return (
    <section id="courses" className="py-24 md:py-32">
      <Container className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <Reveal>
          <SectionLabel>قدم دوم: پکیج‌های آموزشی</SectionLabel>
          <SectionTitle>
            وقتی پرامپت‌های رایگان را
            <br /> امتحان کردی، عمیق‌تر یاد بگیر
          </SectionTitle>
          <p className="mt-4 max-w-xl leading-7 text-muted-foreground">
            دوره‌های گام‌به‌گام تولید محتوا و رشد کسب‌وکار با هوش مصنوعی، با پشتیبانی کامل.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <Button variant="outline" asChild>
            <Link href="/courses">
              مشاهده همه پکیج‌ها
              <ArrowLeft size={16} />
            </Link>
          </Button>
        </Reveal>
      </Container>

      <Container>
        <div className="grid gap-6 md:grid-cols-3">
          {courses.map((course, index) => (
            <Reveal key={course.id} delay={index * 0.1}>
              <PublicCourseCard course={course} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
