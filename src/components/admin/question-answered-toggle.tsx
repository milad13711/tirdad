"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function QuestionAnsweredToggle({ id, answered }: { id: string; answered: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      await fetch("/api/admin/campaign-questions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, answered: !answered }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant={answered ? "outline" : "default"} size="sm" onClick={handleClick} disabled={loading}>
      {answered ? "پیگیری شد" : "علامت‌گذاری به‌عنوان پیگیری‌شده"}
    </Button>
  );
}
