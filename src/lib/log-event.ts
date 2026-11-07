import "server-only";
import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

function clientIp(request?: Request): string | null {
  if (!request) return null;
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

// Fire-and-forget on purpose: a logging failure must never break the
// caller's actual request (auth, payment, etc.) — errors are swallowed
// and reported to the console instead of thrown.
export async function logEvent(params: {
  action: string;
  success?: boolean;
  userId?: string | null;
  phone?: string | null;
  message?: string | null;
  meta?: Record<string, unknown>;
  request?: Request;
}): Promise<void> {
  try {
    await prisma.eventLog.create({
      data: {
        action: params.action,
        success: params.success ?? true,
        userId: params.userId ?? undefined,
        phone: params.phone ?? undefined,
        message: params.message ?? undefined,
        meta: params.meta as Prisma.InputJsonValue | undefined,
        ip: clientIp(params.request),
      },
    });
  } catch (err) {
    console.error("[log-event] failed to persist event log:", err);
  }
}
