import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { InboxPanel } from "@/components/admin/inbox-panel";

export default async function AdminInboxPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const messages = await prisma.inboxMessage.findMany({
    where: { provider: { in: ["TELEGRAM", "BALE"] } },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  return (
    <div>
      <PageHeader
        title="صندوق پیام"
        description="پیام‌های ورودی از پیام‌رسان‌های متصل، یکجا و با تاریخچه هر مخاطب"
      />
      <InboxPanel
        messages={messages.filter(
          (m): m is typeof m & { provider: "TELEGRAM" | "BALE" } =>
            m.provider === "TELEGRAM" || m.provider === "BALE",
        )}
      />
    </div>
  );
}
