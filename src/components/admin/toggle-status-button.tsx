"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ToggleStatusButtonProps {
  endpoint: string;
  body: Record<string, unknown>;
  activeNow: boolean;
  onLabel: string;
  offLabel: string;
}

export function ToggleStatusButton({
  endpoint,
  body,
  activeNow,
  onLabel,
  offLabel,
}: ToggleStatusButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={loading}>
      {loading ? "..." : activeNow ? offLabel : onLabel}
    </Button>
  );
}
