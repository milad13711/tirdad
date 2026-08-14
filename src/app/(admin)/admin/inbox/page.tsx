import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { InboxPanel } from "@/components/admin/inbox-panel";
import { getSession } from "@/lib/auth/session";
import { isStaffOrAdmin } from "@/lib/auth/roles";
import { prisma } from "@/lib/db";

export default async function AdminInboxPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isStaffOrAdmin(session)) redirect("/dashboard");

  const inboxMessages = await prisma.inboxMessage.findMany({
    where: { provider: { in: ["TELEGRAM", "BALE", "INSTAGRAM", "WHATSAPP"] } },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  return (
    <div>
      <PageHeader title="صندوق پیام" description="پیام‌های ورودی از تلگرام، بله، اینستاگرام و واتساپ" />
      <InboxPanel messages={inboxMessages} />
    </div>
  );
}
