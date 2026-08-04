import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getSession } from "@/lib/auth/session";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
const ALLOWED_FOLDERS = new Set(["blog", "prompts"]);

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

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json({ error: "فرمت تصویر مجاز نیست (jpg/png/webp/gif)" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "حجم تصویر باید کمتر از ۵ مگابایت باشد" }, { status: 400 });
  }

  const dir = path.join(process.cwd(), "uploads", folder);
  await mkdir(dir, { recursive: true });

  const filename = `${randomUUID()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), bytes);

  return NextResponse.json({ ok: true, url: `/api/uploads/${folder}/${filename}` });
}
