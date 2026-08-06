"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { aiToolTypeLabel } from "@/lib/status-labels";
import { PromptDemo } from "@/components/site/prompt-demo";

interface PromptCardProps {
  name: string;
  type: "IMAGE" | "VIDEO" | "AUDIO";
  promptText: string;
  usageInstructions?: string | null;
  price?: number;
  demoBeforeUrl: string | null;
  demoAfterUrl: string | null;
}

export function PromptCard({
  name,
  type,
  promptText,
  usageInstructions,
  price = 0,
  demoBeforeUrl,
  demoAfterUrl,
}: PromptCardProps) {
  const [copied, setCopied] = useState(false);

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

  async function handleCopy() {
    // navigator.clipboard needs a secure context (HTTPS or localhost) — on a
    // plain-HTTP deploy (no domain/SSL yet) it's undefined, so fall back to
    // the older execCommand approach instead of failing silently.
    let ok = false;
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(promptText);
        ok = true;
      } catch {
        ok = legacyCopy(promptText);
      }
    } else {
      ok = legacyCopy(promptText);
    }
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <h3 className="font-bold">{name}</h3>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <Badge variant="secondary">{aiToolTypeLabel[type]}</Badge>
          <Badge variant="success">{price > 0 ? "پریمیوم" : "رایگان"}</Badge>
        </div>
      </div>

      <PromptDemo type={type} name={name} demoBeforeUrl={demoBeforeUrl} demoAfterUrl={demoAfterUrl} />

      <p
        dir="ltr"
        className="mb-3 flex-1 rounded-lg bg-secondary/60 p-3 text-left text-xs leading-6 text-muted-foreground"
      >
        {promptText}
      </p>

      {usageInstructions && (
        <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs leading-6 text-foreground">
          <p className="mb-1 font-bold text-primary">نحوه استفاده صحیح</p>
          {usageInstructions}
        </div>
      )}

      <Button variant="outline" onClick={handleCopy}>
        {copied ? (
          <>
            <Check size={15} />
            کپی شد
          </>
        ) : (
          <>
            <Copy size={15} />
            کپی پرامپت
          </>
        )}
      </Button>
    </div>
  );
}
