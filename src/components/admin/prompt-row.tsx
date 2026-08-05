"use client";

import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { Pencil, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TableCell, TableRow } from "@/components/ui/table";
import { ToggleStatusButton } from "@/components/admin/toggle-status-button";
import { DeleteButton } from "@/components/admin/delete-button";
import { aiToolTypeLabel } from "@/lib/status-labels";
import { cn } from "@/lib/utils";

interface PromptRowProps {
  prompt: {
    id: string;
    name: string;
    type: "IMAGE" | "VIDEO" | "AUDIO";
    promptText: string;
    demoBeforeUrl: string | null;
    demoAfterUrl: string | null;
    tags: string[];
    featured: boolean;
    active: boolean;
  };
}

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", "prompts");
  const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "خطا در آپلود تصویر");
  return data.url as string;
}

export function PromptRow({ prompt }: PromptRowProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoBeforeUrl, setDemoBeforeUrl] = useState(prompt.demoBeforeUrl ?? "");
  const [demoAfterUrl, setDemoAfterUrl] = useState(prompt.demoAfterUrl ?? "");

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>, setUrl: (u: string) => void) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      setUrl(await uploadImage(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در آپلود تصویر");
      event.target.value = "";
    } finally {
      setUploading(false);
    }
  }

  async function toggleFeatured() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/prompts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: prompt.id, featured: !prompt.featured }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setError("خطا در تغییر وضعیت ویژه");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const tags = String(formData.get("tags") ?? "")
      .split(/[,،]/)
      .map((t) => t.trim())
      .filter(Boolean);
    try {
      const res = await fetch("/api/admin/prompts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: prompt.id,
          name: formData.get("name"),
          promptText: formData.get("promptText"),
          demoBeforeUrl,
          demoAfterUrl,
          tags,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطا در ذخیره تغییرات");
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ذخیره تغییرات");
    } finally {
      setLoading(false);
    }
  }

  if (editing) {
    return (
      <TableRow>
        <TableCell colSpan={4}>
          <form onSubmit={handleSave} className="space-y-2 py-2">
            <div className="flex flex-wrap items-center gap-2">
              <Input name="name" defaultValue={prompt.name} className="min-w-40 flex-1" required />
              <Input name="tags" defaultValue={prompt.tags.join(", ")} placeholder="تگ‌ها" className="min-w-40 flex-1" />
            </div>
            <Textarea name="promptText" defaultValue={prompt.promptText} required />
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">
                  {prompt.type === "IMAGE" ? "عکس قبل" : "عکس (کاور)"}
                </label>
                <Input type="file" accept="image/*" onChange={(e) => handleImageChange(e, setDemoBeforeUrl)} className="max-w-48" />
              </div>
              {prompt.type === "IMAGE" ? (
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">عکس بعد</label>
                  <Input type="file" accept="image/*" onChange={(e) => handleImageChange(e, setDemoAfterUrl)} className="max-w-48" />
                </div>
              ) : (
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">
                    {prompt.type === "VIDEO" ? "لینک ویدئوی دمو" : "لینک صوت دمو"}
                  </label>
                  <Input
                    type="url"
                    dir="ltr"
                    placeholder="https://..."
                    value={demoAfterUrl}
                    onChange={(e) => setDemoAfterUrl(e.target.value)}
                    className="max-w-64"
                  />
                </div>
              )}
              {uploading && <span className="text-xs text-muted-foreground">در حال آپلود...</span>}
            </div>
            <div className="flex items-center gap-2">
              <Button type="submit" size="sm" disabled={loading || uploading}>
                {loading ? "..." : "ذخیره"}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setEditing(false)}>
                انصراف
              </Button>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </form>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          {prompt.demoAfterUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={prompt.demoAfterUrl} alt="" className="h-8 w-8 rounded object-cover" />
          )}
          {prompt.name}
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">{aiToolTypeLabel[prompt.type]}</TableCell>
      <TableCell>
        <Badge variant={prompt.active ? "success" : "outline"}>
          {prompt.active ? "فعال" : "غیرفعال"}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleFeatured}
            disabled={loading}
            aria-label="نمایش در صفحه اصلی"
            title="نمایش در صفحه اصلی"
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-md border border-border",
              prompt.featured ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Star size={14} fill={prompt.featured ? "currentColor" : "none"} />
          </button>
          <ToggleStatusButton
            endpoint="/api/admin/prompts"
            body={{ id: prompt.id, active: !prompt.active }}
            activeNow={prompt.active}
            onLabel="فعال‌سازی"
            offLabel="غیرفعال‌سازی"
          />
          <Button variant="outline" size="icon" aria-label="ویرایش" onClick={() => setEditing(true)}>
            <Pencil size={14} />
          </Button>
          <DeleteButton
            endpoint="/api/admin/prompts"
            id={prompt.id}
            confirmMessage={`پرامپت «${prompt.name}» حذف شود؟`}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}
