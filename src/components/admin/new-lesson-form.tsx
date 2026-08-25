"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VideoUploadField } from "@/components/admin/video-upload-field";

export function NewLessonForm({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");

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
          isFreeDemo: formData.get("isFreeDemo") === "on",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "خطا در ذخیره درس");
      form.reset();
      setVideoUrl("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ذخیره درس");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="rounded-xl border border-border bg-card p-6" onSubmit={handleSubmit}>
      <div className="mb-5 flex items-center gap-2">
        <Plus size={16} className="text-primary" />
        <h3 className="font-bold">افزودن درس جدید</h3>
      </div>
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
      <label className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
        <input type="checkbox" name="isFreeDemo" className="h-4 w-4 accent-primary" />
        نمایش به‌عنوان دموی رایگان
      </label>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      <Button className="mt-5" type="submit" disabled={loading}>
        {loading ? "در حال ذخیره..." : "ذخیره درس"}
      </Button>
    </form>
  );
}
