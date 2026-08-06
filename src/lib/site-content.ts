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
  heroTitle: "رقیبت احتمالاً همین الان داره از هوش مصنوعی برای جذب مشتری استفاده می‌کنه...",
  heroTitleHighlight: "تو از کی می‌خوای شروع کنی؟",
  heroSubtitle:
    "واقعیت اینه که خیلی از کسب‌وکارها همین الان دارن با هوش مصنوعی سریع‌تر محتوا تولید می‌کنن، تبلیغات بهتری می‌سازن و مشتری بیشتری جذب می‌کنن. خبر خوب اینه که برای شروع لازم نیست متخصص باشی. با پرامپت‌های رایگان شروع کن، قدم‌به‌قدم یاد بگیر، محتوای حرفه‌ای بساز و وقتی آماده شدی، مشتری‌هات رو با CRM اینستاگرام مدیریت کن.",
  instagramTitle: "۴. مشتری‌ها را\nحفظ کن",
  instagramDescription:
    "جذب مشتری سخته؛ از دست دادنش فقط یه دایرکت نخونده می‌خواد. وقتی پیام‌ها زیاد می‌شن، پیگیری دستی تقریباً غیرممکنه. نتیجه؟ بعضی از مشتری‌ها فراموش می‌شن و همون موقع از یه جای دیگه خرید می‌کنن. CRM اینستاگرام کمک می‌کنه همه لیدها، دایرکت‌ها و مشتری‌ها همیشه جلوی چشمت باشن و هیچ فرصتی از دست نره.",
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
