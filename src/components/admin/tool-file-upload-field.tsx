"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { CheckCircle2, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const ALLOWED_EXTENSIONS = ["zip", "rar", "7z", "pdf"];
const MAX_BYTES = 3 * 1024 * 1024 * 1024;

function uploadWithProgress(file: File, onProgress: (percent: number) => void) {
  return new Promise<{ fileKey: string }>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", `/api/admin/upload-tool-file?filename=${encodeURIComponent(file.name)}`);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && data.fileKey) resolve({ fileKey: data.fileKey });
        else reject(new Error(data.error ?? "خطا در آپلود فایل"));
      } catch {
        reject(new Error("خطا در آپلود فایل"));
      }
    };
    xhr.onerror = () => reject(new Error("اتصال هنگام آپلود فایل قطع شد"));
    xhr.send(file);
  });
}

// Uploads the downloadable asset (a font pack, CapCut effect preset, etc.
// — usually a zip) for a ToolPackage. `value` holds the internal storage
// key ("tool-files/<uuid>.zip"), never a public URL — see
// /api/admin/upload-tool-file and /api/tools/[id]/download.
export function ToolFileUploadField({
  value,
  onChange,
}: {
  value: string;
  onChange: (fileKey: string) => void;
}) {
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setError("فقط فایل‌های ZIP، RAR، 7Z یا PDF پذیرفته می‌شوند.");
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
      const { fileKey } = await uploadWithProgress(file, setProgress);
      onChange(fileKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در آپلود فایل");
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
          {fileName ?? "فایل آپلود شد"}
        </span>
        <Button type="button" variant="outline" size="icon" onClick={clear} aria-label="حذف فایل">
          <X size={13} />
        </Button>
      </div>
    );
  }

  return (
    <div>
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border px-3 py-2.5 text-sm text-muted-foreground hover:border-primary/50 hover:text-foreground">
        <UploadCloud size={15} />
        {progress === null ? "انتخاب فایل قابل دانلود..." : `در حال آپلود... ${progress}٪`}
        <input
          ref={inputRef}
          type="file"
          accept=".zip,.rar,.7z,.pdf"
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
