import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const filterSchema = z
  .object({
    category: z.string().optional(),
    style: z.string().optional(),
    color: z.string().optional(),
    size: z.string().optional(),
    featured: z.boolean().optional(),
  })
  .optional();

const prefsSchema = z.object({
  category: z.string().optional(),
  style: z.string().optional(),
  color: z.string().optional(),
  size: z.string().optional(),
  occasion: z.string().optional(),
});

const turnSchema = z.object({
  conversationId: z.string().uuid(),
  action: z.string().max(200).optional(),
  label: z.string().max(200).optional(),
  text: z.string().max(1000).optional(),
  delivery: z
    .object({
      name: z.string().max(120).optional(),
      phone: z.string().max(40).optional(),
      email: z.string().max(160).optional(),
      address: z.string().max(400).optional(),
      city: z.string().max(120).optional(),
      state: z.string().max(120).optional(),
      pinCode: z.string().max(12).optional(),
    })
    .optional(),
});

export const listProducts = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => filterSchema.parse(data))
  .handler(async ({ data }) => {
    const { fetchProducts } = await import("./db.server");
    return fetchProducts(data ?? {});
  });

export const listVideos = createServerFn({ method: "GET" }).handler(async () => {
  const { fetchVideos } = await import("./db.server");
  return fetchVideos();
});

export const startConversation = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ sessionId: z.string().min(6).max(80) }).parse(data))
  .handler(async ({ data }) => {
    const { createConversation } = await import("./conversation.server");
    return createConversation(data.sessionId);
  });

export const fetchConversation = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { loadConversation } = await import("./conversation.server");
    return loadConversation(data.id);
  });

export const sendTurn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => turnSchema.parse(data))
  .handler(async ({ data }) => {
    const { handleTurn } = await import("./conversation.server");
    return handleTurn(data);
  });

export const restartConversation = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ conversationId: z.string().uuid(), keep: z.boolean() }).parse(data),
  )
  .handler(async ({ data }) => {
    const { resetConversation } = await import("./conversation.server");
    return resetConversation(data.conversationId, data.keep);
  });

export const getRecommendations = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => prefsSchema.parse(data))
  .handler(async ({ data }) => {
    const { fetchProducts } = await import("./db.server");
    const { topRecommendations, explainRecommendation } = await import("./recommend.server");
    const products = await fetchProducts();
    const ranked = topRecommendations(products, data, 3);
    return {
      explanation: explainRecommendation(data, ranked[0]?.product),
      results: ranked.map((r) => ({ product: r.product, score: r.score, reasons: r.reasons })),
    };
  });

export const lookupOrder = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ orderNumber: z.string().max(40) }).parse(data))
  .handler(async ({ data }) => {
    const { getOrderByNumber } = await import("./admin.server");
    return getOrderByNumber(data.orderNumber);
  });

export const adminOverview = createServerFn({ method: "GET" }).handler(async () => {
  const { getAdminOverview } = await import("./admin.server");
  return getAdminOverview();
});

export const adminTranscript = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { getTranscript } = await import("./admin.server");
    return getTranscript(data.id);
  });

export const adminSetOrderStatus = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ orderNumber: z.string().max(40), status: z.string().max(20) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { setOrderStatus } = await import("./admin.server");
    return setOrderStatus(data.orderNumber, data.status);
  });
