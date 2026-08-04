import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";

interface GraphConversation {
  id: string;
  participants?: { data?: { username?: string; id: string }[] };
}

interface GraphConversationsResponse {
  data?: GraphConversation[];
  error?: { message: string };
}

// Best-effort pull of recent Instagram DM conversations into the CRM as
// leads. This calls the real Meta Graph API, but a working call also
// requires: a Meta app with instagram_manage_messages approved, the
// business account connected through Facebook Login for Business, and a
// long-lived page-scoped token — none of which this repo can provision.
// Failures are stored on the connection row instead of thrown, so the admin
// UI can show *why* a sync didn't return anything.
export async function POST() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
  }

  const connection = await prisma.instagramConnection.findUnique({ where: { id: 1 } });
  if (!connection?.accessToken || !connection.businessAccountId) {
    return NextResponse.json({ error: "ابتدا اکانت اینستاگرام را متصل کنید" }, { status: 400 });
  }

  try {
    const url = new URL(
      `https://graph.facebook.com/v21.0/${connection.businessAccountId}/conversations`,
    );
    url.searchParams.set("platform", "instagram");
    url.searchParams.set("fields", "participants");
    url.searchParams.set("access_token", connection.accessToken);

    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    const body: GraphConversationsResponse = await res.json();

    if (!res.ok || body.error) {
      throw new Error(body.error?.message ?? `Graph API خطای ${res.status} برگرداند`);
    }

    const conversations = body.data ?? [];
    let created = 0;
    for (const conversation of conversations) {
      const participant = conversation.participants?.data?.[0];
      if (!participant?.username) continue;

      const exists = await prisma.lead.findFirst({
        where: { name: participant.username, source: "DIRECT" },
      });
      if (exists) continue;

      await prisma.lead.create({
        data: { name: participant.username, source: "DIRECT", topic: "دایرکت اینستاگرام" },
      });
      created++;
    }

    await prisma.instagramConnection.update({
      where: { id: 1 },
      data: { lastSyncAt: new Date(), lastSyncError: null },
    });

    return NextResponse.json({ ok: true, created, total: conversations.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "خطای ناشناخته در همگام‌سازی";
    await prisma.instagramConnection.update({
      where: { id: 1 },
      data: { lastSyncAt: new Date(), lastSyncError: message },
    });
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
