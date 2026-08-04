import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getSession } from "@/lib/auth/session";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_FOLDERS = new Set(["blog", "prompts", "courses", "teasers"]);

// Formats every browser can already render directly — stored as-is.
const PASSTHROUGH_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function isHeic(file: File) {
  return (
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    /\.hei[cf]$/i.test(file.name)
  );
}

// SVG is deliberately excluded even though browsers render it: it can carry
// <script>/event-handler payloads, so accepting arbitrary admin-uploaded SVG
// is a stored-XSS risk not worth the convenience.
const REJECTED_TYPES = new Set(["image/svg+xml"]);

// Admin-only image upload — used by the blog editor's cover-image field and
// the prompt gallery editor's before/after images. Files land on local
// disk under uploads/<folder> (outside public/ — Next's production server
// snapshots public/'s listing at boot, so a file written there after
// startup 404s until the next restart; served instead via
// /api/uploads/[folder]/[filename], which reads from disk on every
// request). deploy.yml carries uploads/ across redeploys since it isn't
// tracked in git.
export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  const folderInput = formData?.get("folder");
  const folder = typeof folderInput === "string" && ALLOWED_FOLDERS.has(folderInput)
    ? folderInput
    : "blog";

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "فایلی ارسال نشده است" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "حجم تصویر باید کمتر از ۸ مگابایت باشد" }, { status: 400 });
  }
  if (REJECTED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "فایل‌های SVG به‌دلیل ریسک امنیتی پذیرفته نمی‌شوند؛ لطفاً JPG یا PNG آپلود کنید." },
      { status: 400 },
    );
  }

  let ext = PASSTHROUGH_TYPES[file.type];
  let bytes = Buffer.from(await file.arrayBuffer());

  if (!ext) {
    try {
      if (isHeic(file)) {
        // heic-convert is a pure-JS/WASM HEVC decoder — sharp's bundled
        // libheif can't decode real iPhone photos (HEVC decode support is
        // left out of prebuilt libheif binaries for licensing reasons),
        // so this is the one that actually works for the common case.
        const convert = (await import("heic-convert")).default;
        bytes = Buffer.from(await convert({ buffer: bytes, format: "JPEG", quality: 0.9 }));
      } else {
        // Anything else a browser can't natively render (bmp, tiff, avif,
        // ...) — let sharp transcode it to a plain JPEG.
        const sharp = (await import("sharp")).default;
        bytes = await sharp(bytes).jpeg({ quality: 90 }).toBuffer();
      }
      ext = "jpg";
    } catch {
      return NextResponse.json(
        { error: `فرمت «${file.type || file.name}» قابل پردازش نیست؛ لطفاً JPG، PNG، WEBP یا GIF آپلود کنید.` },
        { status: 400 },
      );
    }
  }

  const dir = path.join(process.cwd(), "uploads", folder);
  await mkdir(dir, { recursive: true });

  const filename = `${randomUUID()}.${ext}`;
  await writeFile(path.join(dir, filename), bytes);

  return NextResponse.json({ ok: true, url: `/api/uploads/${folder}/${filename}` });
}
