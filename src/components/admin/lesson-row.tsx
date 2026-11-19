"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TableCell, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DeleteButton } from "@/components/admin/delete-button";
import { VideoUploadField } from "@/components/admin/video-upload-field";
import { ToolFileUploadField } from "@/components/admin/tool-file-upload-field";

interface LessonRowProps {
  lesson: {
    id: string;
    order: number;
    title: string;
    videoUrl: string | null;
    attachmentUrl: string | null;
    attachmentName: string | null;
    isFreeDemo: boolean;
  };
}

export function LessonRow({ lesson }: LessonRowProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState(lesson.videoUrl ?? "");
  const [attachmentUrl, setAttachmentUrl] = useState(lesson.attachmentUrl ?? "");
  const [attachmentName, setAttachmentName] = useState(lesson.attachmentName ?? "");

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/admin/lessons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: lesson.id,
          title: formData.get("title"),
          videoUrl: videoUrl || formData.get("videoUrl") || "",
          attachmentUrl,
          attachmentName,
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
        <TableCell className="text-muted-foreground">{lesson.order}</TableCell>
        <TableCell className="font-medium">{lesson.title}</TableCell>
        <TableCell>
          {lesson.isFreeDemo ? <Badge variant="success">دموی رایگان</Badge> : <Badge variant="outline">قفل</Badge>}
        </TableCell>
        <TableCell className="text-muted-foreground">{lesson.attachmentName ?? "—"}</TableCell>
        <TableCell>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="icon" aria-label="ویرایش" onClick={() => setEditing(true)}>
              <Pencil size={14} />
            </Button>
            <DeleteButton
              endpoint="/api/admin/lessons"
              id={lesson.id}
              confirmMessage={`درس «${lesson.title}» حذف شود؟`}
            />
          </div>
        </TableCell>
      </TableRow>

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ویرایش درس: {lesson.title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label htmlFor={`lesson-edit-title-${lesson.id}`}>عنوان درس</Label>
              <Input id={`lesson-edit-title-${lesson.id}`} name="title" defaultValue={lesson.title} required />
            </div>
            <div>
              <Label>آپلود فایل ویدیو روی سرور</Label>
              <VideoUploadField value={videoUrl.startsWith("/api/uploads/") ? videoUrl : ""} onChange={setVideoUrl} />
            </div>
            <div>
              <Label htmlFor={`lesson-edit-video-${lesson.id}`}>یا آدرس ویدیو (embed یوتیوب یا لینک خارجی)</Label>
              <Input
                id={`lesson-edit-video-${lesson.id}`}
                name="videoUrl"
                dir="ltr"
                defaultValue={videoUrl.startsWith("/api/uploads/") ? "" : videoUrl}
                placeholder="https://..."
                disabled={videoUrl.startsWith("/api/uploads/")}
                onChange={(event) => setVideoUrl(event.target.value)}
              />
            </div>
            <div>
              <Label>فایل ضمیمه قابل دانلود</Label>
              <ToolFileUploadField
                value={attachmentUrl}
                onChange={(key, name) => {
                  setAttachmentUrl(key);
                  setAttachmentName(key ? (name ?? "") : "");
                }}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditing(false)}>
                انصراف
              </Button>
              <Button type="submit" size="sm" disabled={loading}>
                {loading ? "در حال ذخیره..." : "ذخیره تغییرات"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
