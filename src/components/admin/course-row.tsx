"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { ListVideo, Pencil, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TableCell, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ToggleStatusButton } from "@/components/admin/toggle-status-button";
import { DeleteButton } from "@/components/admin/delete-button";
import { formatToman } from "@/lib/format";

interface CourseRowProps {
  course: {
    id: string;
    title: string;
    description: string | null;
    price: number;
    salePrice: number | null;
    saleCountdownHours: number | null;
    level: string | null;
    coverImage: string | null;
    durationLabel: string | null;
    accessDurationDays: number | null;
    displayEnrollmentOffset: number;
    published: boolean;
    _count: { enrollments: number; lessons: number };
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
          description: formData.get("description"),
          price: formData.get("price"),
          salePrice: formData.get("salePrice"),
          saleCountdownHours: formData.get("saleCountdownHours"),
          level: formData.get("level"),
          durationLabel: formData.get("durationLabel"),
          accessDurationDays: formData.get("accessDurationDays"),
          displayEnrollmentOffset: formData.get("displayEnrollmentOffset") || 0,
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

  return (
    <>
      <TableRow>
        <TableCell className="font-medium">
          <div className="flex items-center gap-2.5">
            {course.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={course.coverImage} alt="" className="h-10 w-14 shrink-0 rounded-md object-cover" />
            ) : (
              <div className="h-10 w-14 shrink-0 rounded-md bg-secondary" />
            )}
            <div>
              <div>{course.title}</div>
              {course.level && <div className="text-xs text-muted-foreground">{course.level}</div>}
            </div>
          </div>
        </TableCell>
        <TableCell>
          {course.salePrice != null ? (
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground line-through">{formatToman(course.price)}</span>
              <span className="font-medium text-primary">{formatToman(course.salePrice)} تومان</span>
            </div>
          ) : (
            `${formatToman(course.price)} تومان`
          )}
        </TableCell>
        <TableCell className="text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>{course._count.enrollments + course.displayEnrollmentOffset} دانشجو</span>
            <Badge variant="outline">{course.accessDurationDays ? `${course.accessDurationDays} روز` : "نامحدود"}</Badge>
          </div>
        </TableCell>
        <TableCell>
          {course._count.lessons === 0 ? (
            <Badge variant="destructive">بدون محتوا</Badge>
          ) : (
            <span className="text-sm text-muted-foreground">{course._count.lessons} درس</span>
          )}
        </TableCell>
        <TableCell>
          <Badge variant={course.published ? "success" : "outline"}>
            {course.published ? "منتشرشده" : "پیش‌نویس"}
          </Badge>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1.5">
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

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ویرایش پکیج: {course.title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor={`edit-title-${course.id}`}>عنوان پکیج</Label>
                <Input id={`edit-title-${course.id}`} name="title" defaultValue={course.title} required />
              </div>
              <div>
                <Label htmlFor={`edit-level-${course.id}`}>سطح</Label>
                <Input id={`edit-level-${course.id}`} name="level" defaultValue={course.level ?? ""} />
              </div>
              <div>
                <Label htmlFor={`edit-duration-${course.id}`}>مدت زمان آموزش</Label>
                <Input id={`edit-duration-${course.id}`} name="durationLabel" defaultValue={course.durationLabel ?? ""} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor={`edit-description-${course.id}`}>توضیحات</Label>
                <Textarea
                  id={`edit-description-${course.id}`}
                  name="description"
                  defaultValue={course.description ?? ""}
                  rows={3}
                />
              </div>
            </div>

            <fieldset className="rounded-lg border border-border p-4">
              <legend className="px-1 text-xs font-semibold text-muted-foreground">قیمت‌گذاری</legend>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor={`edit-price-${course.id}`}>قیمت (تومان)</Label>
                  <Input id={`edit-price-${course.id}`} name="price" type="number" min={0} defaultValue={course.price} required />
                </div>
                <div>
                  <Label htmlFor={`edit-sale-price-${course.id}`}>قیمت با تخفیف</Label>
                  <Input
                    id={`edit-sale-price-${course.id}`}
                    name="salePrice"
                    type="number"
                    min={0}
                    defaultValue={course.salePrice ?? ""}
                    placeholder="اختیاری"
                  />
                </div>
                <div>
                  <Label htmlFor={`edit-sale-countdown-${course.id}`}>تایمر تخفیف (ساعت)</Label>
                  <Input
                    id={`edit-sale-countdown-${course.id}`}
                    name="saleCountdownHours"
                    type="number"
                    min={1}
                    defaultValue={course.saleCountdownHours ?? ""}
                    placeholder="خالی = دائمی"
                  />
                </div>
              </div>
            </fieldset>

            <fieldset className="rounded-lg border border-border p-4">
              <legend className="px-1 text-xs font-semibold text-muted-foreground">دسترسی و دانشجویان</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor={`edit-access-${course.id}`}>مدت اعتبار دسترسی (روز)</Label>
                  <Input
                    id={`edit-access-${course.id}`}
                    name="accessDurationDays"
                    type="number"
                    min={1}
                    defaultValue={course.accessDurationDays ?? ""}
                    placeholder="خالی = نامحدود"
                  />
                </div>
                <div>
                  <Label htmlFor={`edit-offset-${course.id}`}>تعداد دانشجوی اولیه (خارج از سایت)</Label>
                  <Input
                    id={`edit-offset-${course.id}`}
                    name="displayEnrollmentOffset"
                    type="number"
                    min={0}
                    defaultValue={course.displayEnrollmentOffset}
                  />
                </div>
              </div>
            </fieldset>

            <div>
              <Label htmlFor={`edit-cover-${course.id}`}>تصویر پکیج</Label>
              <Input id={`edit-cover-${course.id}`} type="file" accept="image/*" onChange={handleImageChange} />
              {uploading && <p className="mt-1 text-xs text-muted-foreground">در حال آپلود...</p>}
              {coverImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverImage} alt="" className="mt-2 h-20 w-32 rounded-lg object-cover" />
              )}
            </div>

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
