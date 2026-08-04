import "server-only";
import { prisma } from "@/lib/db";

/**
 * Fixed set of editable landing-page text blocks. Adding a new editable
 * spot means: add a key here with its default, read it where that copy is
 * rendered, and add an input for it in the admin settings "content" form —
 * no schema migration needed since it all lives in SiteSettings.content.
 */
export const SITE_CONTENT_DEFAULTS = {
  heroTitle: "یک قدم جلوتر با",
  heroTitleHighlight: "محتوای هوشمند",
  heroSubtitle:
    "پرامپت‌های رایگان تولید عکس و فیلم با هوش مصنوعی، پکیج‌های آموزشی تخصصی و خدمات طراحی سفارشی — همه‌چیز برای رشد سریع کسب‌وکار شما در یک پلتفرم.",
  instagramTitle: "لیدهای اینستاگرام را\nهدر ندهید",
  instagramDescription:
    "هر پیام دایرکت و کامنت را به یک لید ثبت‌شده در قیف فروش تبدیل کنید و وضعیت پیگیری تا تبدیل نهایی را در یک داشبورد ساده دنبال کنید.",
  teaserCtaLabel: "دریافت پروژه تیزر تبلیغاتی",
  teaserCtaHref: "/login?next=/dashboard/service-requests",
} as const;

export type SiteContentKey = keyof typeof SITE_CONTENT_DEFAULTS;
export type SiteContent = Record<SiteContentKey, string>;

export async function getSiteContent(): Promise<SiteContent> {
  const settings = await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });

  const overrides = (settings.content ?? {}) as Partial<Record<SiteContentKey, string>>;
  return { ...SITE_CONTENT_DEFAULTS, ...overrides };
}
