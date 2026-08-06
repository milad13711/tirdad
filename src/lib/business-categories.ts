// Curated list admin picks from when tagging a prompt, and what the public
// gallery's filter row renders as "دسته‌بندی کسب‌وکار" instead of freeform
// tags. Stored in AiTool.tags (String[]) — no separate model, admin can
// still type a custom value if a business type is missing from this list.
export const BUSINESS_CATEGORIES = [
  "رستوران و کافه",
  "فروشگاه آنلاین",
  "پوشاک و مد",
  "آرایشی و بهداشتی",
  "املاک",
  "خدمات فنی و مهندسی",
  "آموزش و کوچینگ",
  "سلامت و پزشکی",
  "ورزش و تناسب اندام",
  "عکاسی و تدوین",
  "دیجیتال مارکتینگ",
  "هنر و صنایع‌دستی",
  "خودرو",
  "سفر و گردشگری",
  "کودک و نوزاد",
] as const;
