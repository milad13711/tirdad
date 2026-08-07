import {
  BookOpen,
  Clapperboard,
  Inbox,
  LayoutDashboard,
  Megaphone,
  MessagesSquare,
  Newspaper,
  Settings,
  ShoppingCart,
  Sparkles,
  Ticket,
  Users,
  Wand2,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import type { NavItem } from "@/components/dashboard/sidebar";

const items: NavItem[] = [
  { label: "نمای کلی", href: "/admin", icon: <LayoutDashboard size={17} /> },
  { label: "کاربران", href: "/admin/users", icon: <Users size={17} /> },
  { label: "سفارش‌ها", href: "/admin/orders", icon: <ShoppingCart size={17} /> },
  { label: "پکیج‌های آموزشی", href: "/admin/courses", icon: <BookOpen size={17} /> },
  { label: "پرامپت‌های رایگان", href: "/admin/prompts", icon: <Sparkles size={17} /> },
  { label: "درخواست‌های سفارشی", href: "/admin/service-requests", icon: <Wand2 size={17} /> },
  { label: "نمونه‌کارهای تیزر", href: "/admin/teasers", icon: <Clapperboard size={17} /> },
  { label: "CRM اینستاگرام", href: "/admin/crm", icon: <MessagesSquare size={17} /> },
  { label: "مارکتینگ", href: "/admin/marketing", icon: <Megaphone size={17} /> },
  { label: "صندوق پیام", href: "/admin/inbox", icon: <Inbox size={17} /> },
  { label: "بلاگ", href: "/admin/blog", icon: <Newspaper size={17} /> },
  { label: "کد تخفیف", href: "/admin/coupons", icon: <Ticket size={17} /> },
  { label: "تنظیمات سایت", href: "/admin/settings", icon: <Settings size={17} /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell items={items} navTitle="پنل مدیریت" topbarTitle="پنل مدیریت" userInitial="A">
      {children}
    </DashboardShell>
  );
}
