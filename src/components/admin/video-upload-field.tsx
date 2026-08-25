"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { CheckCircle2, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const ACCEPTED_TYPES = ["video/mp4", "video/webm", "video/ogg"];
const MAX_BYTES = 3 * 1024 * 1024 * 1024;

// Uploads via XHR (not fetch) specifically to get upload-progress events —
// course videos can be hundreds of MB to a few GB, so a bare "در حال
// آپلود..." spinner with no feedback for minutes would read as broken.
function uploadWithProgress(file: File, onProgress: (percent: number) => void) {
  return new Promise<{ url: string }>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", "/api/admin/upload-video");
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && data.url) resolve({ url: data.url });
        else reject(new Error(data.error ?? "خطا در آپلود ویدیو"));
      } catch {
        reject(new Error("خطا در آپلود ویدیو"));
      }
    };
    xhr.onerror = () => reject(new Error("اتصال هنگام آپلود ویدیو قطع شد"));
    xhr.send(file);
  });
}

export function VideoUploadField({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("فقط فایل‌های MP4، WebM یا OGG پذیرفته می‌شوند.");
      event.target.value = "";
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("حجم فایل نباید بیشتر از ۳ گیگابایت باشد.");
      event.target.value = "";
      return;
    }

    setFileName(file.name);
    setProgress(0);
    try {
      const { url } = await uploadWithProgress(file, setProgress);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در آپلود ویدیو");
      setFileName(null);
    } finally {
      setProgress(null);
      event.target.value = "";
    }
  }

  function clear() {
    onChange("");
    setFileName(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  if (value) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm">
        <span className="flex items-center gap-2 truncate text-emerald-500">
          <CheckCircle2 size={15} className="shrink-0" />
          {fileName ?? "ویدیو آپلود شد"}
        </span>
        <Button type="button" variant="outline" size="icon" onClick={clear} aria-label="حذف ویدیو">
          <X size={13} />
        </Button>
      </div>
    );
  }

  return (
    <div>
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border px-3 py-2.5 text-sm text-muted-foreground hover:border-primary/50 hover:text-foreground">
        <UploadCloud size={15} />
        {progress === null ? "انتخاب فایل ویدیو..." : `در حال آپلود... ${progress}٪`}
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/webm,video/ogg"
          className="hidden"
          onChange={handleFileChange}
          disabled={progress !== null}
        />
      </label>
      {progress !== null && (
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
