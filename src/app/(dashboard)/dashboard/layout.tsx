import {
  BookOpen,
  CreditCard,
  LayoutDashboard,
  LifeBuoy,
  Receipt,
  Sparkles,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import type { NavItem } from "@/components/dashboard/sidebar";

const items: NavItem[] = [
  { label: "نمای کلی", href: "/dashboard", icon: <LayoutDashboard size={17} /> },
  { label: "دوره‌های من", href: "/dashboard/courses", icon: <BookOpen size={17} /> },
  { label: "ابزارهای هوش مصنوعی", href: "/dashboard/ai-tools", icon: <Sparkles size={17} /> },
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
