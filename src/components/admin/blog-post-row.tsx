"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { ToggleStatusButton } from "@/components/admin/toggle-status-button";
import { DeleteButton } from "@/components/admin/delete-button";
import { formatJalali } from "@/lib/format";
import { blogStatusLabel, blogStatusVariant } from "@/lib/status-labels";

interface BlogPostRowProps {
  post: {
    id: string;
    title: string;
    excerpt: string | null;
    views: number;
    status: "DRAFT" | "PUBLISHED";
    publishedAt: Date | null;
  };
}

export function BlogPostRow({ post }: BlogPostRowProps) {
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
      const res = await fetch("/api/admin/blog", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: post.id,
          title: formData.get("title"),
          excerpt: formData.get("excerpt"),
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
        <TableCell colSpan={5}>
          <form onSubmit={handleSave} className="flex flex-wrap items-center gap-2 py-1">
            <Input name="title" defaultValue={post.title} className="min-w-40 flex-1" required />
            <Input name="excerpt" defaultValue={post.excerpt ?? ""} className="min-w-48 flex-1" />
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "..." : "ذخیره"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setEditing(false)}>
              انصراف
            </Button>
            {error && <p className="w-full text-xs text-destructive">{error}</p>}
          </form>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell className="font-medium">{post.title}</TableCell>
      <TableCell className="text-muted-foreground">{post.views.toLocaleString("fa-IR")}</TableCell>
      <TableCell>
        <Badge variant={blogStatusVariant[post.status]}>{blogStatusLabel[post.status]}</Badge>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {post.publishedAt ? formatJalali(post.publishedAt) : "—"}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <ToggleStatusButton
            endpoint="/api/admin/blog"
            body={{ id: post.id, published: post.status !== "PUBLISHED" }}
            activeNow={post.status === "PUBLISHED"}
            onLabel="انتشار"
            offLabel="لغو انتشار"
          />
          <Button variant="outline" size="icon" aria-label="ویرایش" onClick={() => setEditing(true)}>
            <Pencil size={14} />
          </Button>
          <DeleteButton
            endpoint="/api/admin/blog"
            id={post.id}
            confirmMessage={`مقاله «${post.title}» حذف شود؟`}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}
