"use client";

import { useState, type ReactNode } from "react";

interface Tab {
  key: string;
  label: ReactNode;
  content: ReactNode;
}

// Generic in-page tab switcher used to group related admin pages under a
// single sidebar nav entry (see src/app/(admin)/admin/layout.tsx) instead
// of one nav item per page — only the active tab's content is rendered.
export function AdminTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.key);

  return (
    <div>
      <div className="mb-6 flex w-fit flex-wrap gap-1 overflow-x-auto rounded-lg bg-secondary/60 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={`shrink-0 cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
              active === tab.key
                ? "bg-card text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="space-y-6">{tabs.find((t) => t.key === active)?.content}</div>
    </div>
  );
}
