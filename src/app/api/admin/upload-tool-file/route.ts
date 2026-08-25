import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createWriteStream } from "node:fs";
import { mkdir, unlink } from "node:fs/promises";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import path from "node:path";
import { getSession } from "@/lib/auth/session";

const MAX_BYTES = 3 * 1024 * 1024 * 1024; // 3GB, matches nginx client_max_body_size
const ALLOWED_EXTENSIONS = new Set(["zip", "rar", "7z", "pdf"]);

// Streams a downloadable tool-package asset (font pack, CapCut effect
// preset, etc., usually zipped) straight to disk — same reasoning as
// /api/admin/upload-video: these can be large, and buffering the whole
// thing in memory risks OOMing this box. Takes the raw file body on PUT
// (not multipart), with the original filename passed as a query param
// since content-type sniffing for zip/rar is unreliable across browsers.
export async function PUT(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const url = new URL(request.url);
  const originalName = url.searchParams.get("filename") ?? "";
  const ext = originalName.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return NextResponse.json(
      { error: "فرمت فایل پشتیبانی نمی‌شود؛ فقط ZIP، RAR، 7Z یا PDF مجاز است." },
      { status: 400 },
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BYTES) {
    return NextResponse.json({ error: "حجم فایل نباید بیشتر از ۳ گیگابایت باشد." }, { status: 413 });
  }
  if (!request.body) {
    return NextResponse.json({ error: "فایلی ارسال نشده است" }, { status: 400 });
  }

  const dir = path.join(process.cwd(), "uploads", "tool-files");
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
      return NextResponse.json({ error: "حجم فایل نباید بیشتر از ۳ گیگابایت باشد." }, { status: 413 });
    }
    console.error("tool-file upload failed", err);
    return NextResponse.json({ error: "ذخیره فایل روی سرور ناموفق بود" }, { status: 500 });
  }

  // Deliberately not a public /api/uploads/... URL: paid packages must be
  // gated behind a purchase check, so this key is only ever resolved by
  // /api/tools/[id]/download, never served as a static file directly.
  return NextResponse.json({ ok: true, fileKey: `tool-files/${filename}`, originalName });
}
