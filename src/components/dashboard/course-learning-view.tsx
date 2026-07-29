"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CheckCircle2, Circle, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Lesson {
  id: string;
  title: string;
  order: number;
  videoUrl: string | null;
}

export function CourseLearningView({
  lessons,
  completedLessonIds,
  progress,
}: {
  lessons: Lesson[];
  completedLessonIds: string[];
  progress: number;
}) {
  const router = useRouter();
  const [activeId, setActiveId] = useState(lessons[0]?.id ?? null);
  const [completed, setCompleted] = useState(new Set(completedLessonIds));
  const [loading, setLoading] = useState(false);

  const activeLesson = useMemo(
    () => lessons.find((lesson) => lesson.id === activeId) ?? null,
    [lessons, activeId],
  );

  const isYoutube =
    activeLesson?.videoUrl?.includes("youtube.com") || activeLesson?.videoUrl?.includes("youtu.be");

  async function toggleComplete(lessonId: string, nextValue: boolean) {
    setLoading(true);
    try {
      const res = await fetch("/api/lessons/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, completed: nextValue }),
      });
      if (res.ok) {
        setCompleted((prev) => {
          const next = new Set(prev);
          if (nextValue) next.add(lessonId);
          else next.delete(lessonId);
          return next;
        });
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="mb-4 aspect-video overflow-hidden rounded-xl border border-border bg-black">
          {activeLesson?.videoUrl ? (
            isYoutube ? (
              <iframe
                key={activeLesson.id}
                src={activeLesson.videoUrl.replace("watch?v=", "embed/")}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video key={activeLesson.id} src={activeLesson.videoUrl} controls className="h-full w-full" />
            )
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              ویدیویی برای این درس ثبت نشده است.
            </div>
          )}
        </div>

        {activeLesson && (
          <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
            <h3 className="font-bold">{activeLesson.title}</h3>
            <Button
              size="sm"
              variant={completed.has(activeLesson.id) ? "outline" : "default"}
              disabled={loading}
              onClick={() => toggleComplete(activeLesson.id, !completed.has(activeLesson.id))}
            >
              {completed.has(activeLesson.id) ? (
                <>
                  <CheckCircle2 size={15} />
                  تماشا شده
                </>
              ) : (
                "علامت‌گذاری به‌عنوان تماشا شده"
              )}
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold">فهرست دروس</span>
          <span className="text-muted-foreground">{progress}٪</span>
        </div>
        <Progress value={progress} className="mb-4" />
        <div className="space-y-1">
          {lessons.map((lesson) => (
            <button
              key={lesson.id}
              type="button"
              onClick={() => setActiveId(lesson.id)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-right text-sm transition-colors",
                lesson.id === activeId
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              {completed.has(lesson.id) ? (
                <CheckCircle2 size={16} className="shrink-0 text-emerald-500" />
              ) : lesson.id === activeId ? (
                <PlayCircle size={16} className="shrink-0" />
              ) : (
                <Circle size={16} className="shrink-0" />
              )}
              <span className="flex-1 truncate">{lesson.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
