import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { validateVpnConfig } from "@/lib/vpn";

const saveSchema = z.object({
  configUrl: z.string().trim().min(10, "کانفیگ نامعتبر است"),
});

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return null;
  return session;
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const parsed = saveSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "اطلاعات نامعتبر است" }, { status: 400 });
  }

  const validation = validateVpnConfig(parsed.data.configUrl);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const config = await prisma.vpnConfig.upsert({
    where: { id: 1 },
    update: { configUrl: parsed.data.configUrl.trim(), enabled: true },
    create: { id: 1, configUrl: parsed.data.configUrl.trim(), enabled: true },
  });

  return NextResponse.json({ ok: true, protocol: validation.protocol, config: { ...config, configUrl: undefined } });
}

export async function DELETE() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  await prisma.vpnConfig.upsert({
    where: { id: 1 },
    update: { configUrl: null, enabled: false },
    create: { id: 1, enabled: false },
  });

  return NextResponse.json({ ok: true });
}
