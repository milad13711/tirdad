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
    "با پرامپت‌های رایگان تصویر و ویدیو شروع کن، با پکیج‌های آموزشی تخصصی عمیق‌تر یاد بگیر و وقتی آماده بودی، یک تیزر تبلیغاتی حرفه‌ای بساز و با CRM اختصاصی اینستاگرام، مشتری‌های جدیدت را مدیریت کن.",
  instagramTitle: "قدم چهارم: مشتری‌های\nتیزرت را مدیریت کن",
  instagramDescription:
    "وقتی تیزر حرفه‌ای‌ات دایرکت و کامنت جذب کرد، هر پیام را به یک لید ثبت‌شده در قیف فروش تبدیل کن و وضعیت پیگیری تا تبدیل نهایی را در یک داشبورد ساده دنبال کن — هیچ لیدی گم نشود.",
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
