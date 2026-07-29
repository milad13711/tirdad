"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ListVideo, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { ToggleStatusButton } from "@/components/admin/toggle-status-button";
import { DeleteButton } from "@/components/admin/delete-button";
import { formatToman } from "@/lib/format";

interface CourseRowProps {
  course: {
    id: string;
    title: string;
    price: number;
    level: string | null;
    published: boolean;
    _count: { enrollments: number };
  };
}

export function CourseRow({ course }: CourseRowProps) {
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
      const res = await fetch("/api/admin/courses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: course.id,
          title: formData.get("title"),
          price: formData.get("price"),
          level: formData.get("level"),
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
          <form onSubmit={handleSave} className="flex flex-wrap items-center gap-2 py-1">
            <Input name="title" defaultValue={course.title} className="min-w-40 flex-1" required />
            <Input
              name="price"
              type="number"
              min={0}
              defaultValue={course.price}
              className="w-32"
              required
            />
            <Input name="level" defaultValue={course.level ?? ""} className="w-32" />
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
      <TableCell className="font-medium">{course.title}</TableCell>
      <TableCell>{formatToman(course.price)}</TableCell>
      <TableCell className="text-muted-foreground">{course._count.enrollments}</TableCell>
      <TableCell>
        <Badge variant={course.published ? "success" : "outline"}>
          {course.published ? "منتشرشده" : "پیش‌نویس"}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <ToggleStatusButton
            endpoint="/api/admin/courses"
            body={{ id: course.id, published: !course.published }}
            activeNow={course.published}
            onLabel="انتشار"
            offLabel="لغو انتشار"
          />
          <Button variant="outline" size="icon" aria-label="ویرایش" onClick={() => setEditing(true)}>
            <Pencil size={14} />
          </Button>
          <Button asChild variant="outline" size="icon" aria-label="مدیریت دروس">
            <Link href={`/admin/courses/${course.id}/lessons`}>
              <ListVideo size={14} />
            </Link>
          </Button>
          <DeleteButton
            endpoint="/api/admin/courses"
            id={course.id}
            confirmMessage={`دوره «${course.title}» حذف شود؟`}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}
