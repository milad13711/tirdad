import {
  BookOpen,
  LayoutDashboard,
  MessagesSquare,
  Newspaper,
  ShoppingCart,
  Sparkles,
  Ticket,
  Users,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import type { NavItem } from "@/components/dashboard/sidebar";

const items: NavItem[] = [
  { label: "نمای کلی", href: "/admin", icon: <LayoutDashboard size={17} /> },
  { label: "کاربران", href: "/admin/users", icon: <Users size={17} /> },
  { label: "سفارش‌ها", href: "/admin/orders", icon: <ShoppingCart size={17} /> },
  { label: "دوره‌ها", href: "/admin/courses", icon: <BookOpen size={17} /> },
  { label: "ابزارهای هوش مصنوعی", href: "/admin/ai-tools", icon: <Sparkles size={17} /> },
  { label: "CRM اینستاگرام", href: "/admin/crm", icon: <MessagesSquare size={17} /> },
  { label: "بلاگ", href: "/admin/blog", icon: <Newspaper size={17} /> },
  { label: "کد تخفیف", href: "/admin/coupons", icon: <Ticket size={17} /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell items={items} navTitle="پنل مدیریت" topbarTitle="پنل مدیریت" userInitial="A">
      {children}
    </DashboardShell>
  );
}
