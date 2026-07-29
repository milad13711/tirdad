"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { DeleteButton } from "@/components/admin/delete-button";

interface LessonRowProps {
  lesson: {
    id: string;
    order: number;
    title: string;
    videoUrl: string | null;
    isFreeDemo: boolean;
  };
}

export function LessonRow({ lesson }: LessonRowProps) {
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
      const res = await fetch("/api/admin/lessons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: lesson.id,
          title: formData.get("title"),
          videoUrl: formData.get("videoUrl") || "",
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
        <TableCell colSpan={4}>
          <form onSubmit={handleSave} className="flex flex-wrap items-center gap-2 py-1">
            <Input name="title" defaultValue={lesson.title} className="min-w-40 flex-1" required />
            <Input
              name="videoUrl"
              dir="ltr"
              defaultValue={lesson.videoUrl ?? ""}
              placeholder="https://..."
              className="min-w-48 flex-1"
            />
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
      <TableCell className="text-muted-foreground">{lesson.order}</TableCell>
      <TableCell className="font-medium">{lesson.title}</TableCell>
      <TableCell>
        {lesson.isFreeDemo ? <Badge variant="success">دموی رایگان</Badge> : <Badge variant="outline">قفل</Badge>}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
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
  );
}
