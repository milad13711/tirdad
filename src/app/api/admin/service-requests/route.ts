import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";

const patchSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["NEW", "CONTACTED", "IN_PROGRESS", "DONE", "CLOSED"]),
});

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "درخواست نامعتبر است" }, { status: 400 });
  }

  const serviceRequest = await prisma.serviceRequest.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status },
  });

  return NextResponse.json({ ok: true, serviceRequest });
}
