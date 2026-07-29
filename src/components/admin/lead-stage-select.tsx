"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { leadStageLabel } from "@/lib/status-labels";

const stageOptions = Object.entries(leadStageLabel) as [keyof typeof leadStageLabel, string][];

export function LeadStageSelect({ leadId, stage }: { leadId: string; stage: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: leadId, stage: event.target.value }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <select
      defaultValue={stage}
      onChange={handleChange}
      disabled={loading}
      className="mt-2 h-8 w-full rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none focus:border-primary"
    >
      {stageOptions.map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
