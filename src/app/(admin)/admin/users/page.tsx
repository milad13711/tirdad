import { redirect } from "next/navigation";
import { PageHeader } from "@/components/dashboard/page-header";
import { SystemUsersPanel } from "@/components/admin/system-users-panel";
import { getSession } from "@/lib/auth/session";
import { isFullAdmin } from "@/lib/auth/roles";
import { getSystemUsers } from "@/lib/queries/admin";

export default async function AdminSystemUsersPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isFullAdmin(session)) redirect("/admin/inbox");

  const users = await getSystemUsers();

  return (
    <div>
      <PageHeader title="کاربران سیستمی" description="مدیران و پشتیبان‌های پنل — جدا از مشتریان" />
      <SystemUsersPanel
        users={users.map((u) => ({
          id: u.id,
          phone: u.phone,
          name: u.name,
          role: u.role as "ADMIN" | "STAFF",
          hasPassword: Boolean(u.passwordHash),
        }))}
        currentUserId={session.sub}
      />
    </div>
  );
}
