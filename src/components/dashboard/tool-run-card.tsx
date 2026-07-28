"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Download, Loader2, UploadCloud, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ToolRunCard({
  id,
  title,
  description,
  credits,
}: {
  id: string;
  title: string;
  description: string;
  credits: number;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "running" | "done">("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRun() {
    setStatus("running");
    setError(null);
    try {
      const res = await fetch(`/api/ai-tools/${id}/run`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطا در اجرای ابزار");
      setStatus("done");
      router.refresh();
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "خطا در اجرای ابزار");
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {credits} کردیت
        </span>
      </div>

      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-6 text-center text-xs text-muted-foreground transition-colors hover:border-primary/50">
        <UploadCloud size={20} />
        {fileName ?? "برای آپلود فایل کلیک کنید"}
        <input
          type="file"
          className="hidden"
          onChange={(event) => setFileName(event.target.files?.[0]?.name ?? null)}
        />
      </label>

      <Button
        className="mt-4 w-full"
        disabled={!fileName || status === "running"}
        onClick={handleRun}
      >
        {status === "running" ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            در حال پردازش...
          </>
        ) : (
          <>
            <Wand2 size={16} />
            اجرای ابزار
          </>
        )}
      </Button>

      {error && <p className="mt-3 text-center text-sm text-destructive">{error}</p>}

      {status === "done" && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm">
          <span className="text-emerald-500">خروجی آماده شد</span>
          <button className="flex cursor-pointer items-center gap-1 font-medium text-emerald-500 hover:underline">
            <Download size={14} />
            دانلود
          </button>
        </div>
      )}
    </div>
  );
}
