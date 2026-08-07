"use client";

import { useState, type ReactNode } from "react";

interface Tab {
  key: string;
  label: string;
  content: ReactNode;
}

// Generic in-page tab switcher used to group related admin pages under a
// single sidebar nav entry (see src/app/(admin)/admin/layout.tsx) instead
// of one nav item per page — only the active tab's content is rendered.
export function AdminTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.key);

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-1 overflow-x-auto border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={`shrink-0 border-b-2 px-4 pb-3 text-sm font-medium transition-colors ${
              active === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
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
