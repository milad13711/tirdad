import "server-only";
import { prisma } from "@/lib/db";

/**
 * Fixed set of editable landing-page text blocks. Adding a new editable
 * spot means: add a key here with its default, read it where that copy is
 * rendered, and add an input for it in the admin settings "content" form —
 * no schema migration needed since it all lives in SiteSettings.content.
 */
export const SITE_CONTENT_DEFAULTS = {
  siteTitle: "تیرداد",
  // Empty means "no custom logo uploaded" — every place that renders the
  // logo falls back to the default Sparkles-in-a-box mark when this is "".
  logoUrl: "",
  heroTitle: "دیگر عقب نمان از",
  heroTitleHighlight: "هوش مصنوعی",
  heroSubtitle:
    "کسب‌وکارهایی که امروز از هوش مصنوعی استفاده می‌کنند، فردا از تو جلوتر خواهند بود. با پرامپت‌های رایگان تصویر و ویدیو شروع کن، با پکیج‌های آموزشی حرفه‌ای شو و وقتی آماده بودی، یک تیزر تبلیغاتی بساز و مشتری‌هایت را با CRM اینستاگرام مدیریت کن — بدون نیاز به دانش فنی، همین امروز.",
  instagramTitle: "قدم چهارم: دیگر هیچ\nمشتری‌ای را از دست نده",
  instagramDescription:
    "وقتی تیزر حرفه‌ای‌ات دایرکت و کامنت جذب کرد، هر پیام را به یک لید ثبت‌شده در قیف فروش تبدیل کن و وضعیت پیگیری تا تبدیل نهایی را در یک داشبورد ساده دنبال کن — هیچ مشتری بالقوه‌ای گم نشود.",
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
