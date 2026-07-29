"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TableCell, TableRow } from "@/components/ui/table";
import { ToggleStatusButton } from "@/components/admin/toggle-status-button";
import { DeleteButton } from "@/components/admin/delete-button";
import { aiToolTypeLabel } from "@/lib/status-labels";

interface PromptRowProps {
  prompt: {
    id: string;
    name: string;
    type: "IMAGE" | "VIDEO" | "AUDIO";
    promptText: string;
    demoBeforeUrl: string | null;
    demoAfterUrl: string | null;
    active: boolean;
  };
}

export function PromptRow({ prompt }: PromptRowProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/admin/prompts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: prompt.id,
          name: formData.get("name"),
          promptText: formData.get("promptText"),
          demoBeforeUrl: formData.get("demoBeforeUrl") || "",
          demoAfterUrl: formData.get("demoAfterUrl") || "",
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
          <form onSubmit={handleSave} className="space-y-2 py-1">
            <div className="flex flex-wrap items-center gap-2">
              <Input name="name" defaultValue={prompt.name} className="min-w-40 flex-1" required />
              <Input
                name="demoBeforeUrl"
                dir="ltr"
                defaultValue={prompt.demoBeforeUrl ?? ""}
                placeholder="لینک عکس قبل"
                className="min-w-40 flex-1"
              />
              <Input
                name="demoAfterUrl"
                dir="ltr"
                defaultValue={prompt.demoAfterUrl ?? ""}
                placeholder="لینک عکس بعد"
                className="min-w-40 flex-1"
              />
            </div>
            <Textarea name="promptText" defaultValue={prompt.promptText} required />
            <div className="flex items-center gap-2">
              <Button type="submit" size="sm" disabled={loading}>
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
      <TableCell className="font-medium">{prompt.name}</TableCell>
      <TableCell className="text-muted-foreground">{aiToolTypeLabel[prompt.type]}</TableCell>
      <TableCell>
        <Badge variant={prompt.active ? "success" : "outline"}>
          {prompt.active ? "فعال" : "غیرفعال"}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
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
