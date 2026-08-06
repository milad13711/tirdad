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
          <SectionLabel>۲. حرفه‌ای یاد بگیر</SectionLabel>
          <SectionTitle>
            یک بار برای همیشه یاد بگیر
            <br /> و دیگر عقب نمان
          </SectionTitle>
          <p className="mt-4 max-w-xl leading-7 text-muted-foreground">
            فرق کسی که از هوش مصنوعی پول درمی‌آره با کسی که فقط باهاش بازی می‌کنه، توی یاد
            گرفتنه. خیلی‌ها ChatGPT رو باز می‌کنن، چند سؤال می‌پرسن و فکر می‌کنن همین یعنی
            استفاده از هوش مصنوعی؛ ولی کسب‌وکارهایی که دارن رشد می‌کنن، دقیقاً می‌دونن چطور
            ازش برای تولید محتوا، تبلیغات و فروش استفاده کنن. ما هم دقیقاً همون چیزهایی رو
            یادت می‌دیم که توی بازار واقعاً جواب داده.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <Button variant="outline" asChild>
            <Link href="/courses">
              مشاهده همه آموزش‌ها
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
