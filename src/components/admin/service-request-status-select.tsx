"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { serviceRequestStatusLabel } from "@/lib/status-labels";

const statusOptions = Object.entries(serviceRequestStatusLabel) as [
  keyof typeof serviceRequestStatusLabel,
  string,
][];

export function ServiceRequestStatusSelect({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/service-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: event.target.value }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <select
      defaultValue={status}
      onChange={handleChange}
      disabled={loading}
      className="h-9 rounded-md border border-border bg-background px-3 text-xs text-foreground outline-none focus:border-primary"
    >
      {statusOptions.map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
