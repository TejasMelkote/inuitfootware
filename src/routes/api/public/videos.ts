import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/videos")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const { fetchVideos } = await import("@/lib/inuit/db.server");
          const videos = await fetchVideos();
          return new Response(JSON.stringify({ videos }), {
            headers: { "content-type": "application/json" },
          });
        } catch {
          return new Response(
            JSON.stringify({ error: "That craftsmanship story is temporarily unavailable." }),
            { status: 500, headers: { "content-type": "application/json" } },
          );
        }
      },
    },
  },
});
