"use client";

import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TableCell, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ToggleStatusButton } from "@/components/admin/toggle-status-button";
import { DeleteButton } from "@/components/admin/delete-button";
import { ToolFileUploadField } from "@/components/admin/tool-file-upload-field";
import { VideoUploadField } from "@/components/admin/video-upload-field";
import { formatToman } from "@/lib/format";

interface ToolPackageRowProps {
  toolPackage: {
    id: string;
    title: string;
    category: string | null;
    price: number;
    salePrice: number | null;
    saleCountdownHours: number | null;
    coverImage: string | null;
    demoVideoUrl: string | null;
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
  const [demoVideoUrl, setDemoVideoUrl] = useState(toolPackage.demoVideoUrl ?? "");

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
          salePrice: formData.get("salePrice"),
          saleCountdownHours: formData.get("saleCountdownHours"),
          coverImage,
          demoVideoUrl,
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

  return (
    <>
      <TableRow>
        <TableCell className="font-medium">
          <div className="flex items-center gap-2.5">
            {toolPackage.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={toolPackage.coverImage} alt="" className="aspect-[9/16] h-10 shrink-0 rounded-md object-cover" />
            ) : (
              <div className="aspect-[9/16] h-10 shrink-0 rounded-md bg-secondary" />
            )}
            <div>
              <div>{toolPackage.title}</div>
              {toolPackage.category && <div className="text-xs text-muted-foreground">{toolPackage.category}</div>}
            </div>
          </div>
        </TableCell>
        <TableCell>
          {toolPackage.price === 0 ? (
            "رایگان"
          ) : toolPackage.salePrice != null ? (
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground line-through">{formatToman(toolPackage.price)}</span>
              <span className="font-medium text-primary">{formatToman(toolPackage.salePrice)} تومان</span>
            </div>
          ) : (
            `${formatToman(toolPackage.price)} تومان`
          )}
        </TableCell>
        <TableCell className="text-muted-foreground">{toolPackage.downloadCount} دانلود</TableCell>
        <TableCell>
          <Badge variant={toolPackage.published ? "success" : "outline"}>
            {toolPackage.published ? "منتشرشده" : "پیش‌نویس"}
          </Badge>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1.5">
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

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ویرایش پکیج: {toolPackage.title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor={`tool-edit-title-${toolPackage.id}`}>عنوان پکیج</Label>
                <Input id={`tool-edit-title-${toolPackage.id}`} name="title" defaultValue={toolPackage.title} required />
              </div>
              <div>
                <Label htmlFor={`tool-edit-category-${toolPackage.id}`}>دسته‌بندی</Label>
                <Input id={`tool-edit-category-${toolPackage.id}`} name="category" defaultValue={toolPackage.category ?? ""} />
              </div>
            </div>

            <fieldset className="rounded-lg border border-border p-4">
              <legend className="px-1 text-xs font-semibold text-muted-foreground">قیمت‌گذاری</legend>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor={`tool-edit-price-${toolPackage.id}`}>قیمت (تومان — صفر = رایگان)</Label>
                  <Input
                    id={`tool-edit-price-${toolPackage.id}`}
                    name="price"
                    type="number"
                    min={0}
                    defaultValue={toolPackage.price}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor={`tool-edit-sale-price-${toolPackage.id}`}>قیمت با تخفیف</Label>
                  <Input
                    id={`tool-edit-sale-price-${toolPackage.id}`}
                    name="salePrice"
                    type="number"
                    min={0}
                    defaultValue={toolPackage.salePrice ?? ""}
                    placeholder="اختیاری"
                  />
                </div>
                <div>
                  <Label htmlFor={`tool-edit-sale-countdown-${toolPackage.id}`}>تایمر تخفیف (ساعت)</Label>
                  <Input
                    id={`tool-edit-sale-countdown-${toolPackage.id}`}
                    name="saleCountdownHours"
                    type="number"
                    min={1}
                    defaultValue={toolPackage.saleCountdownHours ?? ""}
                    placeholder="خالی = دائمی"
                  />
                </div>
              </div>
            </fieldset>

            <fieldset className="rounded-lg border border-border p-4">
              <legend className="px-1 text-xs font-semibold text-muted-foreground">فایل قابل دانلود</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">آپلود فایل روی سرور</Label>
                  <ToolFileUploadField value={fileKey.startsWith("http") ? "" : fileKey} onChange={setFileKey} />
                </div>
                <div>
                  <Label htmlFor={`tool-edit-file-url-${toolPackage.id}`} className="text-xs">
                    یا لینک دانلود خارجی
                  </Label>
                  <Input
                    id={`tool-edit-file-url-${toolPackage.id}`}
                    dir="ltr"
                    placeholder="https://drive.google.com/..."
                    value={fileKey.startsWith("http") ? fileKey : ""}
                    disabled={Boolean(fileKey) && !fileKey.startsWith("http")}
                    onChange={(event) => setFileKey(event.target.value)}
                  />
                </div>
              </div>
            </fieldset>

            <fieldset className="rounded-lg border border-border p-4">
              <legend className="px-1 text-xs font-semibold text-muted-foreground">رسانه</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor={`tool-edit-cover-${toolPackage.id}`} className="text-xs">
                    تصویر پکیج (عمودی ۹:۱۶)
                  </Label>
                  <Input id={`tool-edit-cover-${toolPackage.id}`} type="file" accept="image/*" onChange={handleImageChange} />
                  {uploading && <p className="mt-1 text-xs text-muted-foreground">در حال آپلود...</p>}
                  {coverImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={coverImage} alt="" className="mt-2 aspect-[9/16] w-20 rounded-lg object-cover" />
                  )}
                </div>
                <div>
                  <Label className="text-xs">ویدیوی پیش‌نمایش</Label>
                  <VideoUploadField value={demoVideoUrl} onChange={setDemoVideoUrl} />
                </div>
              </div>
            </fieldset>

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
