"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, CreditCard, Eye, EyeOff, Heart, Lock, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { aiToolTypeLabel } from "@/lib/status-labels";
import { formatToman } from "@/lib/format";
import { cn } from "@/lib/utils";
import { PromptDemo } from "@/components/site/prompt-demo";
import type { PublicPrompt } from "@/components/site/public-prompt-card";

function legacyCopy(text: string) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    document.execCommand("copy");
    return true;
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}

export function PromptDetailModal({
  prompt,
  viewCount,
  likeCount,
  liked,
  onToggleLike,
  onClose,
}: {
  prompt: PublicPrompt;
  viewCount: number;
  likeCount: number;
  liked: boolean;
  onToggleLike: () => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const [revealed, setRevealed] = useState(prompt.owned);
  const [copied, setCopied] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const isLocked = prompt.price > 0 && !prompt.owned;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  async function handleCopy() {
    let ok = false;
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(prompt.promptText);
        ok = true;
      } catch {
        ok = legacyCopy(prompt.promptText);
      }
    } else {
      ok = legacyCopy(prompt.promptText);
    }
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handlePurchase() {
    setPurchaseError(null);
    setPurchasing(true);
    try {
      const res = await fetch("/api/payments/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemType: "PROMPT", aiToolId: prompt.id }),
      });
      if (res.status === 401) {
        router.push(`/login?next=${encodeURIComponent("/prompts")}`);
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطا در اتصال به درگاه پرداخت");
      window.location.href = data.paymentUrl;
    } catch (err) {
      setPurchaseError(err instanceof Error ? err.message : "خطا در اتصال به درگاه پرداخت");
      setPurchasing(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="بستن"
          className="absolute left-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/60"
        >
          <X size={16} />
        </button>

        <div className="overflow-y-auto p-5 md:p-6">
          <PromptDemo
            type={prompt.type}
            name={prompt.name}
            demoBeforeUrl={prompt.demoBeforeUrl}
            demoAfterUrl={prompt.demoAfterUrl}
          />

          <div className="mb-3 flex items-start justify-between gap-3">
            <h3 className="text-lg font-bold">{prompt.name}</h3>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <Badge variant="secondary">{aiToolTypeLabel[prompt.type]}</Badge>
              {prompt.price === 0 ? (
                <Badge variant="success">رایگان</Badge>
              ) : (
                <Badge variant={prompt.owned ? "success" : "warning"}>
                  {prompt.owned ? "پریمیوم • خریداری‌شده" : "پریمیوم"}
                </Badge>
              )}
            </div>
          </div>

          {prompt.tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {prompt.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {revealed && !isLocked && (
            <div className="mb-3 space-y-2">
              <p dir="ltr" className="rounded-lg bg-secondary/60 p-3 text-left text-xs leading-6 text-muted-foreground">
                {prompt.promptText}
              </p>
              {prompt.usageInstructions && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs leading-6 text-foreground">
                  <p className="mb-1 font-bold text-primary">نحوه استفاده صحیح</p>
                  {prompt.usageInstructions}
                </div>
              )}
            </div>
          )}

          {isLocked ? (
            <div className="space-y-2">
              <Button className="w-full" onClick={handlePurchase} disabled={purchasing}>
                <CreditCard size={15} />
                {purchasing ? "در حال اتصال به درگاه..." : `خرید و مشاهده — ${formatToman(prompt.price)} تومان`}
              </Button>
              {purchaseError && <p className="text-xs text-destructive">{purchaseError}</p>}
            </div>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setRevealed((v) => !v)}>
                {revealed ? <EyeOff size={15} /> : <Eye size={15} />}
                {revealed ? "پنهان کردن پرامپت" : "نمایش پرامپت"}
              </Button>
              {revealed && (
                <Button variant="outline" size="icon" aria-label="کپی پرامپت" onClick={handleCopy}>
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                </Button>
              )}
            </div>
          )}

          <div className="mt-3 flex items-center gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Eye size={13} />
              {viewCount.toLocaleString("fa-IR")} بازدید
            </span>
            <button
              type="button"
              onClick={onToggleLike}
              className={cn(
                "flex items-center gap-1.5 transition-colors hover:text-primary",
                liked && "text-primary",
              )}
              aria-pressed={liked}
              aria-label={liked ? "لغو پسندیدن" : "پسندیدن"}
            >
              <Heart size={13} fill={liked ? "currentColor" : "none"} />
              {likeCount.toLocaleString("fa-IR")} پسند
            </button>
            {isLocked && (
              <span className="mr-auto flex items-center gap-1.5">
                <Lock size={12} />
                قفل
              </span>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
