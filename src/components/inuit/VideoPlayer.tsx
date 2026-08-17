import { useEffect, useRef, useState } from "react";
import { Play, Volume2, VolumeX } from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { fallbackSources, hydrateVideo, isPlayableVideoUrl } from "@/lib/inuit/media";
import type { Video } from "@/types";

interface Props {
  video: Video | null;
  onClose: () => void;
}

type Status = "loading" | "playing" | "paused" | "ended" | "error";

export function VideoPlayer({ video, onClose }: Props) {
  const node = useRef<HTMLVideoElement>(null);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [status, setStatus] = useState<Status>("loading");
  const [muted, setMuted] = useState(true);
  const [thumbFailed, setThumbFailed] = useState(false);

  const hydrated = video ? hydrateVideo(video) : null;
  const sources = hydrated ? fallbackSources(hydrated) : [];
  const src = sources[sourceIndex];
  const poster = !thumbFailed ? hydrated?.thumbnailUrl : undefined;

  useEffect(() => {
    setSourceIndex(0);
    setStatus("loading");
    setMuted(true);
    setThumbFailed(false);
  }, [video?.id]);

  useEffect(() => {
    const el = node.current;
    if (!el || !src) return;
    el.muted = true;
    const attempt = el.play();
    if (attempt) {
      void attempt.then(() => setStatus("playing")).catch(() => setStatus("paused"));
    }
    const timeout = window.setTimeout(() => {
      if (el.paused) setStatus((current) => (current === "loading" ? "paused" : current));
    }, 2500);
    return () => {
      window.clearTimeout(timeout);
      el.pause();
    };
  }, [src, video?.id]);

  const close = () => {
    node.current?.pause();
    onClose();
  };

  const togglePlay = () => {
    const el = node.current;
    if (!el) return;
    if (el.paused) {
      void el.play().then(() => setStatus("playing")).catch(() => setStatus("paused"));
    } else {
      el.pause();
      setStatus("paused");
    }
  };

  const tryNextSource = () => {
    if (sourceIndex + 1 < sources.length) {
      setSourceIndex((index) => index + 1);
      setStatus("loading");
      return;
    }
    setStatus("error");
  };

  return (
    <Dialog open={!!video} onOpenChange={(open) => !open && close()}>
      <DialogContent className="z-[80] max-w-2xl gap-0 overflow-hidden p-0">
        {hydrated && (
          <>
            <DialogTitle className="sr-only">{hydrated.title}</DialogTitle>
            <div className="relative aspect-video bg-primary">
              {src && isPlayableVideoUrl(src) && status !== "error" ? (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video
                  key={src}
                  ref={node}
                  src={src}
                  poster={poster}
                  controls
                  playsInline
                  preload="auto"
                  muted={muted}
                  className="h-full w-full bg-primary object-cover"
                  onPlaying={() => setStatus("playing")}
                  onPause={() => setStatus((current) => (current === "ended" ? current : "paused"))}
                  onEnded={() => setStatus("ended")}
                  onError={tryNextSource}
                  onClick={togglePlay}
                />
              ) : (
                <img
                  src={poster || hydrated.thumbnailUrl}
                  alt={hydrated.title}
                  className="h-full w-full object-cover"
                  onError={() => setThumbFailed(true)}
                />
              )}

              {status === "loading" && (
                <div className="pointer-events-none absolute inset-0 grid place-items-center bg-primary/30">
                  <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                </div>
              )}

              {(status === "paused" || status === "ended") && src && status !== "error" && (
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label={status === "ended" ? "Watch again" : "Play film"}
                  className="absolute inset-0 grid place-items-center bg-primary/25"
                >
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-background/90 shadow-panel">
                    <Play className="ml-0.5 h-6 w-6" />
                  </span>
                </button>
              )}

              {status === "error" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-primary px-6 text-center">
                  <p className="font-serif text-xl text-primary-foreground">This film could not be played.</p>
                  <p className="text-xs text-primary-foreground/70">
                    The still from the atelier is below — you can close and try another film.
                  </p>
                  {poster && (
                    <img src={poster} alt="" className="mt-2 max-h-40 rounded-md object-cover" />
                  )}
                </div>
              )}

              {src && status !== "error" && (
                <button
                  type="button"
                  onClick={() => {
                    const el = node.current;
                    if (!el) return;
                    const next = !muted;
                    el.muted = next;
                    setMuted(next);
                  }}
                  aria-label={muted ? "Unmute" : "Mute"}
                  className="absolute bottom-3 left-3 grid h-9 w-9 place-items-center rounded-full bg-background/85 text-foreground backdrop-blur-sm"
                >
                  {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
              )}
            </div>
            <div className="space-y-1 p-5">
              <p className="label-caps">Inside the atelier · {hydrated.duration}</p>
              <h3 className="font-serif text-2xl">{hydrated.title}</h3>
              <p className="text-taupe text-sm">{hydrated.description}</p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
