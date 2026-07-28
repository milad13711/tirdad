import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";

const FREE_DAILY_LIMIT = 3;

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "ابتدا وارد حساب کاربری شوید" }, { status: 401 });
  }

  const { id } = await params;
  const aiTool = await prisma.aiTool.findUnique({ where: { id } });
  if (!aiTool || !aiTool.active) {
    return NextResponse.json({ error: "این ابزار در دسترس نیست" }, { status: 404 });
  }

  const subscription = await prisma.subscription.findFirst({
    where: { userId: session.sub, status: "ACTIVE" },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });

  const dailyLimit = subscription?.plan.dailyRunLimit ?? FREE_DAILY_LIMIT;
  const monthlyLimit = subscription?.plan.monthlyRunLimit ?? null;

  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [dailyCount, monthlyCount] = await Promise.all([
    dailyLimit != null
      ? prisma.aiGeneration.count({
          where: { userId: session.sub, createdAt: { gte: dayStart } },
        })
      : Promise.resolve(0),
    monthlyLimit != null
      ? prisma.aiGeneration.count({
          where: { userId: session.sub, createdAt: { gte: monthStart } },
        })
      : Promise.resolve(0),
  ]);

  if (dailyLimit != null && dailyCount >= dailyLimit) {
    return NextResponse.json(
      { error: "محدودیت اجرای روزانه شما به پایان رسیده است" },
      { status: 429 },
    );
  }
  if (monthlyLimit != null && monthlyCount >= monthlyLimit) {
    return NextResponse.json(
      { error: "محدودیت اجرای ماهانه شما به پایان رسیده است" },
      { status: 429 },
    );
  }

  // NOTE: no real AI provider is wired yet, so the generation is recorded as
  // completed immediately. Swap this for an async job (queue + webhook) once
  // an actual image/video generation API is connected — aiTool.hiddenPrompt
  // is exactly what would be sent to that API and must never reach the client.
  const generation = await prisma.aiGeneration.create({
    data: {
      userId: session.sub,
      aiToolId: aiTool.id,
      status: "COMPLETED",
      creditsUsed: aiTool.creditCost,
    },
  });

  return NextResponse.json({ ok: true, generation });
}
