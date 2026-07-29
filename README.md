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
- هنوز متصل نیست: درگاه پرداخت واقعی (زرین‌پال و مشابه)، ربات تلگرام، و اکثر
  فرم‌های CRUD ادمین (دوره، بلاگ، کد تخفیف، CRM) که فعلاً فقط خواندنی هستند —
  به‌جز ابزارهای AI که کامل (خواندن + افزودن) وصل شده‌اند.

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
