"use client";

import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
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
    coverImage: string | null;
    metaTitle: string | null;
    metaDescription: string | null;
    views: number;
    status: "DRAFT" | "PUBLISHED";
    publishedAt: Date | null;
  };
}

export function BlogPostRow({ post }: BlogPostRowProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState(post.coverImage ?? "");

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطا در آپلود تصویر");
      setCoverImage(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در آپلود تصویر");
      event.target.value = "";
    } finally {
      setUploading(false);
    }
  }

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
          metaTitle: formData.get("metaTitle"),
          metaDescription: formData.get("metaDescription"),
          coverImage,
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
          <form onSubmit={handleSave} className="space-y-2 py-2">
            <div className="flex flex-wrap items-center gap-2">
              <Input name="title" defaultValue={post.title} className="min-w-40 flex-1" required />
              <Input name="excerpt" defaultValue={post.excerpt ?? ""} className="min-w-48 flex-1" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                name="metaTitle"
                defaultValue={post.metaTitle ?? ""}
                placeholder="عنوان سئو"
                className="min-w-40 flex-1"
              />
              <Input
                name="metaDescription"
                defaultValue={post.metaDescription ?? ""}
                placeholder="توضیحات سئو"
                className="min-w-48 flex-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <Input type="file" accept="image/*" onChange={handleImageChange} className="max-w-56" />
              {uploading && <span className="text-xs text-muted-foreground">در حال آپلود...</span>}
              {coverImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverImage} alt="" className="h-9 w-14 rounded object-cover" />
              )}
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
          {post.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.coverImage} alt="" className="h-8 w-12 rounded object-cover" />
          )}
          {post.title}
        </div>
      </TableCell>
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
