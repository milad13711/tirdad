# تیرداد — پلتفرم آموزش، هوش مصنوعی و رشد اینستاگرام

پلتفرم فارسی (RTL) برای فروش دوره‌های آموزشی، ابزارهای تولید محتوا با هوش مصنوعی،
بسته‌های پرامپت و CRM اینستاگرام. سبک بصری (پس‌زمینه تیره، اکسنت آبی، تایپوگرافی
جسورانه، انیمیشن‌های اسکرول) از سایت نمونه
[majidtirdad/majidtirdadsite](https://github.com/majidtirdad/majidtirdadsite) الهام
گرفته شده است.

## وضعیت فعلی

- **لندینگ پیج** (`/`): کامل، با محتوای نمونه.
- **احراز هویت واقعی** (`/login`): ورود با OTP پیامکی، JWT (access + refresh) در
  کوکی httpOnly، محافظت از مسیرها با Proxy (میان‌افزار Next.js) و RBAC برای پنل ادمین.
- **پنل کاربری** (`/dashboard/*`) و **پنل مدیریت** (`/admin/*`): متصل به دیتابیس
  واقعی PostgreSQL از طریق Prisma — بدون داده Mock.
- **فرم‌های CRUD ادمین**: دوره، بلاگ، کد تخفیف و CRM همگی افزودن + تغییر وضعیت
  (انتشار/فعال‌سازی/مرحله لید) واقعی دارند، مثل ابزارهای AI.
- **پرداخت واقعی**: خرید دوره از `/dashboard/courses/browse` و ارتقای اشتراک از
  `/dashboard/subscription` هر دو از درگاه زرین‌پال (REST v4) عبور می‌کنند —
  `src/lib/payment/zarinpal.ts` + `POST /api/payments/request` +
  `GET /api/payments/callback` (تایید پرداخت، ثبت Enrollment یا Subscription).
- **اعلان تلگرام**: پرداخت موفق، تیکت جدید و لید جدید به ادمین از طریق ربات
  تلگرام (`src/lib/telegram.ts`) ارسال می‌شود — در صورت نبود
  `TELEGRAM_BOT_TOKEN`/`TELEGRAM_ADMIN_CHAT_ID` بی‌صدا نادیده گرفته می‌شود.
- هنوز متصل نیست: ویرایش/حذف رکوردهای ادمین (فقط افزودن + تغییر وضعیت)، پخش
  ویدیوی دروس، لغو اشتراک.

## استک فنی

- Next.js 16 (App Router, Proxy/middleware)
- TailwindCSS v4 + shadcn/ui-style primitives روی Radix UI
- PostgreSQL + Prisma ORM 7 (`@prisma/adapter-pg`)
- JWT (کتابخانه `jose`) برای نشست کاربر، `bcryptjs` برای هش کد OTP
- `next-themes` برای حالت تاریک/روشن، `framer-motion` برای انیمیشن اسکرول
- فونت Vazirmatn برای پشتیبانی کامل فارسی/RTL

## راه‌اندازی محیط توسعه

### ۱. دیتابیس

با Docker (پیشنهادی):

```bash
docker compose up -d
```

یا اگر PostgreSQL روی سیستم خودتان نصب است، یک دیتابیس و کاربر مطابق
`.env.example` بسازید.

### ۲. متغیرهای محیطی

```bash
cp .env.example .env
```

مقادیر پیش‌فرض `.env.example` دقیقاً با `docker-compose.yml` هماهنگ است. اگر از
سرویس واقعی SMS (لیمو اس‌ام‌اس) استفاده می‌کنید، `SMS_PROVIDER=limo` را ست کرده و
`LIMO_API_KEY` / `LIMO_PATTERN_ID` را تکمیل کنید. شکل درخواست در
`src/lib/sms/limo.ts` (endpoint، هدر `ApiKey`، فیلدهای `OtpId`/`ReplaceToken`/
`MobileNumber`) با نمونه‌کدهای رسمی لیمو مطابقت دارد؛ فقط فرمت بدنهٔ پاسخ در
حالت موفق/ناموفق مستند نبود، پس فعلاً فقط بر اساس کد وضعیت HTTP تشخیص داده
می‌شود — قبل از پروداکشن در صورت نیاز طبق پنل خودتان بازبینی کنید.

برای پرداخت واقعی، `ZARINPAL_MERCHANT_ID` را از پنل زرین‌پال بگیرید و
`NEXT_PUBLIC_APP_URL` را به آدرس واقعی سایت (برای callback) ست کنید. برای تست
بدون حساب واقعی، `ZARINPAL_SANDBOX=true` بگذارید — در این حالت هر UUID دلخواه
به‌عنوان merchant id کار می‌کند. برای اعلان تلگرام، از @BotFather یک بات بسازید
و `TELEGRAM_BOT_TOKEN` را ست کنید؛ `TELEGRAM_ADMIN_CHAT_ID` را با پیام دادن به
بات و گرفتن chat id از @userinfobot (یا از گروه ادمین) پیدا کنید.

### ۳. نصب، مایگریشن و seed

```bash
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

کاربر نمونه ادمین: `09110000000` — کاربر نمونه عادی: `09113104097`. چون
`SMS_PROVIDER` پیش‌فرض `mock` است، کد OTP واقعی ارسال نمی‌شود و در کنسول سرور
چاپ می‌شود (`[sms:mock] OTP for ...`).

## بیلد پروداکشن

```bash
npm run build
npm run start
```
