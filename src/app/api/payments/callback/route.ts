import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPayment } from "@/lib/payment/zarinpal";
import { notifyAdmins } from "@/lib/telegram";
import { formatToman } from "@/lib/format";

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

function resultRedirect(ok: boolean, message: string) {
  const url = new URL("/payment/result", appUrl());
  url.searchParams.set("ok", ok ? "1" : "0");
  url.searchParams.set("message", message);
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get("orderId");
  const authority = url.searchParams.get("Authority");
  const status = url.searchParams.get("Status");

  if (!orderId) {
    return resultRedirect(false, "شماره سفارش نامعتبر است");
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return resultRedirect(false, "سفارش یافت نشد");
  }
  if (order.status === "PAID") {
    return resultRedirect(true, "این سفارش قبلاً پرداخت شده است");
  }

  if (status !== "OK" || !authority) {
    await prisma.$transaction([
      prisma.order.update({ where: { id: order.id }, data: { status: "FAILED" } }),
      prisma.transaction.updateMany({
        where: { orderId: order.id },
        data: { status: "FAILED" },
      }),
    ]);
    return resultRedirect(false, "پرداخت توسط شما لغو شد");
  }

  const verification = await verifyPayment({ amount: order.amount, authority }).catch(
    () => ({ success: false as const }),
  );

  if (!verification.success) {
    await prisma.$transaction([
      prisma.order.update({ where: { id: order.id }, data: { status: "FAILED" } }),
      prisma.transaction.updateMany({
        where: { orderId: order.id },
        data: { status: "FAILED" },
      }),
    ]);
    return resultRedirect(false, "تایید پرداخت ناموفق بود");
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id: order.id }, data: { status: "PAID" } });
    await tx.transaction.updateMany({
      where: { orderId: order.id },
      data: { status: "PAID", refId: verification.refId, paidAt: new Date() },
    });

    if (order.itemType === "COURSE" && order.courseId) {
      await tx.enrollment.upsert({
        where: { userId_courseId: { userId: order.userId, courseId: order.courseId } },
        create: { userId: order.userId, courseId: order.courseId },
        update: {},
      });
    }

    if (order.itemType === "SUBSCRIPTION" && order.planId) {
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1);
      await tx.subscription.create({
        data: {
          userId: order.userId,
          planId: order.planId,
          status: "ACTIVE",
          currentPeriodEnd: periodEnd,
        },
      });
    }
  });

  void notifyAdmins(
    `💳 پرداخت موفق\n${order.itemLabel}\nمبلغ: ${formatToman(order.amount)} تومان\nشماره سفارش: ${order.id}`,
  );

  return resultRedirect(true, "پرداخت با موفقیت انجام شد");
}
