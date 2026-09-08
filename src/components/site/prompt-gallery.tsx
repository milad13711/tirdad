"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { PublicPromptCard, type PublicPrompt } from "@/components/site/public-prompt-card";

interface PromptsResponse {
  items: PublicPrompt[];
  nextCursor: string | null;
  tags?: string[];
}

export function PromptGallery({
  initial,
  highlightId,
}: {
  initial: PromptsResponse;
  highlightId?: string;
}) {
  const [prompts, setPrompts] = useState(initial.items);
  const [cursor, setCursor] = useState(initial.nextCursor);
  const [tags] = useState(initial.tags ?? []);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const fetchPage = useCallback(
    async (opts: { q: string; tag: string | null; cursor: string | null; replace: boolean }) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (opts.q) params.set("q", opts.q);
        if (opts.tag) params.set("tag", opts.tag);
        if (opts.cursor) params.set("cursor", opts.cursor);
        const res = await fetch(`/api/prompts?${params.toString()}`);
        const data: PromptsResponse = await res.json();
        setPrompts((prev) => (opts.replace ? data.items : [...prev, ...data.items]));
        setCursor(data.nextCursor);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Search/tag changes replace the whole list from page 1.
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchPage({ q: query, tag: activeTag, cursor: null, replace: true });
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, activeTag]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && cursor && !loading) {
          fetchPage({ q: query, tag: activeTag, cursor, replace: false });
        }
      },
      { rootMargin: "400px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [cursor, loading, query, activeTag, fetchPage]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTag(null)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
              activeTag === null
                ? "bg-foreground text-background"
                : "bg-secondary text-muted-foreground hover:text-foreground",
            )}
          >
            همه
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(tag)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                activeTag === tag
                  ? "bg-foreground text-background"
                  : "bg-secondary text-muted-foreground hover:text-foreground",
              )}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={15} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو در پرامپت‌ها..."
            className="rounded-full pr-10"
          />
        </div>
      </div>

      {prompts.length === 0 && !loading ? (
        <p className="py-20 text-center text-muted-foreground">پرامپتی پیدا نشد.</p>
      ) : (
        <div className="columns-2 gap-3 sm:columns-2 md:columns-3 lg:columns-4">
          {prompts.map((prompt) => (
            <PublicPromptCard key={prompt.id} prompt={prompt} autoReveal={prompt.id === highlightId} />
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="h-1" />
      {loading && <p className="py-6 text-center text-sm text-muted-foreground">در حال بارگذاری...</p>}
    </div>
  );
}
