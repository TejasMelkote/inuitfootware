import { db, fetchProducts, fetchVideos } from "./db.server";

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface AdminOverview {
  stats: {
    conversations: number;
    orders: number;
    conversionRate: number;
    popularCategory: string;
    popularProduct: string;
    videosOpened: number;
  };
  funnel: Array<{ label: string; value: number }>;
  products: Array<{
    id: string;
    name: string;
    category: string;
    price: number;
    inventory: number;
    featured: boolean;
  }>;
  orders: Array<{
    orderNumber: string;
    customer: string;
    product: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
  conversations: Array<{
    id: string;
    createdAt: string;
    messageCount: number;
    state: string;
    selectedProduct: string | null;
  }>;
  videos: Array<{ id: string; title: string; duration: string; order: number }>;
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const [products, videos, convRes, orderRes, eventRes] = await Promise.all([
    fetchProducts(),
    fetchVideos(),
    db.from("conversations").select("*").order("created_at", { ascending: false }).limit(50),
    db.from("orders").select("*").order("created_at", { ascending: false }).limit(50),
    db.from("analytics_events").select("event, payload").limit(1000),
  ]);

  const conversations = convRes.data ?? [];
  const orders = orderRes.data ?? [];
  const events = (eventRes.data ?? []) as any[];

  const countEvent = (name: string) => events.filter((e) => e.event === name).length;
  const productName = (id: string | null) => products.find((p) => p.id === id)?.name ?? null;

  const categoryCounts = new Map<string, number>();
  for (const conv of conversations) {
    const category = (conv.preferences as any)?.category;
    if (category) categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
  }
  const productCounts = new Map<string, number>();
  for (const order of orders) {
    const item = (order.items as any[])?.[0];
    if (item?.name) productCounts.set(item.name, (productCounts.get(item.name) ?? 0) + 1);
  }

  const started = conversations.length;
  const preferencesComplete = conversations.filter((c) => {
    const p = (c.preferences ?? {}) as any;
    return p.category && p.style && p.size;
  }).length;
  const productSelected = conversations.filter((c) => !!c.selected_product_id).length;
  const craftViewed = conversations.filter((c) => (c.viewed_videos ?? []).length > 0).length;
  const deliveryStarted = countEvent("delivery_started");

  return {
    stats: {
      conversations: started,
      orders: orders.length,
      conversionRate: started ? Math.round((orders.length / started) * 1000) / 10 : 0,
      popularCategory: topKey(categoryCounts) ?? "—",
      popularProduct: topKey(productCounts) ?? "—",
      videosOpened: countEvent("video_opened"),
    },
    funnel: [
      { label: "Conversations started", value: started },
      { label: "Preferences completed", value: preferencesComplete },
      { label: "Product selected", value: productSelected },
      { label: "Craftsmanship viewed", value: craftViewed },
      { label: "Delivery started", value: deliveryStarted },
      { label: "Orders confirmed", value: orders.length },
    ],
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      inventory: p.inventory,
      featured: p.featured,
    })),
    orders: orders.map((o) => ({
      orderNumber: o.order_number,
      customer: (o.customer as any)?.name ?? "—",
      product: (o.items as any[])?.[0]?.name ?? "—",
      amount: o.subtotal,
      status: o.status,
      createdAt: o.created_at,
    })),
    conversations: conversations.map((c) => ({
      id: c.id,
      createdAt: c.created_at,
      messageCount: c.message_count ?? 0,
      state: c.state,
      selectedProduct: productName(c.selected_product_id),
    })),
    videos: videos.map((v) => ({
      id: v.id,
      title: v.title,
      duration: v.duration,
      order: v.order,
    })),
  };
}

export async function setOrderStatus(orderNumber: string, status: string) {
  const allowed = ["confirmed", "processing", "dispatched", "delivered", "cancelled"];
  if (!allowed.includes(status)) throw new Error("Unknown status");
  const { error } = await db
    .from("orders")
    .update({ status })
    .eq("order_number", orderNumber);
  if (error) throw new Error(error.message);
  return { orderNumber, status };
}

export async function getOrderByNumber(orderNumber: string) {
  const { data } = await db
    .from("orders")
    .select("*")
    .eq("order_number", orderNumber)
    .maybeSingle();
  if (!data) return null;
  return {
    orderNumber: data.order_number,
    status: data.status,
    customer: data.customer,
    items: data.items,
    subtotal: data.subtotal,
    deliveryAddress: data.delivery_address,
    createdAt: data.created_at,
  };
}

export async function getTranscript(conversationId: string) {
  const { data } = await db
    .from("messages")
    .select("sender, message, message_type, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  return (data ?? []).map((m: any) => ({
    sender: m.sender,
    message: m.message,
    type: m.message_type,
    createdAt: m.created_at,
  }));
}

function topKey(map: Map<string, number>) {
  return [...map.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
}
