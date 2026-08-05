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
    if (!isHeic(file)) {
      return NextResponse.json(
        {
          error: `فرمت «${file.type || file.name}» پشتیبانی نمی‌شود؛ فقط JPG، PNG، WEBP، GIF یا عکس HEIC آیفون مجاز است.`,
        },
        { status: 400 },
      );
    }
    try {
      // heic-convert is a pure-JS/WASM HEVC decoder with no native binary
      // to fetch at install time — deliberately not using sharp here: its
      // ~20 platform-specific optional packages are a much heavier,
      // network-dependent install, and this production server's outbound
      // network has already proven flaky (see the git-clone-over-tarball
      // workaround in deploy.yml). `npm install` can report success even
      // when one of those optional downloads silently failed, leaving
      // sharp broken at runtime — exactly the kind of failure that's hard
      // to diagnose without direct server access.
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

  const dir = path.join(process.cwd(), "uploads", folder);
  const filename = `${randomUUID()}.${ext}`;

  try {
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), bytes);
  } catch (err) {
    // An unhandled throw here means Next returns its generic HTML error
    // page instead of JSON, which the client-side fetch then fails to
    // parse ("Unexpected token '<'") — surfacing no useful message. Catch
    // it so a disk/permission problem on the server is at least reported
    // back as a readable error instead of a cryptic parse failure.
    console.error(`upload failed for folder "${folder}"`, err);
    return NextResponse.json({ error: "ذخیره فایل روی سرور ناموفق بود" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, url: `/api/uploads/${folder}/${filename}` });
}
