"use client";

import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TableCell, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

  return (
    <>
      <TableRow>
        <TableCell className="font-medium">
          <div className="flex items-center gap-2.5">
            {post.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.coverImage} alt="" className="h-10 w-14 shrink-0 rounded-md object-cover" />
            ) : (
              <div className="h-10 w-14 shrink-0 rounded-md bg-secondary" />
            )}
            {post.title}
          </div>
        </TableCell>
        <TableCell className="text-muted-foreground">{post.views.toLocaleString("fa-IR")} بازدید</TableCell>
        <TableCell>
          <Badge variant={blogStatusVariant[post.status]}>{blogStatusLabel[post.status]}</Badge>
        </TableCell>
        <TableCell className="text-muted-foreground">
          {post.publishedAt ? formatJalali(post.publishedAt) : "—"}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1.5">
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

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ویرایش مقاله: {post.title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label htmlFor={`post-edit-title-${post.id}`}>عنوان مقاله</Label>
              <Input id={`post-edit-title-${post.id}`} name="title" defaultValue={post.title} required />
            </div>
            <div>
              <Label htmlFor={`post-edit-excerpt-${post.id}`}>خلاصه</Label>
              <Input id={`post-edit-excerpt-${post.id}`} name="excerpt" defaultValue={post.excerpt ?? ""} />
            </div>

            <fieldset className="rounded-lg border border-border p-4">
              <legend className="px-1 text-xs font-semibold text-muted-foreground">سئو</legend>
              <div className="space-y-3">
                <div>
                  <Label htmlFor={`post-edit-meta-title-${post.id}`}>عنوان سئو (Meta Title)</Label>
                  <Input id={`post-edit-meta-title-${post.id}`} name="metaTitle" defaultValue={post.metaTitle ?? ""} />
                </div>
                <div>
                  <Label htmlFor={`post-edit-meta-desc-${post.id}`}>توضیحات سئو (Meta Description)</Label>
                  <Textarea
                    id={`post-edit-meta-desc-${post.id}`}
                    name="metaDescription"
                    defaultValue={post.metaDescription ?? ""}
                    rows={2}
                  />
                </div>
              </div>
            </fieldset>

            <div>
              <Label htmlFor={`post-edit-cover-${post.id}`}>تصویر شاخص</Label>
              <Input id={`post-edit-cover-${post.id}`} type="file" accept="image/*" onChange={handleImageChange} />
              {uploading && <p className="mt-1 text-xs text-muted-foreground">در حال آپلود...</p>}
              {coverImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverImage} alt="" className="mt-2 h-24 w-full rounded-lg object-cover" />
              )}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditing(false)}>
                انصراف
              </Button>
              <Button type="submit" size="sm" disabled={loading || uploading}>
                {loading ? "در حال ذخیره..." : "ذخیره تغییرات"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
