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

export function PromptGallery({ initial }: { initial: PromptsResponse }) {
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
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو در پرامپت‌ها..."
            className="pr-11"
          />
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTag(null)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                activeTag === null
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary/50",
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
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  activeTag === tag
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:border-primary/50",
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {prompts.length === 0 && !loading ? (
        <p className="py-20 text-center text-muted-foreground">پرامپتی پیدا نشد.</p>
      ) : (
        <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
          {prompts.map((prompt) => (
            <PublicPromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="h-1" />
      {loading && <p className="py-6 text-center text-sm text-muted-foreground">در حال بارگذاری...</p>}
    </div>
  );
}
