"use client";

import { Menu } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function Topbar({
  title,
  userInitial = "ع",
  onMenuClick,
}: {
  title: string;
  userInitial?: string;
  onMenuClick?: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/85 px-6 py-4 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="باز کردن منو"
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-border md:hidden"
        >
          <Menu size={17} />
        </button>
        <h1 className="text-lg font-bold">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
          {userInitial}
        </div>
      </div>
    </header>
  );
}
