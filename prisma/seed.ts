import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const plans = await Promise.all(
    [
      {
        name: "پایه",
        slug: "basic",
        price: 490_000,
        dailyRunLimit: null,
        monthlyRunLimit: 50,
        features: [
          "دسترسی به ابزارهای پایه AI",
          "۵۰ اجرا در ماه",
          "پشتیبانی ایمیلی",
          "دسترسی به بلاگ آموزشی",
        ],
      },
      {
        name: "پرو",
        slug: "pro",
        price: 990_000,
        dailyRunLimit: 20,
        monthlyRunLimit: 200,
        features: [
          "دسترسی به همه ابزارهای AI",
          "۲۰۰ اجرا در ماه",
          "تخفیف ویژه روی دوره‌ها",
          "پشتیبانی اولویت‌دار",
          "دانلود بسته پرامپت رایگان",
        ],
      },
      {
        name: "مکس",
        slug: "max",
        price: 1_990_000,
        dailyRunLimit: null,
        monthlyRunLimit: null,
        features: [
          "اجرای نامحدود ابزارهای AI",
          "دسترسی کامل به دوره‌ها",
          "مشاوره اختصاصی ماهانه",
          "پشتیبانی اختصاصی",
        ],
      },
    ].map((plan) =>
      prisma.subscriptionPlan.upsert({
        where: { slug: plan.slug },
        update: plan,
        create: plan,
      }),
    ),
  );

  const [, proPlan] = plans;

  const courses = await Promise.all(
    [
      {
        title: "مسیر جامع تولید محتوا با هوش مصنوعی",
        slug: "ai-content-mastery",
        price: 1_980_000,
        level: "مقدماتی تا پیشرفته",
        published: true,
      },
      {
        title: "فیلم‌سازی و تدوین حرفه‌ای برای اینستاگرام",
        slug: "instagram-filmmaking",
        price: 1_490_000,
        level: "متوسط",
        published: true,
      },
      {
        title: "قیف فروش و رشد ارگانیک اینستاگرام",
        slug: "instagram-growth-funnel",
        price: 990_000,
        level: "مقدماتی",
        published: true,
      },
    ].map((course) =>
      prisma.course.upsert({ where: { slug: course.slug }, update: course, create: course }),
    ),
  );

  await prisma.lesson.deleteMany({ where: { courseId: courses[0].id } });
  await prisma.lesson.createMany({
    data: Array.from({ length: 5 }).map((_, i) => ({
      courseId: courses[0].id,
      title: `درس ${i + 1}: مبانی و مفاهیم پایه`,
      order: i + 1,
      isFreeDemo: i === 0,
    })),
  });

  const aiTools = await Promise.all(
    [
      {
        name: "بازسازی تصویر محصول",
        type: "IMAGE" as const,
        creditCost: 2,
        promptText:
          "Professional studio product photography, clean background, soft shadows, commercial lighting",
        active: true,
      },
      {
        name: "تولید تیزر کوتاه از متن",
        type: "VIDEO" as const,
        creditCost: 5,
        promptText: "Short vertical promotional teaser, dynamic cuts, upbeat pacing",
        active: true,
      },
      {
        name: "افکت سینمایی پرتره",
        type: "IMAGE" as const,
        creditCost: 3,
        promptText: "Cinematic portrait lighting, dramatic shadows, film grain, color grade",
        active: true,
      },
      {
        name: "تولید وویس‌اُور هوشمند",
        type: "AUDIO" as const,
        creditCost: 4,
        promptText: "Natural Persian voiceover, warm tone, broadcast quality",
        active: false,
      },
    ].map((tool) =>
      prisma.aiTool.upsert({
        where: { name: tool.name },
        update: tool,
        create: tool,
      }),
    ),
  );

  const admin = await prisma.user.upsert({
    where: { phone: "09110000000" },
    update: { role: "ADMIN", name: "مدیر سیستم" },
    create: { phone: "09110000000", role: "ADMIN", name: "مدیر سیستم" },
  });

  const demoUser = await prisma.user.upsert({
    where: { phone: "09113104097" },
    update: { name: "علی رستمی" },
    create: { phone: "09113104097", name: "علی رستمی" },
  });

  await prisma.subscription.deleteMany({ where: { userId: demoUser.id } });
  await prisma.subscription.create({
    data: {
      userId: demoUser.id,
      planId: proPlan.id,
      status: "ACTIVE",
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: demoUser.id, courseId: courses[0].id } },
    update: { progress: 68 },
    create: { userId: demoUser.id, courseId: courses[0].id, progress: 68 },
  });

  await prisma.aiGeneration.createMany({
    data: [
      {
        userId: demoUser.id,
        aiToolId: aiTools[0].id,
        status: "COMPLETED",
        creditsUsed: aiTools[0].creditCost,
      },
      {
        userId: demoUser.id,
        aiToolId: aiTools[1].id,
        status: "COMPLETED",
        creditsUsed: aiTools[1].creditCost,
      },
    ],
  });

  await prisma.lead.createMany({
    data: [
      { name: "محمد اکبری", source: "DIRECT", topic: "درخواست قیمت دوره", stage: "NEW" },
      { name: "زهرا نوری", source: "COMMENT", topic: "سوال درباره ابزار AI", stage: "NEW" },
      { name: "رضا قاسمی", source: "BIO_LINK", topic: "علاقه‌مند به پلن مکس", stage: "CONTACTED" },
      { name: "مریم صادقی", source: "DIRECT", topic: "بسته پرامپت اختصاصی", stage: "OFFERED" },
      { name: "امیر حسینی", source: "DIRECT", topic: "خرید پلن پرو", stage: "CONVERTED" },
      { name: "سینا مرادی", source: "COMMENT", topic: "عدم پاسخگویی", stage: "LOST" },
    ],
    skipDuplicates: true,
  });

  await prisma.blogPost.upsert({
    where: { slug: "reels-content-formulas" },
    update: {},
    create: {
      title: "۷ اصل طراحی محتوای ریلز که فروش را افزایش می‌دهد",
      slug: "reels-content-formulas",
      excerpt: "چگونه با اصول ساده روایت‌گری، نرخ تبدیل ریلزهای خود را بالا ببرید.",
      status: "PUBLISHED",
      views: 4210,
      publishedAt: new Date(),
    },
  });

  await prisma.coupon.upsert({
    where: { code: "WELCOME20" },
    update: {},
    create: { code: "WELCOME20", discountPercent: 20, usageLimit: 500, usedCount: 124 },
  });

  console.log("Seed complete:", { admin: admin.phone, demoUser: demoUser.phone });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
