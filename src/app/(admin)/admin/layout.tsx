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
// definition shared with page-level and API-level checks. Items are
// grouped (NavItem.group) purely for sidebar legibility — it has no effect
// on the permission boundary itself.
const FOLLOW_UP_ITEMS: NavItem[] = [
  { label: "صندوق پیام", href: "/admin/inbox", icon: <MessageSquareText size={17} />, group: "پیگیری روزانه" },
  {
    label: "درخواست‌های آنالیز پیج",
    href: "/admin/page-analysis",
    icon: <Search size={17} />,
    group: "پیگیری روزانه",
  },
  { label: "سفارش‌ها", href: "/admin/orders", icon: <ShoppingCart size={17} />, group: "پیگیری روزانه" },
  { label: "مارکتینگ", href: "/admin/marketing", icon: <Megaphone size={17} />, group: "پیگیری روزانه" },
];

const DASHBOARD_ITEM: NavItem = { label: "داشبورد", href: "/admin", icon: <LayoutDashboard size={17} /> };

const CONTENT_SALES_ITEMS: NavItem[] = [
  { label: "محتوا", href: "/admin/content", icon: <Library size={17} />, group: "محتوا و فروش" },
  { label: "CRM اینستاگرام", href: "/admin/engagement", icon: <Contact size={17} />, group: "محتوا و فروش" },
  { label: "کاربران و تخفیف‌ها", href: "/admin/sales", icon: <Users size={17} />, group: "محتوا و فروش" },
];

const MANAGEMENT_ITEMS: NavItem[] = [
  { label: "گزارش‌ها", href: "/admin/reports", icon: <BarChart3 size={17} />, group: "مدیریت" },
  { label: "کاربران سیستمی", href: "/admin/users", icon: <ShieldCheck size={17} />, group: "مدیریت" },
  { label: "تنظیمات سایت", href: "/admin/settings", icon: <Settings size={17} />, group: "مدیریت" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const fullAdmin = isFullAdmin(session);
  const items: NavItem[] = fullAdmin
    ? [DASHBOARD_ITEM, ...FOLLOW_UP_ITEMS, ...CONTENT_SALES_ITEMS, ...MANAGEMENT_ITEMS]
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
