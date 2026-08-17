import { Play } from "lucide-react";
import { useState } from "react";

import { hydrateVideos } from "@/lib/inuit/media";
import { cn } from "@/lib/utils";
import type { Video } from "@/types";

interface Props {
  videos: Video[];
  viewed: string[];
  onOpen: (video: Video) => void;
}

export function VideoGrid({ videos, viewed, onOpen }: Props) {
  const films = hydrateVideos(videos);
  const [brokenThumbs, setBrokenThumbs] = useState<Record<string, boolean>>({});

  if (!films.length) {
    return (
      <p className="text-taupe text-sm">
        The atelier films are being prepared. Ask again in a moment, or we can find your pair instead.
      </p>
    );
  }

  return (
    <div className="animate-fade-up grid gap-3 sm:grid-cols-3">
      {films.map((video, index) => (
        <button
          key={video.id || String(index)}
          type="button"
          onClick={() => onOpen(video)}
          style={{ animationDelay: `${index * 80}ms` }}
          className="animate-rise group overflow-hidden rounded-lg border border-border bg-card text-left shadow-card transition-shadow duration-500 hover:shadow-panel"
        >
          <div className="relative aspect-video overflow-hidden bg-secondary">
            {brokenThumbs[video.id] ? (
              <div className="h-full w-full bg-secondary" />
            ) : (
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={() => setBrokenThumbs((current) => ({ ...current, [video.id]: true }))}
              />
            )}
            <span className="absolute inset-0 grid place-items-center">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-background/85 backdrop-blur-sm transition-transform duration-500 group-hover:scale-110">
                <Play className="ml-0.5 h-3.5 w-3.5" />
              </span>
            </span>
            <span className="absolute right-2 bottom-2 rounded-full bg-background/85 px-2 py-0.5 text-[0.625rem] backdrop-blur-sm">
              {video.duration}
            </span>
          </div>
          <div className="space-y-1 p-3">
            <p
              className={cn(
                "font-serif text-base leading-tight",
                viewed.includes(video.id) && "text-taupe",
              )}
            >
              {video.title}
            </p>
            <p className="text-taupe text-xs leading-relaxed">{video.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
