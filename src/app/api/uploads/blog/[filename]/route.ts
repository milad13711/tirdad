import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

// Serves admin-uploaded blog images from disk on every request instead of
// through Next's public/ static handler. `next start` snapshots public/'s
// directory listing at boot, so a file written by /api/admin/upload while
// the server is already running (i.e. always, in production under PM2)
// would 404 until the next restart if served the normal way.
export async function GET(_request: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;

  // No path separators allowed — this is a flat lookup by generated name only.
  if (!/^[a-zA-Z0-9-]+\.(jpg|jpeg|png|webp|gif)$/.test(filename)) {
    return NextResponse.json({ error: "نامعتبر" }, { status: 400 });
  }

  const ext = filename.split(".").pop() ?? "";
  const filePath = path.join(process.cwd(), "uploads", "blog", filename);

  try {
    const bytes = await readFile(filePath);
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": CONTENT_TYPES[ext] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "یافت نشد" }, { status: 404 });
  }
}
