export const currentUser = {
  name: "علی رستمی",
  phone: "۰۹۱۱۳۱۰۴۰۹۷",
  plan: "پرو",
  planRenewsAt: "۱۴۰۴/۰۶/۱۲",
  dailyRunsUsed: 7,
  dailyRunsLimit: 20,
  monthlyRunsUsed: 86,
  monthlyRunsLimit: 200,
};

export const myCourses = [
  {
    id: "c1",
    title: "مسیر جامع تولید محتوا با هوش مصنوعی",
    progress: 68,
    lessons: 32,
    completedLessons: 22,
  },
  {
    id: "c2",
    title: "فیلم‌سازی و تدوین حرفه‌ای برای اینستاگرام",
    progress: 25,
    lessons: 24,
    completedLessons: 6,
  },
  {
    id: "c3",
    title: "قیف فروش و رشد ارگانیک اینستاگرام",
    progress: 100,
    lessons: 20,
    completedLessons: 20,
  },
] as const;

export const myGenerations = [
  {
    id: "g1",
    tool: "بازسازی تصویر محصول",
    date: "۱۴۰۴/۰۴/۰۵ - ۱۴:۲۰",
    status: "تکمیل‌شده",
    credits: 2,
  },
  {
    id: "g2",
    tool: "تولید تیزر کوتاه از متن",
    date: "۱۴۰۴/۰۴/۰۴ - ۰۹:۱۰",
    status: "تکمیل‌شده",
    credits: 5,
  },
  {
    id: "g3",
    tool: "افکت سینمایی پرتره",
    date: "۱۴۰۴/۰۴/۰۳ - ۱۸:۴۵",
    status: "در حال پردازش",
    credits: 3,
  },
  {
    id: "g4",
    tool: "بازسازی تصویر محصول",
    date: "۱۴۰۴/۰۴/۰۱ - ۱۱:۰۰",
    status: "ناموفق",
    credits: 2,
  },
] as const;

export const myInvoices = [
  { id: "INV-1042", item: "پلن پرو - تمدید ماهانه", date: "۱۴۰۴/۰۴/۱۲", amount: "۹۹۰٬۰۰۰", status: "پرداخت‌شده" },
  { id: "INV-1031", item: "دوره فیلم‌سازی حرفه‌ای", date: "۱۴۰۴/۰۳/۲۰", amount: "۱٬۴۹۰٬۰۰۰", status: "پرداخت‌شده" },
  { id: "INV-1020", item: "بسته پرامپت تولید محتوا", date: "۱۴۰۴/۰۳/۰۲", amount: "۲۹۰٬۰۰۰", status: "پرداخت‌شده" },
  { id: "INV-1005", item: "پلن پایه - ماه اول", date: "۱۴۰۴/۰۲/۱۲", amount: "۴۹۰٬۰۰۰", status: "بازپرداخت‌شده" },
] as const;

export const myTickets = [
  {
    id: "T-204",
    subject: "مشکل در دانلود خروجی ابزار تیزر",
    status: "در انتظار پاسخ",
    updatedAt: "۲ ساعت پیش",
  },
  {
    id: "T-198",
    subject: "سوال درباره تمدید خودکار اشتراک",
    status: "پاسخ داده‌شده",
    updatedAt: "دیروز",
  },
  {
    id: "T-176",
    subject: "درخواست فاکتور رسمی",
    status: "بسته‌شده",
    updatedAt: "۵ روز پیش",
  },
] as const;

export const adminStats = [
  { label: "درآمد این ماه", value: "۴۸۲٬۰۰۰٬۰۰۰ تومان", change: "+۱۲٪" },
  { label: "کاربران فعال", value: "۱۲٬۴۸۰", change: "+۵٪" },
  { label: "اجرای ابزار AI", value: "۳۴٬۲۰۰", change: "+۱۸٪" },
  { label: "لیدهای جدید", value: "۳۹۴", change: "+۹٪" },
] as const;

export const adminUsers = [
  { id: "u1", name: "علی رستمی", phone: "۰۹۱۱۳۱۰۴۰۹۷", plan: "پرو", status: "فعال", joined: "۱۴۰۳/۱۱/۰۲" },
  { id: "u2", name: "سارا محمدی", phone: "۰۹۱۲۴۴۵۶۷۸۹", plan: "مکس", status: "فعال", joined: "۱۴۰۳/۰۹/۱۵" },
  { id: "u3", name: "امیر حسینی", phone: "۰۹۱۳۵۵۶۶۷۷۸", plan: "پایه", status: "فعال", joined: "۱۴۰۴/۰۱/۲۰" },
  { id: "u4", name: "نگار کریمی", phone: "۰۹۳۵۶۶۷۷۸۸۹", plan: "رایگان", status: "غیرفعال", joined: "۱۴۰۴/۰۲/۱۱" },
  { id: "u5", name: "حسین رضایی", phone: "۰۹۱۹۲۲۳۳۴۴۵", plan: "پرو", status: "فعال", joined: "۱۴۰۴/۰۳/۰۸" },
] as const;

