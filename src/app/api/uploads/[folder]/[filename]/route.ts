import { NextResponse } from "next/server";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import path from "node:path";

const IMAGE_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};
const VIDEO_TYPES: Record<string, string> = {
  mp4: "video/mp4",
  webm: "video/webm",
  ogv: "video/ogg",
};
const CONTENT_TYPES: Record<string, string> = { ...IMAGE_TYPES, ...VIDEO_TYPES };
const ALLOWED_FOLDERS = new Set(["blog", "prompts", "courses", "branding", "leads", "lesson-videos", "tools"]);

// Serves admin-uploaded files from disk on every request instead of
// through Next's public/ static handler. `next start` snapshots public/'s
// directory listing at boot, so a file written by /api/admin/upload(-video)
// while the server is already running (i.e. always, in production under
// PM2) would 404 until the next restart if served the normal way.
//
// Videos are streamed from disk chunk-by-chunk rather than read fully into
// memory, and Range requests are honored (206 Partial Content) — without
// that, the <video> element can't seek/scrub and browsers may refuse to
// play large files at all.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ folder: string; filename: string }> },
) {
  const { folder, filename } = await params;

  if (!ALLOWED_FOLDERS.has(folder)) {
    return NextResponse.json({ error: "نامعتبر" }, { status: 400 });
  }
  // No path separators allowed — this is a flat lookup by generated name only.
  if (!/^[a-zA-Z0-9-]+\.(jpg|jpeg|png|webp|gif|mp4|webm|ogv)$/.test(filename)) {
    return NextResponse.json({ error: "نامعتبر" }, { status: 400 });
  }

  const ext = filename.split(".").pop() ?? "";
  const contentType = CONTENT_TYPES[ext] ?? "application/octet-stream";
  const filePath = path.join(process.cwd(), "uploads", folder, filename);

  let fileSize: number;
  try {
    fileSize = (await stat(filePath)).size;
  } catch {
    return NextResponse.json({ error: "یافت نشد" }, { status: 404 });
  }

  const isVideo = ext in VIDEO_TYPES;
  const cacheControl = isVideo
    ? "public, max-age=31536000, immutable, no-transform"
    : "public, max-age=31536000, immutable";

  const range = request.headers.get("range");
  if (isVideo && range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match) {
      return new NextResponse(null, { status: 416, headers: { "Content-Range": `bytes */${fileSize}` } });
    }
    const start = match[1] ? Number(match[1]) : 0;
    const end = match[2] ? Number(match[2]) : fileSize - 1;
    if (Number.isNaN(start) || Number.isNaN(end) || start > end || end >= fileSize) {
      return new NextResponse(null, { status: 416, headers: { "Content-Range": `bytes */${fileSize}` } });
    }

    const nodeStream = createReadStream(filePath, { start, end });
    return new NextResponse(Readable.toWeb(nodeStream) as ReadableStream, {
      status: 206,
      headers: {
        "Content-Type": contentType,
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": String(end - start + 1),
        "Cache-Control": cacheControl,
      },
    });
  }

  const nodeStream = createReadStream(filePath);
  return new NextResponse(Readable.toWeb(nodeStream) as ReadableStream, {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(fileSize),
      "Accept-Ranges": "bytes",
      "Cache-Control": cacheControl,
    },
  });
}
