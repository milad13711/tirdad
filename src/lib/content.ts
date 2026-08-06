export const plans = [
  {
    name: "پایه",
    price: "۴۹۰٬۰۰۰",
    period: "ماهانه",
    runsPerMonth: "۵۰ اجرا در ماه",
    highlighted: false,
    features: [
      "دسترسی به ابزارهای پایه AI",
      "۵۰ اجرا در ماه",
      "پشتیبانی ایمیلی",
      "دسترسی به بلاگ آموزشی",
    ],
  },
  {
    name: "پرو",
    price: "۹۹۰٬۰۰۰",
    period: "ماهانه",
    runsPerMonth: "۲۰۰ اجرا در ماه",
    highlighted: true,
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
    price: "۱٬۹۹۰٬۰۰۰",
    period: "ماهانه",
    runsPerMonth: "نامحدود",
    highlighted: false,
    features: [
      "اجرای نامحدود ابزارهای AI",
      "دسترسی کامل به دوره‌ها",
      "مشاوره اختصاصی ماهانه",
      "پشتیبانی اختصاصی",
    ],
  },
] as const;

export const testimonials = [
  {
    name: "علی رستمی",
    role: "کارآفرین دیجیتال",
    quote:
      "با ابزارهای هوش مصنوعی این پلتفرم، زمان تولید محتوای صفحه اینستاگرامم رو به یک‌سوم رسوندم.",
  },
  {
    name: "سارا محمدی",
    role: "مدیر برند",
    quote:
      "دوره فیلم‌سازی واقعاً کاربردی بود؛ بعد از دوره تیزرهای خودمون رو داخلی تولید می‌کنیم.",
  },
  {
    name: "امیر حسینی",
    role: "صاحب فروشگاه آنلاین",
    quote: "CRM داخلی کمک کرد لیدهای اینستاگرام رو دقیق پیگیری کنیم و فروش بیشتری ببندیم.",
  },
] as const;

export const faqs = [
  {
    question: "آیا برای استفاده از ابزارهای هوش مصنوعی نیاز به دانش فنی دارم؟",
    answer:
      "خیر. ابزارها طوری طراحی شده‌اند که فقط با آپلود فایل و یک کلیک، خروجی حرفه‌ای دریافت کنید.",
  },
  {
    question: "پلن رایگان چه محدودیتی دارد؟",
    answer: "کاربران رایگان روزانه ۳ بار می‌توانند از ابزارهای هوش مصنوعی استفاده کنند.",
  },
  {
    question: "آیا امکان لغو اشتراک وجود دارد؟",
    answer: "بله، هر زمان از پنل کاربری می‌توانید اشتراک خود را لغو یا تغییر پلن دهید.",
  },
  {
    question: "دوره‌ها به چه صورت ارائه می‌شوند؟",
    answer:
      "دوره‌ها به‌صورت ویدیوهای ضبط‌شده در پنل کاربری شما فعال می‌شوند و دسترسی نامحدود دارید.",
  },
] as const;

// Root-relative (leading "/") rather than bare "#anchor" — Navbar is also
// rendered on /courses, /prompts, and /blog/[slug], which don't have these
// section ids on the page, so a bare hash link would silently do nothing
// there. "/#ai-tools" always resolves to the homepage section from any page.
export const navLinks = [
  { label: "خانه", href: "/" },
  { label: "پرامپت رایگان", href: "/#ai-tools" },
  { label: "دوره‌ها", href: "/#courses" },
  { label: "آنالیز رایگان پیج", href: "/#page-analysis" },
  { label: "CRM اینستاگرام", href: "/#instagram-crm" },
  { label: "پلن‌ها", href: "/#pricing" },
  { label: "بلاگ", href: "/#blog" },
] as const;
