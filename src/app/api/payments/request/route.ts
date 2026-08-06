import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { requestPayment } from "@/lib/payment/zarinpal";

const bodySchema = z.union([
  z.object({ itemType: z.literal("COURSE"), courseId: z.string().min(1) }),
  z.object({ itemType: z.literal("SUBSCRIPTION"), planId: z.string().min(1) }),
  z.object({ itemType: z.literal("PROMPT"), aiToolId: z.string().min(1) }),
]);

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "ابتدا وارد حساب کاربری شوید" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "درخواست پرداخت نامعتبر است" }, { status: 400 });
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.sub } });

  let amount: number;
  let itemLabel: string;
  let orderData: { courseId?: string; planId?: string; aiToolId?: string } = {};

  if (parsed.data.itemType === "COURSE") {
    const course = await prisma.course.findUnique({ where: { id: parsed.data.courseId } });
    if (!course || !course.published) {
      return NextResponse.json({ error: "دوره مورد نظر یافت نشد" }, { status: 404 });
    }
    const alreadyEnrolled = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId: course.id } },
    });
    if (alreadyEnrolled) {
      return NextResponse.json({ error: "شما قبلاً این دوره را خریداری کرده‌اید" }, { status: 409 });
    }
    amount = course.price;
    itemLabel = course.title;
    orderData = { courseId: parsed.data.courseId };
  } else if (parsed.data.itemType === "SUBSCRIPTION") {
    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: parsed.data.planId } });
    if (!plan) {
      return NextResponse.json({ error: "پلن اشتراک یافت نشد" }, { status: 404 });
    }
    amount = plan.price;
    itemLabel = `اشتراک ${plan.name}`;
    orderData = { planId: parsed.data.planId };
  } else {
    const prompt = await prisma.aiTool.findUnique({ where: { id: parsed.data.aiToolId } });
    if (!prompt || !prompt.active || prompt.price <= 0) {
      return NextResponse.json({ error: "پرامپت مورد نظر یافت نشد" }, { status: 404 });
    }
    const alreadyOwned = await prisma.promptPurchase.findUnique({
      where: { userId_aiToolId: { userId: user.id, aiToolId: prompt.id } },
    });
    if (alreadyOwned) {
      return NextResponse.json({ error: "شما قبلاً این پرامپت را خریداری کرده‌اید" }, { status: 409 });
    }
    amount = prompt.price;
    itemLabel = prompt.name;
    orderData = { aiToolId: parsed.data.aiToolId };
  }

  if (amount < 1000) {
    return NextResponse.json({ error: "مبلغ قابل پرداخت نیست" }, { status: 400 });
  }

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      itemType: parsed.data.itemType,
      itemLabel,
      amount,
      status: "PENDING",
      ...orderData,
    },
  });

  try {
    const { authority, paymentUrl } = await requestPayment({
      amount,
      description: itemLabel,
      callbackUrl: `${appUrl()}/api/payments/callback?orderId=${order.id}`,
      mobile: user.phone,
    });

    await prisma.transaction.create({
      data: { orderId: order.id, gateway: "zarinpal", refId: authority, status: "PENDING" },
    });

    return NextResponse.json({ ok: true, paymentUrl });
  } catch (err) {
    await prisma.order.update({ where: { id: order.id }, data: { status: "FAILED" } });
    const message = err instanceof Error ? err.message : "اتصال به درگاه پرداخت ناموفق بود";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
