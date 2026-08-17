import type { Video } from "@/types";

export const ATELIER_FILMS = [
  {
    key: "leather",
    titlePattern: /leather|select|hide/i,
    videoUrl: "/atelier/leather.mp4",
    thumbnailUrl: "/atelier/leather.jpg",
    duration: "0:12",
  },
  {
    key: "assembly",
    titlePattern: /assembl|stitch|construct/i,
    videoUrl: "/atelier/assembly.mp4",
    thumbnailUrl: "/atelier/assembly.jpg",
    duration: "0:12",
  },
  {
    key: "finish",
    titlePattern: /finish|polish|inspect/i,
    videoUrl: "/atelier/finish.mp4",
    thumbnailUrl: "/atelier/finish.jpg",
    duration: "0:12",
  },
] as const;

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|avif|svg)(\?|$)/i;
const VIDEO_EXT = /\.(mp4|webm|ogg|m4v|mov)(\?|$)/i;
const DEAD_HOSTS = /gtv-videos-bucket|forbigger|sample\/forbigger/i;

export function isPlayableVideoUrl(url?: string | null): url is string {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (IMAGE_EXT.test(trimmed) || DEAD_HOSTS.test(trimmed)) return false;
  if (trimmed.startsWith("/atelier/") && VIDEO_EXT.test(trimmed)) return true;
  return VIDEO_EXT.test(trimmed);
}

function filmFor(video: Pick<Video, "title" | "order">, index = 0) {
  return (
    ATELIER_FILMS.find((film) => film.titlePattern.test(video.title)) ??
    ATELIER_FILMS[Math.max(0, (video.order ?? index + 1) - 1)] ??
    ATELIER_FILMS[0]
  );
}

export function hydrateVideo(video: Video, index = 0): Video {
  const film = filmFor(video, index);
  const thumbnail =
    video.thumbnailUrl && !DEAD_HOSTS.test(video.thumbnailUrl)
      ? video.thumbnailUrl
      : film.thumbnailUrl;
  return {
    ...video,
    thumbnailUrl: thumbnail,
    videoUrl: isPlayableVideoUrl(video.videoUrl) ? video.videoUrl : film.videoUrl,
  };
}

export function hydrateVideos(videos: Video[] | null | undefined): Video[] {
  return (videos ?? []).map((video, index) => hydrateVideo(video, index));
}

export function fallbackSources(video: Video): string[] {
  const hydrated = hydrateVideo(video);
  const film = filmFor(video);
  return [...new Set([hydrated.videoUrl, film.videoUrl].filter(isPlayableVideoUrl))];
}
