import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseProductKey } from "@/lib/product-key";
import { CAMPAIGN_COOKIE } from "@/lib/campaign-cookie";

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

// A trackable share link for one product, e.g. for an Instagram story ad.
// Increments the link's click counter, tags this visit with a cookie (read
// server-side by the product page to attribute page views/purchases back
// to this campaign), and redirects straight to the real product page —
// also passing ?ref= so client-side tracking can pick it up immediately,
// before the cookie round-trips.
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const link = await prisma.campaignLink.findUnique({ where: { slug } });
  if (!link) {
    return NextResponse.redirect(new URL("/", appUrl()));
  }

  const parsed = parseProductKey(link.productKey);
  let target = "/";
  if (parsed?.type === "COURSE") {
    const course = await prisma.course.findUnique({ where: { id: parsed.id }, select: { slug: true } });
    if (course) target = `/courses/${course.slug}`;
  } else if (parsed?.type === "TOOL_PACKAGE") {
    const toolPackage = await prisma.toolPackage.findUnique({ where: { id: parsed.id }, select: { slug: true } });
    if (toolPackage) target = `/tools/${toolPackage.slug}`;
  }

  void prisma.campaignLink.update({ where: { id: link.id }, data: { clickCount: { increment: 1 } } }).catch(() => {});

  const url = new URL(target, appUrl());
  url.searchParams.set("ref", slug);
  const response = NextResponse.redirect(url);
  response.cookies.set(CAMPAIGN_COOKIE, slug, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
