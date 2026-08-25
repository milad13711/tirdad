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
import { ToolFileUploadField } from "@/components/admin/tool-file-upload-field";
import { formatToman } from "@/lib/format";

interface ToolPackageRowProps {
  toolPackage: {
    id: string;
    title: string;
    category: string | null;
    price: number;
    coverImage: string | null;
    fileUrl: string | null;
    downloadCount: number;
    published: boolean;
  };
}

export function ToolPackageRow({ toolPackage }: ToolPackageRowProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState(toolPackage.coverImage ?? "");
  const [fileKey, setFileKey] = useState(toolPackage.fileUrl ?? "");

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "tools");
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
      const res = await fetch("/api/admin/tools", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: toolPackage.id,
          title: formData.get("title"),
          category: formData.get("category"),
          price: formData.get("price"),
          coverImage,
          fileUrl: fileKey,
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
              <Input name="title" defaultValue={toolPackage.title} className="min-w-40 flex-1" required />
              <Input
                name="price"
                type="number"
                min={0}
                defaultValue={toolPackage.price}
                className="w-32"
                required
              />
              <Input name="category" defaultValue={toolPackage.category ?? ""} placeholder="دسته‌بندی" className="w-40" />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <ToolFileUploadField
                value={fileKey.startsWith("http") ? "" : fileKey}
                onChange={setFileKey}
              />
              <Input
                dir="ltr"
                placeholder="یا لینک دانلود خارجی"
                value={fileKey.startsWith("http") ? fileKey : ""}
                disabled={Boolean(fileKey) && !fileKey.startsWith("http")}
                onChange={(event) => setFileKey(event.target.value)}
              />
              <div className="flex items-center gap-3">
                <Input type="file" accept="image/*" onChange={handleImageChange} className="max-w-56" />
                {uploading && <span className="text-xs text-muted-foreground">در حال آپلود...</span>}
                {coverImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverImage} alt="" className="h-9 w-14 rounded object-cover" />
                )}
              </div>
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
          {toolPackage.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={toolPackage.coverImage} alt="" className="h-8 w-12 rounded object-cover" />
          )}
          <div>
            {toolPackage.title}
            {toolPackage.category && (
              <div className="text-xs text-muted-foreground">{toolPackage.category}</div>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>{toolPackage.price === 0 ? "رایگان" : `${formatToman(toolPackage.price)} تومان`}</TableCell>
      <TableCell className="text-muted-foreground">{toolPackage.downloadCount}</TableCell>
      <TableCell>
        <Badge variant={toolPackage.published ? "success" : "outline"}>
          {toolPackage.published ? "منتشرشده" : "پیش‌نویس"}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <ToggleStatusButton
            endpoint="/api/admin/tools"
            body={{ id: toolPackage.id, published: !toolPackage.published }}
            activeNow={toolPackage.published}
            onLabel="انتشار"
            offLabel="لغو انتشار"
          />
          <Button variant="outline" size="icon" aria-label="ویرایش" onClick={() => setEditing(true)}>
            <Pencil size={14} />
          </Button>
          <DeleteButton
            endpoint="/api/admin/tools"
            id={toolPackage.id}
            confirmMessage={`پکیج «${toolPackage.title}» حذف شود؟`}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}
