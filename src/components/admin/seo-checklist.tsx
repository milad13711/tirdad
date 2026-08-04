import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SeoChecklistProps {
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  content: string;
  hasCoverImage: boolean;
}

function Item({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className={cn("flex items-center gap-2", ok ? "text-primary" : "text-muted-foreground")}>
      {ok ? <Check size={14} /> : <X size={14} />}
      {label}
    </li>
  );
}

// Live checklist against basic on-page SEO conventions — not a hard gate,
// just a nudge so authors notice a missing meta description or an oversized
// title before hitting publish.
export function SeoChecklist({
  title,
  metaTitle,
  metaDescription,
  excerpt,
  content,
  hasCoverImage,
}: SeoChecklistProps) {
  const effectiveTitle = metaTitle || title;
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  const checks = [
    {
      ok: effectiveTitle.length >= 30 && effectiveTitle.length <= 60,
      label: `عنوان سئو بین ۳۰ تا ۶۰ کاراکتر (فعلی: ${effectiveTitle.length})`,
    },
    {
      ok: metaDescription.length >= 120 && metaDescription.length <= 160,
      label: `توضیحات متا بین ۱۲۰ تا ۱۶۰ کاراکتر (فعلی: ${metaDescription.length})`,
    },
    { ok: excerpt.trim().length > 0, label: "خلاصه مقاله وارد شده" },
    { ok: hasCoverImage, label: "تصویر شاخص انتخاب شده" },
    { ok: wordCount >= 300, label: `متن حداقل ۳۰۰ کلمه (فعلی: ${wordCount})` },
  ];

  return (
    <div className="rounded-lg border border-border bg-secondary/40 p-4">
      <p className="mb-3 text-xs font-semibold text-muted-foreground">چک‌لیست سئو</p>
      <ul className="space-y-1.5 text-xs">
        {checks.map((check) => (
          <Item key={check.label} ok={check.ok} label={check.label} />
        ))}
      </ul>
    </div>
  );
}
