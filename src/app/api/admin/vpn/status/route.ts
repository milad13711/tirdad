import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getProxyStatus } from "@/lib/proxy/xray-manager";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  return NextResponse.json(getProxyStatus());
}
