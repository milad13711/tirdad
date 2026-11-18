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

// Gated like /api/tools/[id]/download: a free-demo lesson's attachment is
// open to anyone, everything else requires a non-expired Enrollment in the
// lesson's course (or ADMIN). attachmentUrl is always an internal storage
// key ("tool-files/<uuid>.<ext>", same upload pipeline as ToolPackage
// files) — never served as a public URL anywhere else.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = await prisma.lesson.findUnique({ where: { id } });
  if (!lesson || !lesson.attachmentUrl) {
    return NextResponse.json({ error: "فایلی برای این درس یافت نشد" }, { status: 404 });
  }

  if (!lesson.isFreeDemo) {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "برای دانلود این فایل ابتدا وارد حساب کاربری شوید" }, { status: 401 });
    }
    if (session.role !== "ADMIN") {
      const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: session.sub, courseId: lesson.courseId } },
      });
      const expired = enrollment?.expiresAt && enrollment.expiresAt < new Date();
      if (!enrollment || expired) {
        return NextResponse.json({ error: "دسترسی شما به این پکیج معتبر نیست" }, { status: 403 });
      }
    }
  }

  if (!/^tool-files\/[a-zA-Z0-9-]+\.(zip|rar|7z|pdf)$/.test(lesson.attachmentUrl)) {
    return NextResponse.json({ error: "فایل روی سرور یافت نشد" }, { status: 404 });
  }
  const filePath = path.join(process.cwd(), "uploads", lesson.attachmentUrl);
  let fileSize: number;
  try {
    fileSize = (await stat(filePath)).size;
  } catch {
    return NextResponse.json({ error: "فایل روی سرور یافت نشد" }, { status: 404 });
  }

  const ext = lesson.attachmentUrl.split(".").pop() ?? "";
  const downloadName = lesson.attachmentName || `${lesson.title}.${ext}`;

  const nodeStream = createReadStream(filePath);
  return new NextResponse(Readable.toWeb(nodeStream) as ReadableStream, {
    headers: {
      "Content-Type": CONTENT_TYPES[ext] ?? "application/octet-stream",
      "Content-Length": String(fileSize),
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(downloadName)}`,
    },
  });
}
