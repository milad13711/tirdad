"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { BUSINESS_CATEGORIES } from "@/lib/business-categories";
import { cn } from "@/lib/utils";

// Reused by the new-prompt and edit-prompt admin forms. Backed by the same
// AiTool.tags string array as before — this just replaces the freeform
// comma-separated text input with a curated business-category picker (plus
// a custom-value escape hatch for anything not in the preset list).
export function BusinessCategoryPicker({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const [custom, setCustom] = useState("");
  const extra = selected.filter((s) => !(BUSINESS_CATEGORIES as readonly string[]).includes(s));

  function toggle(category: string) {
    onChange(selected.includes(category) ? selected.filter((c) => c !== category) : [...selected, category]);
  }

  function addCustom() {
    const value = custom.trim();
    if (value && !selected.includes(value)) onChange([...selected, value]);
    setCustom("");
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {BUSINESS_CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => toggle(category)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition-colors",
              selected.includes(category)
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:border-primary/50",
            )}
          >
            {category}
          </button>
        ))}
      </div>

      {extra.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {extra.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => toggle(category)}
              className="flex items-center gap-1 rounded-full border border-primary bg-primary px-3 py-1 text-xs text-primary-foreground"
            >
              {category}
              <X size={11} />
            </button>
          ))}
        </div>
      )}

      <div className="mt-2 flex gap-2">
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom();
            }
          }}
          placeholder="دسته‌بندی دیگر..."
          className="h-9 flex-1 rounded-md border border-border bg-card px-3 text-xs text-foreground outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={addCustom}
          className="rounded-md border border-border px-3 text-xs text-muted-foreground hover:border-primary/50 hover:text-primary"
        >
          افزودن
        </button>
      </div>
    </div>
  );
}
