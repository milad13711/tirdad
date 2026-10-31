import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { normalizePhone } from "@/lib/auth/otp";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { ACCESS_COOKIE, REFRESH_COOKIE, accessCookieOptions, refreshCookieOptions } from "@/lib/auth/cookies";
import { requestGatewayPayment } from "@/lib/payment/gateway";

const common = { couponCode: z.string().trim().min(1).optional(), guestPhone: z.string().trim().optional() };

const bodySchema = z.union([
  z.object({ itemType: z.literal("COURSE"), courseId: z.string().min(1), ...common }),
  z.object({ itemType: z.literal("SUBSCRIPTION"), planId: z.string().min(1), ...common }),
  z.object({ itemType: z.literal("PROMPT"), aiToolId: z.string().min(1), ...common }),
  z.object({ itemType: z.literal("TOOL_PACKAGE"), toolPackageId: z.string().min(1), ...common }),
]);

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

// Guest checkout: no login required up front — the buyer's phone is
// collected right before payment and used to find-or-create their account
// (same auto-create-on-first-contact pattern as OTP login), then they're
// logged in immediately so the post-payment redirect lands in their own
// dashboard instead of a dead end.
async function resolveBuyer(guestPhone: string | undefined) {
  const session = await getSession();
  if (session) {
    return { user: await prisma.user.findUniqueOrThrow({ where: { id: session.sub } }), newSession: null };
  }

  const phone = normalizePhone(guestPhone ?? "");
  if (!phone) return { error: "برای ثبت سفارش، شماره موبایل معتبر وارد کنید" as const };

  const user = await prisma.user.upsert({ where: { phone }, update: {}, create: { phone } });
  const payload = { sub: user.id, role: user.role };
  const [accessToken, refreshToken] = await Promise.all([signAccessToken(payload), signRefreshToken(payload)]);
  return { user, newSession: { accessToken, refreshToken } };
}

async function resolveCoupon(code: string | undefined) {
  if (!code) return { discountPercent: 0, coupon: null };
  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
  const valid =
    coupon &&
    coupon.active &&
    (!coupon.expiresAt || coupon.expiresAt > new Date()) &&
    (coupon.usageLimit == null || coupon.usedCount < coupon.usageLimit);
  if (!valid) return { error: "کد تخفیف نامعتبر یا منقضی‌شده است" as const };
  return { discountPercent: coupon.discountPercent, coupon };
}

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "درخواست پرداخت نامعتبر است" }, { status: 400 });
  }

  const buyer = await resolveBuyer(parsed.data.guestPhone);
  if ("error" in buyer) {
    return NextResponse.json({ error: buyer.error }, { status: 400 });
  }
  const { user, newSession } = buyer;

  const couponResult = await resolveCoupon(parsed.data.couponCode);
  if ("error" in couponResult) {
    return NextResponse.json({ error: couponResult.error }, { status: 400 });
  }
  const { discountPercent, coupon } = couponResult;

  let baseAmount: number;
  let itemLabel: string;
  let orderData: { courseId?: string; planId?: string; aiToolId?: string; toolPackageId?: string } = {};

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
    baseAmount = course.price;
    itemLabel = course.title;
    orderData = { courseId: parsed.data.courseId };
  } else if (parsed.data.itemType === "SUBSCRIPTION") {
    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: parsed.data.planId } });
    if (!plan) {
      return NextResponse.json({ error: "پلن اشتراک یافت نشد" }, { status: 404 });
    }
    baseAmount = plan.price;
    itemLabel = `اشتراک ${plan.name}`;
    orderData = { planId: parsed.data.planId };
  } else if (parsed.data.itemType === "PROMPT") {
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
    baseAmount = prompt.price;
    itemLabel = prompt.name;
    orderData = { aiToolId: parsed.data.aiToolId };
  } else {
    const toolPackage = await prisma.toolPackage.findUnique({ where: { id: parsed.data.toolPackageId } });
    if (!toolPackage || !toolPackage.published || toolPackage.price <= 0) {
      return NextResponse.json({ error: "پکیج مورد نظر یافت نشد" }, { status: 404 });
    }
    const alreadyOwned = await prisma.toolPackagePurchase.findUnique({
      where: { userId_toolPackageId: { userId: user.id, toolPackageId: toolPackage.id } },
    });
    if (alreadyOwned) {
      return NextResponse.json({ error: "شما قبلاً این پکیج را خریداری کرده‌اید" }, { status: 409 });
    }
    baseAmount = toolPackage.price;
    itemLabel = toolPackage.title;
    orderData = { toolPackageId: parsed.data.toolPackageId };
  }

  const amount = coupon ? Math.round(baseAmount * (1 - discountPercent / 100)) : baseAmount;

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
      couponId: coupon?.id,
      ...orderData,
    },
  });

  try {
    const { gateway, token, paymentUrl } = await requestGatewayPayment({
      amount,
      description: itemLabel,
      callbackUrl: `${appUrl()}/api/payments/callback?orderId=${order.id}`,
      mobile: user.phone,
    });

    await prisma.$transaction([
      prisma.transaction.create({ data: { orderId: order.id, gateway, refId: token, status: "PENDING" } }),
      ...(coupon ? [prisma.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } })] : []),
    ]);

    const response = NextResponse.json({ ok: true, paymentUrl });
    if (newSession) {
      response.cookies.set(ACCESS_COOKIE, newSession.accessToken, accessCookieOptions);
      response.cookies.set(REFRESH_COOKIE, newSession.refreshToken, refreshCookieOptions);
    }
    return response;
  } catch (err) {
    await prisma.order.update({ where: { id: order.id }, data: { status: "FAILED" } });
    const message = err instanceof Error ? err.message : "اتصال به درگاه پرداخت ناموفق بود";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