export const adminOrders = [
  { id: "ORD-3312", user: "علی رستمی", item: "پلن پرو - ماهانه", amount: "۹۹۰٬۰۰۰", status: "موفق", date: "۱۴۰۴/۰۴/۱۲" },
  { id: "ORD-3311", user: "سارا محمدی", item: "دوره فیلم‌سازی حرفه‌ای", amount: "۱٬۴۹۰٬۰۰۰", status: "موفق", date: "۱۴۰۴/۰۴/۱۱" },
  { id: "ORD-3309", user: "امیر حسینی", item: "بسته پرامپت تولید محتوا", amount: "۲۹۰٬۰۰۰", status: "در انتظار", date: "۱۴۰۴/۰۴/۱۱" },
  { id: "ORD-3305", user: "نگار کریمی", item: "پلن پایه - ماهانه", amount: "۴۹۰٬۰۰۰", status: "ناموفق", date: "۱۴۰۴/۰۴/۱۰" },
] as const;

export const adminCourses = [
  { id: "co1", title: "مسیر جامع تولید محتوا با هوش مصنوعی", price: "۱٬۹۸۰٬۰۰۰", students: 842, status: "منتشرشده" },
  { id: "co2", title: "فیلم‌سازی و تدوین حرفه‌ای برای اینستاگرام", price: "۱٬۴۹۰٬۰۰۰", students: 511, status: "منتشرشده" },
  { id: "co3", title: "قیف فروش و رشد ارگانیک اینستاگرام", price: "۹۹۰٬۰۰۰", students: 1204, status: "منتشرشده" },
  { id: "co4", title: "تدوین پیشرفته با Premiere Pro", price: "۱٬۲۹۰٬۰۰۰", students: 0, status: "پیش‌نویس" },
] as const;

export const adminAiTools = [
  { id: "t1", name: "بازسازی تصویر محصول", type: "تصویر", credits: 2, status: "فعال", runs: 12400 },
  { id: "t2", name: "تولید تیزر کوتاه از متن", type: "ویدیو", credits: 5, status: "فعال", runs: 6300 },
  { id: "t3", name: "افکت سینمایی پرتره", type: "تصویر", credits: 3, status: "فعال", runs: 9800 },
  { id: "t4", name: "تولید وویس‌اُور هوشمند", type: "صدا", credits: 4, status: "غیرفعال", runs: 0 },
] as const;

export const crmStages = [
  {
    key: "new",
    label: "جدید",
    leads: [
      { id: "l1", name: "محمد اکبری", source: "دایرکت", topic: "درخواست قیمت دوره" },
      { id: "l2", name: "زهرا نوری", source: "کامنت", topic: "سوال درباره ابزار AI" },
    ],
  },
  {
    key: "contacted",
    label: "تماس گرفته شد",
    leads: [{ id: "l3", name: "رضا قاسمی", source: "لینک بایو", topic: "علاقه‌مند به پلن مکس" }],
  },
  {
    key: "offered",
    label: "پیشنهاد ارسال شد",
    leads: [{ id: "l4", name: "مریم صادقی", source: "دایرکت", topic: "بسته پرامپت اختصاصی" }],
  },
  {
    key: "converted",
    label: "تبدیل شد",
    leads: [{ id: "l5", name: "امیر حسینی", source: "دایرکت", topic: "خرید پلن پرو" }],
  },
  {
    key: "lost",
    label: "لغو شد",
    leads: [{ id: "l6", name: "سینا مرادی", source: "کامنت", topic: "عدم پاسخگویی" }],
  },
];

export const adminBlogPosts = [
  { id: "b1", title: "۷ اصل طراحی محتوای ریلز که فروش را افزایش می‌دهد", status: "منتشرشده", views: 4210, date: "۱۴۰۴/۰۳/۱۰" },
  { id: "b2", title: "هوش مصنوعی در تولید محتوا؛ از کجا شروع کنیم؟", status: "منتشرشده", views: 3120, date: "۱۴۰۴/۰۲/۲۲" },
  { id: "b3", title: "طراحی قیف فروش برای لیدهای اینستاگرامی", status: "پیش‌نویس", views: 0, date: "—" },
] as const;

export const adminCoupons = [
  { id: "cp1", code: "WELCOME20", discount: "۲۰٪", usage: "۱۲۴/۵۰۰", status: "فعال", expiresAt: "۱۴۰۴/۰۵/۰۱" },
  { id: "cp2", code: "NOWRUZ1404", discount: "۳۰٪", usage: "۳۸۰/۴۰۰", status: "فعال", expiresAt: "۱۴۰۴/۰۱/۱۵" },
  { id: "cp3", code: "SUMMER15", discount: "۱۵٪", usage: "۰/۲۰۰", status: "غیرفعال", expiresAt: "۱۴۰۴/۰۶/۳۰" },
] as const;
