import {
  BookOpen,
  CreditCard,
  LayoutDashboard,
  LifeBuoy,
  Package,
  Receipt,
  Sparkles,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import type { NavItem } from "@/components/dashboard/sidebar";

const items: NavItem[] = [
  { label: "نمای کلی", href: "/dashboard", icon: <LayoutDashboard size={17} /> },
  { label: "پکیج‌های آموزشی من", href: "/dashboard/courses", icon: <BookOpen size={17} /> },
  { label: "ابزارهای من", href: "/dashboard/tools", icon: <Package size={17} /> },
  { label: "پرامپت‌های رایگان", href: "/dashboard/prompts", icon: <Sparkles size={17} /> },
  { label: "اشتراک من", href: "/dashboard/subscription", icon: <CreditCard size={17} /> },
  { label: "فاکتورها", href: "/dashboard/invoices", icon: <Receipt size={17} /> },
  { label: "تیکت پشتیبانی", href: "/dashboard/tickets", icon: <LifeBuoy size={17} /> },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell items={items} navTitle="پنل کاربری" topbarTitle="پنل کاربری">
      {children}
    </DashboardShell>
  );
}
