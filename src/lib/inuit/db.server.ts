import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Product, Video } from "@/types";

export const db = supabaseAdmin;

/* eslint-disable @typescript-eslint/no-explicit-any */
export function mapProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    description: row.description,
    shortDescription: row.short_description,
    price: row.price,
    currency: row.currency,
    images: row.images ?? [],
    colors: row.colors ?? [],
    sizes: row.sizes ?? [],
    materials: row.materials ?? [],
    styles: row.styles ?? [],
    occasions: row.occasions ?? [],
    badge: row.badge ?? null,
    featured: !!row.featured,
    inventory: row.inventory ?? 0,
  };
}

export function mapVideo(row: any): Video {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    thumbnailUrl: row.thumbnail_url,
    videoUrl: row.video_url,
    duration: row.duration,
    order: row.display_order,
  };
}

export interface ProductFilters {
  category?: string | undefined;
  style?: string | undefined;
  color?: string | undefined;
  size?: string | undefined;
  featured?: boolean | undefined;
  ids?: string[] | undefined;
}

export async function fetchProducts(filters: ProductFilters = {}): Promise<Product[]> {
  let query = db.from("products").select("*").order("featured", { ascending: false });
  if (filters.category) query = query.eq("category", filters.category);
  if (filters.featured !== undefined) query = query.eq("featured", filters.featured);
  if (filters.style) query = query.contains("styles", [filters.style]);
  if (filters.color) query = query.contains("colors", [filters.color]);
  if (filters.size) query = query.contains("sizes", [filters.size]);
  if (filters.ids?.length) query = query.in("id", filters.ids);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapProduct);
}

export async function fetchProduct(id: string): Promise<Product | null> {
  const { data, error } = await db.from("products").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapProduct(data) : null;
}

export async function fetchVideos(): Promise<Video[]> {
  const { data, error } = await db
    .from("videos")
    .select("*")
    .eq("active", true)
    .order("display_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapVideo);
}

export async function logEvent(
  event: string,
  conversationId: string | null,
  payload: Record<string, unknown> = {},
) {
  await db.from("analytics_events").insert({
    event,
    conversation_id: conversationId,
    payload: payload as never,
  });
}
