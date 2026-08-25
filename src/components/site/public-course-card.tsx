import Link from "next/link";
import { Clock, PlayCircle } from "lucide-react";
import { formatToman } from "@/lib/format";

export interface PublicCourse {
  id: string;
  slug: string;
  title: string;
  coverImage: string | null;
  durationLabel: string | null;
  price: number;
  lessons: { videoUrl: string | null }[];
}

export function PublicCourseCard({ course }: { course: PublicCourse }) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/50"
    >
      <div className="aspect-video w-full overflow-hidden bg-secondary">
        {course.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.coverImage}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <PlayCircle size={32} />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="mb-4 text-lg font-bold leading-8 transition-colors group-hover:text-primary">
          {course.title}
        </h3>
        {course.durationLabel && (
          <span className="mb-6 flex w-fit items-center gap-1.5 text-sm text-muted-foreground">
            <Clock size={15} /> {course.durationLabel}
          </span>
        )}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-5">
          <span className="text-lg font-extrabold">{formatToman(course.price)}</span>
          <span className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-primary transition-colors group-hover:border-primary/50">
            مشاهده جزئیات
          </span>
        </div>
      </div>
    </Link>
  );
}
