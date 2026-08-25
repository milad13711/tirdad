import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, Lock, PlayCircle, Signal, Users } from "lucide-react";
import { Navbar } from "@/components/site/navbar";
import { MobileBottomNav } from "@/components/site/mobile-bottom-nav";
import { Footer } from "@/components/site/footer";
import { Container } from "@/components/site/container";
import { Button } from "@/components/ui/button";
import { BuyButton } from "@/components/dashboard/buy-button";
import { getCourseBySlug } from "@/lib/queries/courses-public";
import { getSiteSettings } from "@/lib/queries/settings";
import { getSiteContent } from "@/lib/site-content";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { formatToman } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return {};
  return {
    title: course.title,
    description: course.description ?? `پکیج آموزشی ${course.title}`,
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [course, settings, content, session] = await Promise.all([
    getCourseBySlug(slug),
    getSiteSettings(),
    getSiteContent(),
    getSession(),
  ]);
  if (!course) notFound();

  const enrollment = session
    ? await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: session.sub, courseId: course.id } },
      })
    : null;
  const alreadyOwned = Boolean(enrollment);

  const demoLesson = course.lessons.find((lesson) => lesson.isFreeDemo && lesson.videoUrl);
  const isYoutubeDemo =
    demoLesson?.videoUrl?.includes("youtube.com") || demoLesson?.videoUrl?.includes("youtu.be");

  return (
    <>
      <Navbar
        showPricing={settings.subscriptionPlansEnabled}
        siteTitle={content.siteTitle}
        logoUrl={content.logoUrl}
      />
      <main className="flex-1 py-16 md:py-24">
        <Container className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="mb-6 aspect-video w-full overflow-hidden rounded-2xl border border-border bg-black">
              {demoLesson?.videoUrl ? (
                isYoutubeDemo ? (
                  <iframe
                    src={demoLesson.videoUrl.replace("watch?v=", "embed/")}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video src={demoLesson.videoUrl} controls className="h-full w-full" />
                )
              ) : course.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={course.coverImage} alt={course.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <PlayCircle size={40} />
                </div>
              )}
            </div>

            <h1 className="mb-4 text-2xl font-extrabold leading-10 md:text-3xl">{course.title}</h1>

            <div className="mb-8 flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
              {course.level && (
                <span className="flex items-center gap-1.5">
                  <Signal size={15} /> {course.level}
                </span>
              )}
              {course.durationLabel && (
                <span className="flex items-center gap-1.5">
                  <Clock size={15} /> {course.durationLabel}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Users size={15} /> {course._count.enrollments} دانشجو
              </span>
            </div>

            {course.description && (
              <div className="mb-10">
                <h2 className="mb-3 font-bold">درباره این پکیج</h2>
                <p className="leading-8 text-muted-foreground">{course.description}</p>
              </div>
            )}

            {course.lessons.length > 0 && (
              <div>
                <h2 className="mb-3 font-bold">سرفصل‌های دوره ({course.lessons.length} جلسه)</h2>
                <div className="divide-y divide-border rounded-xl border border-border">
                  {course.lessons.map((lesson, index) => (
                    <div key={lesson.id} className="flex items-center justify-between gap-3 p-4">
                      <span className="flex items-center gap-3 text-sm">
                        <span className="text-muted-foreground">{index + 1}.</span>
                        {lesson.title}
                      </span>
                      {lesson.isFreeDemo ? (
                        <span className="flex items-center gap-1 text-xs text-primary">
                          <PlayCircle size={13} /> دموی رایگان
                        </span>
                      ) : (
                        <Lock size={14} className="text-muted-foreground" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="h-fit rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-24">
            <div className="mb-5 text-2xl font-extrabold">{formatToman(course.price)} تومان</div>

            {alreadyOwned ? (
              <>
                <Button asChild className="w-full">
                  <Link href={`/dashboard/courses/${course.id}`}>
                    <CheckCircle2 size={16} />
                    ادامه یادگیری
                  </Link>
                </Button>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  شما این پکیج را قبلاً خریداری کرده‌اید.
                </p>
              </>
            ) : session ? (
              <BuyButton payload={{ itemType: "COURSE", courseId: course.id }} className="w-full">
                خرید و شروع یادگیری
              </BuyButton>
            ) : (
              <>
                <Button asChild className="w-full">
                  <Link href="/login">ورود برای خرید پکیج</Link>
                </Button>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  برای خرید ابتدا وارد حساب کاربری خود شوید.
                </p>
              </>
            )}
          </aside>
        </Container>
      </main>
      <Footer siteTitle={content.siteTitle} logoUrl={content.logoUrl} />
      <MobileBottomNav showPricing={settings.subscriptionPlansEnabled} siteTitle={content.siteTitle} />
    </>
  );
}
