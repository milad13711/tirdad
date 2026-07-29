import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { notifyAdmins } from "@/lib/telegram";
import { serviceRequestTypeLabel } from "@/lib/status-labels";

const bodySchema = z.object({
  type: z.enum(["TEASER", "IMAGE", "WEBSITE"]),
  description: z.string().min(10),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "ابتدا وارد حساب کاربری شوید" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "اطلاعات درخواست نامعتبر است" }, { status: 400 });
  }

  const serviceRequest = await prisma.serviceRequest.create({
    data: { userId: session.sub, type: parsed.data.type, description: parsed.data.description },
  });

  void notifyAdmins(
    `🎬 درخواست خدمات سفارشی جدید\nنوع: ${serviceRequestTypeLabel[serviceRequest.type]}`,
  );

  return NextResponse.json({ ok: true, serviceRequest });
}
