import type { Metadata } from "next";
import { Navbar } from "@/components/site/navbar";
import { MobileBottomNav } from "@/components/site/mobile-bottom-nav";
import { Footer } from "@/components/site/footer";
import { Container, SectionLabel, SectionTitle } from "@/components/site/container";
import { PublicCourseCard } from "@/components/site/public-course-card";
import { getAllPublishedCourses } from "@/lib/queries/courses-public";
import { getSiteSettings } from "@/lib/queries/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "همه پکیج‌های آموزشی",
  description: "آرشیو کامل پکیج‌های آموزشی تولید محتوا و هوش مصنوعی تیرداد.",
};

export default async function CoursesArchivePage() {
  const [courses, settings] = await Promise.all([getAllPublishedCourses(), getSiteSettings()]);

  return (
    <>
      <Navbar showPricing={settings.subscriptionPlansEnabled} />
      <main className="flex-1 py-24 md:py-32">
        <Container>
          <div className="mb-12 text-center">
            <div className="flex flex-col items-center">
              <SectionLabel>پکیج‌های آموزشی</SectionLabel>
              <SectionTitle>همه پکیج‌های آموزشی</SectionTitle>
            </div>
          </div>
          {courses.length === 0 ? (
            <p className="py-20 text-center text-muted-foreground">در حال حاضر پکیجی منتشر نشده است.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {courses.map((course) => (
                <PublicCourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </Container>
      </main>
      <Footer />
      <MobileBottomNav showPricing={settings.subscriptionPlansEnabled} />
    </>
  );
}
