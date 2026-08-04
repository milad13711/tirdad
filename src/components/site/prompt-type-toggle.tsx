"use client";

import { useState } from "react";
import { Image as ImageIcon, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { PublicPromptCard, type PublicPrompt } from "@/components/site/public-prompt-card";

interface PromptTypeToggleProps {
  image: PublicPrompt[];
  video: PublicPrompt[];
}

export function PromptTypeToggle({ image, video }: PromptTypeToggleProps) {
  const [type, setType] = useState<"IMAGE" | "VIDEO">(image.length > 0 ? "IMAGE" : "VIDEO");
  const prompts = type === "IMAGE" ? image : video;

  return (
    <div>
      {image.length > 0 && video.length > 0 && (
        <div className="mb-8 flex justify-center">
          <div className="inline-flex rounded-full border border-border bg-card p-1">
            <button
              type="button"
              onClick={() => setType("IMAGE")}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                type === "IMAGE" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
              )}
            >
              <ImageIcon size={15} />
              پرامپت‌های تصویری
            </button>
            <button
              type="button"
              onClick={() => setType("VIDEO")}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                type === "VIDEO" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
              )}
            >
              <Video size={15} />
              پرامپت‌های ویدیویی
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {prompts.map((prompt) => (
          <PublicPromptCard key={prompt.id} prompt={prompt} />
        ))}
      </div>
    </div>
  );
}
