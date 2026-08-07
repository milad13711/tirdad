import { LayoutDashboard, Library, MessagesSquare, Settings, ShoppingCart } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";
import type { NavItem } from "@/components/dashboard/sidebar";

const items: NavItem[] = [
  { label: "داشبورد", href: "/admin", icon: <LayoutDashboard size={17} /> },
  { label: "محتوا", href: "/admin/content", icon: <Library size={17} /> },
  { label: "فروش و کاربران", href: "/admin/sales", icon: <ShoppingCart size={17} /> },
  { label: "ارتباط با مخاطب", href: "/admin/engagement", icon: <MessagesSquare size={17} /> },
  { label: "تنظیمات سایت", href: "/admin/settings", icon: <Settings size={17} /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell items={items} navTitle="پنل مدیریت" topbarTitle="پنل مدیریت" userInitial="A">
      {children}
    </DashboardShell>
  );
}
