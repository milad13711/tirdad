import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { broadcastPush } from "@/lib/push";

const bodySchema = z.object({
  title: z.string().min(1).max(80),
  body: z.string().min(1).max(200),
  url: z.string().max(300).optional(),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "اطلاعات نامعتبر است" }, { status: 400 });
  }

  try {
    const result = await broadcastPush(parsed.data);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "ارسال اعلان ناموفق بود" },
      { status: 500 },
    );
  }
}
