import { createFileRoute } from "@tanstack/react-router";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

export const Route = createFileRoute("/api/public/products")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const { fetchProducts } = await import("@/lib/inuit/db.server");
          const featured = url.searchParams.get("featured");
          const products = await fetchProducts({
            ...(url.searchParams.get("category")
              ? { category: url.searchParams.get("category")! }
              : {}),
            ...(url.searchParams.get("style") ? { style: url.searchParams.get("style")! } : {}),
            ...(url.searchParams.get("color") ? { color: url.searchParams.get("color")! } : {}),
            ...(url.searchParams.get("size") ? { size: url.searchParams.get("size")! } : {}),
            ...(featured !== null ? { featured: featured === "true" } : {}),
          });
          return json({ products });
        } catch {
          return json({ error: "Something went wrong on our side." }, 500);
        }
      },
    },
  },
});
