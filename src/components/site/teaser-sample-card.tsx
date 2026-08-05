"use client";

import { useState } from "react";
import { PlayCircle } from "lucide-react";

export function TeaserSampleCard({
  title,
  videoUrl,
  coverImage,
}: {
  title: string;
  videoUrl: string | null;
  coverImage: string | null;
}) {
  const [playing, setPlaying] = useState(false);

  if (videoUrl && playing) {
    return (
      <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-black">
        <video
          src={videoUrl}
          controls
          autoPlay
          playsInline
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  if (videoUrl) {
    return (
      <button
        type="button"
        onClick={() => setPlaying(true)}
        className="group relative block aspect-video w-full overflow-hidden rounded-xl border border-border bg-secondary text-start"
      >
        {coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverImage} alt={title} className="h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/40">
          <PlayCircle size={36} className="text-white" />
        </div>
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-sm font-medium text-white">
          {title}
        </span>
      </button>
    );
  }

  return (
    <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-secondary">
      {coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={coverImage} alt={title} className="h-full w-full object-cover" />
      )}
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-sm font-medium text-white">
        {title}
      </span>
    </div>
  );
}
