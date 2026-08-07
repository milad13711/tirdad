import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

// Public tracked-link redirect used inside PUSH/SMS marketing messages —
// increments the campaign's clickCount then forwards to the real target.
// `to` must be a relative path (never an absolute URL) to avoid this
// becoming an open redirect.
export async function GET(request: Request, { params }: { params: Promise<{ campaignId: string }> }) {
  const { campaignId } = await params;
  const to = new URL(request.url).searchParams.get("to") ?? "/";
  const target = to.startsWith("/") ? to : "/";

  await prisma.marketingCampaign
    .update({ where: { id: campaignId }, data: { clickCount: { increment: 1 } } })
    .catch(() => {});

  return NextResponse.redirect(new URL(target, appUrl()));
}
