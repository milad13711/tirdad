"use client";

import { useEffect, useRef, useState } from "react";
import { ImageIcon, Lock, Music, PlayCircle, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { aiToolTypeLabel } from "@/lib/status-labels";
import { formatToman } from "@/lib/format";
import { cn } from "@/lib/utils";
import { PromptDetailModal } from "@/components/site/prompt-detail-modal";

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

const typeIcon = { IMAGE: ImageIcon, VIDEO: Video, AUDIO: Music } as const;

// Meigen-style masonry tile: the hero image renders at its natural aspect
// ratio (no fixed aspect-*), which is what actually produces the varied
// tile heights of a Pinterest-style grid — no JS layout math needed, the
// browser's own CSS-columns reflow handles it. Full prompt content (text
// reveal, copy, purchase, before/after comparison) lives in the modal, not
// here — expanding a tile in place would reflow every item below it in a
// CSS-columns masonry, which reads as janky; a modal sidesteps that.
export function PublicPromptCard({ prompt, autoReveal = false }: { prompt: PublicPrompt; autoReveal?: boolean }) {
  const [modalOpen, setModalOpen] = useState(() => autoReveal && prompt.owned);
  const [viewCount, setViewCount] = useState(prompt.viewCount);
  const [likeCount, setLikeCount] = useState(prompt.likeCount);
  const [liked, setLiked] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLiked(readIds(LIKED_KEY).includes(prompt.id));
  }, [prompt.id]);

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

  const isLocked = prompt.price > 0 && !prompt.owned;
  // For IMAGE prompts demoAfterUrl/demoBeforeUrl are both photos, so the
  // "after" shot makes the punchier tile. For VIDEO/AUDIO, demoAfterUrl is
  // the actual clip/track file (see PromptDemo) — only demoBeforeUrl is a
  // still image there, so using demoAfterUrl as an <img> src would render
  // a broken image.
  const heroImage = prompt.type === "IMAGE" ? prompt.demoAfterUrl || prompt.demoBeforeUrl : prompt.demoBeforeUrl;
  const TypeIcon = typeIcon[prompt.type];

  return (
    <>
      <div
        ref={cardRef}
        onClick={() => setModalOpen(true)}
        className={cn(
          "group relative mb-4 block w-full cursor-pointer overflow-hidden rounded-2xl bg-card ring-primary/40 transition-shadow break-inside-avoid",
          autoReveal ? "ring-4" : "",
        )}
      >
        {heroImage ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={heroImage} alt={prompt.name} loading="lazy" className="block w-full transition-transform duration-500 ease-out group-hover:scale-[1.03]" />
            {prompt.type === "VIDEO" && (
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <PlayCircle size={40} className="text-white/90 drop-shadow-lg" />
              </span>
            )}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

            {isLocked && (
              <span className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md">
                <Lock size={13} />
              </span>
            )}

            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-3">
              <div className="flex items-center gap-1.5">
                <Badge variant="secondary" className="bg-white/15 text-white backdrop-blur-md">
                  {aiToolTypeLabel[prompt.type]}
                </Badge>
                {prompt.price === 0 ? (
                  <Badge variant="success">رایگان</Badge>
                ) : (
                  <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-black">
                    {prompt.owned ? "خریداری‌شده" : `${formatToman(prompt.price)} تومان`}
                  </span>
                )}
              </div>
              <p className="truncate text-sm font-semibold text-white drop-shadow-md">{prompt.name}</p>
            </div>
          </>
        ) : (
          <div className="relative flex aspect-[3/4] w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-primary/15 via-secondary to-secondary p-6 text-center">
            {isLocked && (
              <span className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-background/70 text-foreground backdrop-blur-md">
                <Lock size={13} />
              </span>
            )}
            <TypeIcon size={28} className="text-primary/70" />
            <p className="line-clamp-3 text-sm font-medium text-foreground">{prompt.name}</p>
            <div className="flex items-center gap-1.5">
              <Badge variant="secondary">{aiToolTypeLabel[prompt.type]}</Badge>
              {prompt.price === 0 ? (
                <Badge variant="success">رایگان</Badge>
              ) : (
                <Badge variant={prompt.owned ? "success" : "warning"}>
                  {prompt.owned ? "خریداری‌شده" : `${formatToman(prompt.price)} تومان`}
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <PromptDetailModal
          prompt={prompt}
          viewCount={viewCount}
          likeCount={likeCount}
          liked={liked}
          onToggleLike={toggleLike}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
