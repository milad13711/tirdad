"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VideoUploadField } from "@/components/admin/video-upload-field";
import { ToolFileUploadField } from "@/components/admin/tool-file-upload-field";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function NewLessonForm({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachmentName, setAttachmentName] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/admin/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          title: formData.get("title"),
          videoUrl: videoUrl || formData.get("videoUrl") || undefined,
          attachmentUrl: attachmentUrl || undefined,
          attachmentName: attachmentName || undefined,
          isFreeDemo: formData.get("isFreeDemo") === "on",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطا در ذخیره درس");
      form.reset();
      setVideoUrl("");
      setAttachmentUrl("");
      setAttachmentName("");
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ذخیره درس");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus size={15} />
          افزودن درس
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>افزودن درس جدید</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="lesson-title">عنوان درس</Label>
        <Input id="lesson-title" name="title" placeholder="مثال: جلسه اول: آشنایی" required />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <Label>آپلود فایل ویدیو روی سرور</Label>
          <VideoUploadField value={videoUrl} onChange={setVideoUrl} />
        </div>
        <div>
          <Label htmlFor="lesson-video">یا آدرس ویدیو (embed یوتیوب یا لینک خارجی)</Label>
          <Input
            id="lesson-video"
            name="videoUrl"
            dir="ltr"
            placeholder="https://..."
            disabled={Boolean(videoUrl)}
          />
        </div>
      </div>
      <div className="mt-4">
        <Label>فایل ضمیمه قابل دانلود (اختیاری — اسلاید، جزوه و...)</Label>
        <ToolFileUploadField
          value={attachmentUrl}
          onChange={(key, name) => {
            setAttachmentUrl(key);
            setAttachmentName(key ? (name ?? "") : "");
          }}
        />
      </div>
      <label className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
        <input type="checkbox" name="isFreeDemo" className="h-4 w-4 accent-primary" />
        نمایش به‌عنوان دموی رایگان
      </label>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
          انصراف
        </Button>
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? "در حال ذخیره..." : "ذخیره درس"}
        </Button>
      </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
