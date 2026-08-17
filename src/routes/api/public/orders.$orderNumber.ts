import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/orders/$orderNumber")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          const { getOrderByNumber } = await import("@/lib/inuit/admin.server");
          const order = await getOrderByNumber(params.orderNumber);
          if (!order) {
            return new Response(JSON.stringify({ error: "Order not found" }), {
              status: 404,
              headers: { "content-type": "application/json" },
            });
          }
          return new Response(JSON.stringify({ order }), {
            headers: { "content-type": "application/json" },
          });
        } catch {
          return new Response(JSON.stringify({ error: "Something went wrong on our side." }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }
      },
    },
  },
});
