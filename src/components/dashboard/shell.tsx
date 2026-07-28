"use client";

import { useState, type ReactNode } from "react";
import { Sidebar, type NavItem } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

export function DashboardShell({
  items,
  navTitle,
  topbarTitle,
  userInitial,
  children,
}: {
  items: NavItem[];
  navTitle: string;
  topbarTitle: string;
  userInitial?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen" dir="rtl">
      <div className="hidden md:block">
        <div className="fixed inset-y-0 right-0 z-40">
          <Sidebar items={items} title={navTitle} />
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 right-0">
            <Sidebar items={items} title={navTitle} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-h-screen min-w-0 flex-1 flex-col md:mr-64">
        <Topbar title={topbarTitle} userInitial={userInitial} onMenuClick={() => setOpen(true)} />
        <main className="min-w-0 flex-1 overflow-x-hidden px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
