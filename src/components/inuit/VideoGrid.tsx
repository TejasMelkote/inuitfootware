import { useState } from "react";
import { Play } from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Video } from "@/types";

interface Props {
  videos: Video[];
  viewed: string[];
  disabled?: boolean;
  onOpen: (video: Video) => void;
}

export function VideoGrid({ videos, viewed, disabled, onOpen }: Props) {
  const [active, setActive] = useState<Video | null>(null);

  const open = (video: Video) => {
    setActive(video);
    onOpen(video);
  };

  return (
    <>
      <div className="animate-fade-up grid gap-3 sm:grid-cols-3">
        {videos.map((video, index) => (
          <button
            key={video.id}
            type="button"
            disabled={disabled}
            onClick={() => open(video)}
            style={{ animationDelay: `${index * 80}ms` }}
            className="animate-rise group overflow-hidden rounded-lg border border-border bg-card text-left shadow-card transition-shadow duration-500 hover:shadow-panel disabled:opacity-60"
          >
            <div className="relative aspect-video overflow-hidden bg-secondary">
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
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

      <Dialog open={!!active} onOpenChange={(next) => !next && setActive(null)}>
        <DialogContent className="max-w-2xl overflow-hidden p-0">
          {active && (
            <>
              <DialogTitle className="sr-only">{active.title}</DialogTitle>
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video
                src={active.videoUrl}
                poster={active.thumbnailUrl}
                controls
                autoPlay
                playsInline
                className="aspect-video w-full bg-primary"
              />
              <div className="space-y-1 p-5">
                <p className="label-caps">Inside the atelier · {active.duration}</p>
                <h3 className="font-serif text-2xl">{active.title}</h3>
                <p className="text-taupe text-sm">{active.description}</p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
