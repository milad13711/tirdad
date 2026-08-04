"use client";

import { useState } from "react";
import { Check, Copy, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { aiToolTypeLabel } from "@/lib/status-labels";

export interface PublicPrompt {
  id: string;
  name: string;
  type: "IMAGE" | "VIDEO" | "AUDIO";
  promptText: string;
  demoBeforeUrl: string | null;
  demoAfterUrl: string | null;
  tags: string[];
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

export function PublicPromptCard({ prompt }: { prompt: PublicPrompt }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

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

  return (
    <div className="mb-6 break-inside-avoid rounded-2xl border border-border bg-card p-5">
      {(prompt.demoBeforeUrl || prompt.demoAfterUrl) && (
        <div className="mb-4 grid grid-cols-2 gap-2">
          <div>
            <p className="mb-1.5 text-center text-xs text-muted-foreground">قبل</p>
            <div className="aspect-square overflow-hidden rounded-lg border border-border bg-secondary">
              {prompt.demoBeforeUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={prompt.demoBeforeUrl}
                  alt={`${prompt.name} — قبل`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              )}
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-center text-xs text-muted-foreground">بعد</p>
            <div className="aspect-square overflow-hidden rounded-lg border border-border bg-secondary">
              {prompt.demoAfterUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={prompt.demoAfterUrl}
                  alt={`${prompt.name} — بعد`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="font-bold">{prompt.name}</h3>
        <Badge variant="secondary">{aiToolTypeLabel[prompt.type]}</Badge>
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

      {revealed && (
        <p dir="ltr" className="mb-3 rounded-lg bg-secondary/60 p-3 text-left text-xs leading-6 text-muted-foreground">
          {prompt.promptText}
        </p>
      )}

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
    </div>
  );
}
