import { NextResponse } from "next/server";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import path from "node:path";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";

const CONTENT_TYPES: Record<string, string> = {
  zip: "application/zip",
  rar: "application/vnd.rar",
  "7z": "application/x-7z-compressed",
  pdf: "application/pdf",
};

// Gated download: free packages (price 0) are open to anyone, paid ones
// require the requester to own a ToolPackagePurchase (or be an admin).
// fileUrl on ToolPackage is either an internal storage key
// ("tool-files/<name>", streamed from disk below) or an admin-pasted
// external URL (Google Drive, Dropbox, etc. — redirected to). Either way
// this route is the only thing that resolves it, so a paid package can't
// be fetched by guessing a static path — the external-link case still
// gets the same purchase check before the redirect.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const toolPackage = await prisma.toolPackage.findUnique({ where: { id } });
  if (!toolPackage || !toolPackage.published || !toolPackage.fileUrl) {
    return NextResponse.json({ error: "فایلی برای این پکیج یافت نشد" }, { status: 404 });
  }

  if (toolPackage.price > 0) {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "برای دانلود این پکیج ابتدا وارد حساب کاربری شوید" }, { status: 401 });
    }
    if (session.role !== "ADMIN") {
      const owned = await prisma.toolPackagePurchase.findUnique({
        where: { userId_toolPackageId: { userId: session.sub, toolPackageId: toolPackage.id } },
      });
      if (!owned) {
        return NextResponse.json({ error: "برای دانلود این پکیج ابتدا آن را خریداری کنید" }, { status: 403 });
      }
    }
  }

  if (/^https?:\/\//.test(toolPackage.fileUrl)) {
    void prisma.toolPackage
      .update({ where: { id: toolPackage.id }, data: { downloadCount: { increment: 1 } } })
      .catch(() => {});
    return NextResponse.redirect(toolPackage.fileUrl);
  }

  // Defense in depth: an internal fileUrl is normally only ever set by
  // /api/admin/upload-tool-file's fixed "tool-files/<uuid>.<ext>" shape,
  // but this rejects anything else (e.g. a manually-typed path) before it
  // reaches the filesystem.
  if (!/^tool-files\/[a-zA-Z0-9-]+\.(zip|rar|7z|pdf)$/.test(toolPackage.fileUrl)) {
    return NextResponse.json({ error: "فایل روی سرور یافت نشد" }, { status: 404 });
  }
  const filePath = path.join(process.cwd(), "uploads", toolPackage.fileUrl);
  let fileSize: number;
  try {
    fileSize = (await stat(filePath)).size;
  } catch {
    return NextResponse.json({ error: "فایل روی سرور یافت نشد" }, { status: 404 });
  }

  const ext = toolPackage.fileUrl.split(".").pop() ?? "";
  const downloadName = `${toolPackage.title}.${ext}`;

  void prisma.toolPackage
    .update({ where: { id: toolPackage.id }, data: { downloadCount: { increment: 1 } } })
    .catch(() => {});

  const nodeStream = createReadStream(filePath);
  return new NextResponse(Readable.toWeb(nodeStream) as ReadableStream, {
    headers: {
      "Content-Type": CONTENT_TYPES[ext] ?? "application/octet-stream",
      "Content-Length": String(fileSize),
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(downloadName)}`,
    },
  });
}
