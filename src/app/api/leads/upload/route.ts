import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { isRateLimited } from "@/lib/auth/rate-limit";

const MAX_BYTES = 5 * 1024 * 1024;
const PASSTHROUGH_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function isHeic(file: File) {
  return file.type === "image/heic" || file.type === "image/heif" || /\.hei[cf]$/i.test(file.name);
}

// Public, unauthenticated: lets an anonymous visitor attach a screenshot of
// their Instagram bio to the page-analysis request form. Tightly
// rate-limited by IP and capped smaller than the admin upload endpoint —
// this is a single fixed-purpose upload, not general-purpose file storage.
export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(`leads-upload:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: "درخواست‌های زیاد، کمی صبر کنید" }, { status: 429 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "فایلی ارسال نشده است" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "حجم تصویر باید کمتر از ۵ مگابایت باشد" }, { status: 400 });
  }

  let ext = PASSTHROUGH_TYPES[file.type];
  let bytes = Buffer.from(await file.arrayBuffer());

  if (!ext) {
    if (!isHeic(file)) {
      return NextResponse.json(
        { error: `فرمت «${file.type || file.name}» پشتیبانی نمی‌شود؛ فقط JPG، PNG، WEBP یا عکس HEIC آیفون مجاز است.` },
        { status: 400 },
      );
    }
    try {
      const convert = (await import("heic-convert")).default;
      bytes = Buffer.from(await convert({ buffer: bytes, format: "JPEG", quality: 0.9 }));
      ext = "jpg";
    } catch {
      return NextResponse.json(
        { error: "پردازش این عکس HEIC ناموفق بود؛ لطفاً آن را به JPG تبدیل کرده و دوباره تلاش کنید." },
        { status: 400 },
      );
    }
  }

  const dir = path.join(process.cwd(), "uploads", "leads");
  const filename = `${randomUUID()}.${ext}`;

  try {
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), bytes);
  } catch (err) {
    console.error("lead screenshot upload failed", err);
    return NextResponse.json({ error: "ذخیره فایل روی سرور ناموفق بود" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, url: `/api/uploads/leads/${filename}` });
}
