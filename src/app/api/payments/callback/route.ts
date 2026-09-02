import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { Order } from "@/generated/prisma/client";
import { verifyGatewayCallback, type GatewayName } from "@/lib/payment/gateway";
import { notifyAdmins } from "@/lib/telegram";
import { dispatchSmsTrigger } from "@/lib/sms/dispatch";
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

// Prompt purchases return to the gallery with the just-bought prompt
// highlighted and auto-revealed, instead of the generic result page — the
// user asked to land back on "همون صفحه و پرامپت", with its usage
// instructions visible.
function successRedirect(order: Order, message: string) {
  if (order.itemType === "PROMPT" && order.aiToolId) {
    const url = new URL("/prompts", appUrl());
    url.searchParams.set("purchased", order.aiToolId);
    return NextResponse.redirect(url);
  }
  return resultRedirect(true, message);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get("orderId");

  if (!orderId) {
    return resultRedirect(false, "شماره سفارش نامعتبر است");
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true, transactions: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!order) {
    return resultRedirect(false, "سفارش یافت نشد");
  }
  if (order.status === "PAID") {
    return successRedirect(order, "این سفارش قبلاً پرداخت شده است");
  }

  const transaction = order.transactions[0];
  const gateway: GatewayName = transaction?.gateway === "bitpay" ? "bitpay" : "zarinpal";
  const storedToken = transaction?.refId ?? null;

  const verification = await verifyGatewayCallback(gateway, order.amount, url.searchParams, storedToken).catch(
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
    return resultRedirect(false, "پرداخت ناموفق بود یا توسط شما لغو شد");
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id: order.id }, data: { status: "PAID" } });
    await tx.transaction.updateMany({
      where: { orderId: order.id },
      data: { status: "PAID", refId: verification.refId, paidAt: new Date() },
    });

    if (order.itemType === "COURSE" && order.courseId) {
      const course = await tx.course.findUnique({
        where: { id: order.courseId },
        select: { accessDurationDays: true },
      });
      const expiresAt = course?.accessDurationDays
        ? new Date(Date.now() + course.accessDurationDays * 24 * 60 * 60 * 1000)
        : null;
      await tx.enrollment.upsert({
        where: { userId_courseId: { userId: order.userId, courseId: order.courseId } },
        create: { userId: order.userId, courseId: order.courseId, expiresAt },
        update: { expiresAt },
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

    if (order.itemType === "PROMPT" && order.aiToolId) {
      await tx.promptPurchase.upsert({
        where: { userId_aiToolId: { userId: order.userId, aiToolId: order.aiToolId } },
        create: { userId: order.userId, aiToolId: order.aiToolId },
        update: {},
      });
    }

    if (order.itemType === "TOOL_PACKAGE" && order.toolPackageId) {
      await tx.toolPackagePurchase.upsert({
        where: { userId_toolPackageId: { userId: order.userId, toolPackageId: order.toolPackageId } },
        create: { userId: order.userId, toolPackageId: order.toolPackageId },
        update: {},
      });
    }
  });

  void notifyAdmins(
    `💳 پرداخت موفق\n${order.itemLabel}\nمبلغ: ${formatToman(order.amount)} تومان\nشماره سفارش: ${order.id}`,
  );

  void dispatchSmsTrigger("ORDER_PAID", order.user.phone, {
    name: order.user.name ?? "",
    itemLabel: order.itemLabel,
    amount: formatToman(order.amount),
  });

  return successRedirect(order, "پرداخت با موفقیت انجام شد");
}
