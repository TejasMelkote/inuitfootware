import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { CATALOG_PRODUCTS, CATALOG_VIDEOS, filterCatalog } from "./catalog";
import { canPersistConversations, hasSupabaseConfig } from "./env.server";
import { hydrateVideos } from "./media";
import type { Product, Video } from "@/types";

export const db = supabaseAdmin;
export { canPersistConversations, hasSupabaseConfig };

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
  if (hasSupabaseConfig()) {
    try {
      let query = db.from("products").select("*").order("featured", { ascending: false });
      if (filters.category) query = query.eq("category", filters.category);
      if (filters.featured !== undefined) query = query.eq("featured", filters.featured);
      if (filters.style) query = query.contains("styles", [filters.style]);
      if (filters.color) query = query.contains("colors", [filters.color]);
      if (filters.size) query = query.contains("sizes", [filters.size]);
      if (filters.ids?.length) query = query.in("id", filters.ids);

      const { data, error } = await query;
      if (!error && data?.length) return data.map(mapProduct);
    } catch (error) {
      console.warn("[inuit] catalog fallback:", error);
    }
  }
  return filterCatalog(CATALOG_PRODUCTS, filters);
}

export async function fetchProduct(id: string): Promise<Product | null> {
  if (hasSupabaseConfig()) {
    try {
      const { data, error } = await db.from("products").select("*").eq("id", id).maybeSingle();
      if (!error && data) return mapProduct(data);
    } catch (error) {
      console.warn("[inuit] product fallback:", error);
    }
  }
  return CATALOG_PRODUCTS.find((product) => product.id === id || product.slug === id) ?? null;
}

export async function fetchVideos(): Promise<Video[]> {
  if (hasSupabaseConfig()) {
    try {
      const { data, error } = await db
        .from("videos")
        .select("*")
        .eq("active", true)
        .order("display_order", { ascending: true });
      if (!error && data?.length) return hydrateVideos(data.map(mapVideo));
    } catch (error) {
      console.warn("[inuit] videos fallback:", error);
    }
  }
  return hydrateVideos(CATALOG_VIDEOS);
}

export async function logEvent(
  event: string,
  conversationId: string | null,
  payload: Record<string, unknown> = {},
) {
  if (!canPersistConversations()) return;
  const { error } = await db.from("analytics_events").insert({
    event,
    conversation_id: conversationId,
    payload: payload as never,
  });
  if (error) console.warn("[inuit] analytics insert skipped:", error.message);
}

