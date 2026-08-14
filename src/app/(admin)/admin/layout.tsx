import { redirect } from "next/navigation";
import {
  BarChart3,
  Contact,
  LayoutDashboard,
  Library,
  Megaphone,
  MessageSquareText,
  Search,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Users,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import type { NavItem } from "@/components/dashboard/sidebar";
import { getSession } from "@/lib/auth/session";
import { isFullAdmin } from "@/lib/auth/roles";

// STAFF ("پشتیبان") only gets the fast-follow-up sections; everything else
// is ADMIN-only ("مدیر کل") — see src/lib/auth/roles.ts for the boundary
// definition shared with page-level and API-level checks.
const FOLLOW_UP_ITEMS: NavItem[] = [
  { label: "صندوق پیام", href: "/admin/inbox", icon: <MessageSquareText size={17} /> },
  { label: "درخواست‌های آنالیز پیج", href: "/admin/page-analysis", icon: <Search size={17} /> },
  { label: "سفارش‌ها", href: "/admin/orders", icon: <ShoppingCart size={17} /> },
  { label: "مارکتینگ", href: "/admin/marketing", icon: <Megaphone size={17} /> },
];

const ADMIN_ONLY_ITEMS: NavItem[] = [
  { label: "داشبورد", href: "/admin", icon: <LayoutDashboard size={17} /> },
  { label: "محتوا", href: "/admin/content", icon: <Library size={17} /> },
  { label: "CRM اینستاگرام", href: "/admin/engagement", icon: <Contact size={17} /> },
  { label: "کاربران و تخفیف‌ها", href: "/admin/sales", icon: <Users size={17} /> },
  { label: "گزارش‌ها", href: "/admin/reports", icon: <BarChart3 size={17} /> },
  { label: "کاربران سیستمی", href: "/admin/users", icon: <ShieldCheck size={17} /> },
  { label: "تنظیمات سایت", href: "/admin/settings", icon: <Settings size={17} /> },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const fullAdmin = isFullAdmin(session);
  const items: NavItem[] = fullAdmin
    ? [ADMIN_ONLY_ITEMS[0], ...FOLLOW_UP_ITEMS, ...ADMIN_ONLY_ITEMS.slice(1)]
    : FOLLOW_UP_ITEMS;

  return (
    <DashboardShell
      items={items}
      navTitle="پنل مدیریت"
      topbarTitle="پنل مدیریت"
      userInitial={fullAdmin ? "A" : "S"}
    >
      {children}
    </DashboardShell>
  );
}
