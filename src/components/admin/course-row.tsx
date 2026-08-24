"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { ListVideo, Pencil, Users } from "lucide-react";
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
    coverImage: string | null;
    durationLabel: string | null;
    accessDurationDays: number | null;
    published: boolean;
    _count: { enrollments: number };
  };
}

export function CourseRow({ course }: CourseRowProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState(course.coverImage ?? "");

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "courses");
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
      const res = await fetch("/api/admin/courses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: course.id,
          title: formData.get("title"),
          price: formData.get("price"),
          level: formData.get("level"),
          durationLabel: formData.get("durationLabel"),
          accessDurationDays: formData.get("accessDurationDays"),
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

  if (editing) {
    return (
      <TableRow>
        <TableCell colSpan={5}>
          <form onSubmit={handleSave} className="space-y-2 py-2">
            <div className="flex flex-wrap items-center gap-2">
              <Input name="title" defaultValue={course.title} className="min-w-40 flex-1" required />
              <Input
                name="price"
                type="number"
                min={0}
                defaultValue={course.price}
                className="w-32"
                required
              />
              <Input name="level" defaultValue={course.level ?? ""} placeholder="سطح" className="w-32" />
              <Input
                name="durationLabel"
                defaultValue={course.durationLabel ?? ""}
                placeholder="مدت زمان"
                className="w-32"
              />
              <Input
                name="accessDurationDays"
                type="number"
                min={1}
                defaultValue={course.accessDurationDays ?? ""}
                placeholder="اعتبار دسترسی (روز)"
                className="w-40"
              />
            </div>
            <div className="flex items-center gap-3">
              <Input type="file" accept="image/*" onChange={handleImageChange} className="max-w-56" />
              {uploading && <span className="text-xs text-muted-foreground">در حال آپلود...</span>}
              {coverImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverImage} alt="" className="h-9 w-14 rounded object-cover" />
              )}
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
          {course.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={course.coverImage} alt="" className="h-8 w-12 rounded object-cover" />
          )}
          {course.title}
        </div>
      </TableCell>
      <TableCell>{formatToman(course.price)}</TableCell>
      <TableCell className="text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>{course._count.enrollments}</span>
          {course.accessDurationDays ? (
            <Badge variant="outline">{course.accessDurationDays} روز</Badge>
          ) : (
            <Badge variant="outline">نامحدود</Badge>
          )}
        </div>
      </TableCell>
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
          <Button asChild variant="outline" size="icon" aria-label="دانشجویان و دسترسی">
            <Link href={`/admin/courses/${course.id}/students`}>
              <Users size={14} />
            </Link>
          </Button>
          <DeleteButton
            endpoint="/api/admin/courses"
            id={course.id}
            confirmMessage={`پکیج «${course.title}» حذف شود؟`}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}
