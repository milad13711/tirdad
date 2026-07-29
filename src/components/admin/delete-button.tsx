"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeleteButton({
  endpoint,
  id,
  confirmMessage,
}: {
  endpoint: string;
  id: string;
  confirmMessage: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!window.confirm(confirmMessage)) return;
    setLoading(true);
    try {
      const res = await fetch(`${endpoint}?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (res.ok) router.refresh();
      else setLoading(false);
    } catch {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleClick}
      disabled={loading}
      className="text-destructive hover:border-destructive/50"
      aria-label="حذف"
    >
      <Trash2 size={14} />
    </Button>
  );
}
