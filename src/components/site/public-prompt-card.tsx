"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, CreditCard, Eye, EyeOff, Heart, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { aiToolTypeLabel } from "@/lib/status-labels";
import { formatToman } from "@/lib/format";
import { cn } from "@/lib/utils";
import { PromptDemo } from "@/components/site/prompt-demo";

export interface PublicPrompt {
  id: string;
  name: string;
  type: "IMAGE" | "VIDEO" | "AUDIO";
  promptText: string;
  usageInstructions: string | null;
  price: number;
  owned: boolean;
  demoBeforeUrl: string | null;
  demoAfterUrl: string | null;
  tags: string[];
  viewCount: number;
  likeCount: number;
}

const VIEWED_KEY = "tirdad:viewedPrompts";
const LIKED_KEY = "tirdad:likedPrompts";

function readIds(key: string): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

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

export function PublicPromptCard({ prompt, autoReveal = false }: { prompt: PublicPrompt; autoReveal?: boolean }) {
  const router = useRouter();
  const [revealed, setRevealed] = useState(autoReveal && prompt.owned);
  const [copied, setCopied] = useState(false);
  const [viewCount, setViewCount] = useState(prompt.viewCount);
  const [likeCount, setLikeCount] = useState(prompt.likeCount);
  const [liked, setLiked] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Server has no localStorage, so liked state can only be known after
    // mount — this is the standard hydration-safe pattern for reading
    // client-only storage, not a derivable-from-props value.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLiked(readIds(LIKED_KEY).includes(prompt.id));
  }, [prompt.id]);

  useEffect(() => {
    if (!autoReveal || !cardRef.current) return;
    cardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [autoReveal]);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();
        const seen = readIds(VIEWED_KEY);
        if (seen.includes(prompt.id)) return;
        localStorage.setItem(VIEWED_KEY, JSON.stringify([...seen, prompt.id]));
        fetch(`/api/prompts/${prompt.id}/view`, { method: "POST" })
          .then((res) => res.json())
          .then((data) => {
            if (typeof data.viewCount === "number") setViewCount(data.viewCount);
          })
          .catch(() => {});
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [prompt.id]);

  async function toggleLike() {
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => Math.max(0, c + (next ? 1 : -1)));
    const seen = readIds(LIKED_KEY);
    localStorage.setItem(
      LIKED_KEY,
      JSON.stringify(next ? [...seen, prompt.id] : seen.filter((id) => id !== prompt.id)),
    );
    try {
      const res = await fetch(`/api/prompts/${prompt.id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ liked: next }),
      });
      const data = await res.json();
      if (typeof data.likeCount === "number") setLikeCount(data.likeCount);
    } catch {
      // Local state already reflects the toggle; a failed sync just leaves
      // the server count slightly stale until the next successful toggle.
    }
  }

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

  const isLocked = prompt.price > 0 && !prompt.owned;

  return (
    <div
      ref={cardRef}
      className={cn(
        "mb-6 break-inside-avoid rounded-2xl border bg-card p-5 ring-primary/30 transition-shadow",
        autoReveal ? "border-primary ring-4" : "border-border",
      )}
    >
      <PromptDemo
        type={prompt.type}
        name={prompt.name}
        demoBeforeUrl={prompt.demoBeforeUrl}
        demoAfterUrl={prompt.demoAfterUrl}
      />

      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="font-bold">{prompt.name}</h3>
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
          onClick={toggleLike}
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
  );
}
