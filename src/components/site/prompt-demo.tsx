"use client";

import { useState } from "react";
import { PlayCircle } from "lucide-react";

interface PromptDemoProps {
  type: "IMAGE" | "VIDEO" | "AUDIO";
  name: string;
  demoBeforeUrl: string | null;
  demoAfterUrl: string | null;
}

// Renders a prompt's demo media differently per prompt type: IMAGE prompts
// get a before/after photo pair, VIDEO prompts get a cover thumbnail that
// plays the demo clip on click, AUDIO prompts get a cover thumbnail plus an
// inline audio player. demoBeforeUrl/demoAfterUrl are reused across all
// three rather than adding per-type fields to the schema.
export function PromptDemo({ type, name, demoBeforeUrl, demoAfterUrl }: PromptDemoProps) {
  const [playing, setPlaying] = useState(false);

  if (!demoBeforeUrl && !demoAfterUrl) return null;

  if (type === "IMAGE") {
    return (
      <div className="mb-4 grid grid-cols-2 gap-2">
        <div>
          <p className="mb-1.5 text-center text-xs text-muted-foreground">قبل</p>
          <div className="aspect-square overflow-hidden rounded-lg border border-border bg-secondary">
            {demoBeforeUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={demoBeforeUrl} alt={`${name} — قبل`} className="h-full w-full object-cover" loading="lazy" />
            )}
          </div>
        </div>
        <div>
          <p className="mb-1.5 text-center text-xs text-muted-foreground">بعد</p>
          <div className="aspect-square overflow-hidden rounded-lg border border-border bg-secondary">
            {demoAfterUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={demoAfterUrl} alt={`${name} — بعد`} className="h-full w-full object-cover" loading="lazy" />
            )}
          </div>
        </div>
      </div>
    );
  }

  if (type === "VIDEO") {
    if (demoAfterUrl && playing) {
      return (
        <div className="mb-4 aspect-video overflow-hidden rounded-lg border border-border bg-black">
          <video src={demoAfterUrl} controls autoPlay playsInline className="h-full w-full object-contain" />
        </div>
      );
    }
    if (demoAfterUrl) {
      return (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group relative mb-4 block aspect-video w-full overflow-hidden rounded-lg border border-border bg-secondary text-start"
        >
          {demoBeforeUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={demoBeforeUrl} alt={name} className="h-full w-full object-cover" loading="lazy" />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/40">
            <PlayCircle size={36} className="text-white" />
          </div>
        </button>
      );
    }
    if (demoBeforeUrl) {
      return (
        <div className="mb-4 aspect-video overflow-hidden rounded-lg border border-border bg-secondary">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={demoBeforeUrl} alt={name} className="h-full w-full object-cover" loading="lazy" />
        </div>
      );
    }
    return null;
  }

  // AUDIO
  return (
    <div className="mb-4 space-y-2">
      {demoBeforeUrl && (
        <div className="aspect-video overflow-hidden rounded-lg border border-border bg-secondary">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={demoBeforeUrl} alt={name} className="h-full w-full object-cover" loading="lazy" />
        </div>
      )}
      {demoAfterUrl && <audio src={demoAfterUrl} controls className="w-full" />}
    </div>
  );
}
