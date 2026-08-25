import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createWriteStream } from "node:fs";
import { mkdir, unlink } from "node:fs/promises";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import path from "node:path";
import { getSession } from "@/lib/auth/session";

const MAX_BYTES = 3 * 1024 * 1024 * 1024; // 3GB, matches nginx client_max_body_size

const EXT_BY_TYPE: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/ogg": "ogv",
};

// Streams a course-lesson video straight to disk instead of buffering it in
// memory (unlike /api/admin/upload, which is fine for small images) —
// large uploads would otherwise risk OOMing this 3.8GB-RAM box. Takes the
// raw file body on PUT (not multipart) so the whole request can be piped
// through without a parsing step that would need to hold it in memory
// first. Sits behind nginx's /api/admin/upload-video location, which turns
// off proxy request buffering for the same reason.
export async function PUT(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const contentType = request.headers.get("content-type")?.split(";")[0].trim() ?? "";
  const ext = EXT_BY_TYPE[contentType];
  if (!ext) {
    return NextResponse.json(
      { error: "فرمت ویدیو پشتیبانی نمی‌شود؛ فقط MP4، WebM یا OGG مجاز است." },
      { status: 400 },
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BYTES) {
    return NextResponse.json(
      { error: "حجم ویدیو نباید بیشتر از ۳ گیگابایت باشد." },
      { status: 413 },
    );
  }
  if (!request.body) {
    return NextResponse.json({ error: "فایلی ارسال نشده است" }, { status: 400 });
  }

  const dir = path.join(process.cwd(), "uploads", "lesson-videos");
  const filename = `${randomUUID()}.${ext}`;
  const filePath = path.join(dir, filename);
  await mkdir(dir, { recursive: true });

  let written = 0;
  const nodeStream = Readable.fromWeb(
    // @ts-expect-error -- Node's Readable.fromWeb expects Node's ReadableStream type; the web Request.body is compatible at runtime.
    request.body,
  );
  const limiter = new Transform({
    transform(chunk: Buffer, _enc, callback) {
      written += chunk.length;
      if (written > MAX_BYTES) {
        callback(new Error("SIZE_LIMIT_EXCEEDED"));
        return;
      }
      callback(null, chunk);
    },
  });

  try {
    await pipeline(nodeStream, limiter, createWriteStream(filePath));
  } catch (err) {
    await unlink(filePath).catch(() => {});
    if (err instanceof Error && err.message === "SIZE_LIMIT_EXCEEDED") {
      return NextResponse.json(
        { error: "حجم ویدیو نباید بیشتر از ۳ گیگابایت باشد." },
        { status: 413 },
      );
    }
    console.error("video upload failed", err);
    return NextResponse.json({ error: "ذخیره ویدیو روی سرور ناموفق بود" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, url: `/api/uploads/lesson-videos/${filename}` });
}
