export type Category = "loafer" | "sneaker" | "boot" | "dress";
export type StyleTag = "classic" | "minimal" | "statement" | "relaxed";

export type ConversationState =
  | "WELCOME"
  | "CATEGORY"
  | "STYLE"
  | "COLOR"
  | "SIZE"
  | "RECOMMENDATION"
  | "PRODUCT_DETAIL"
  | "CRAFTSMANSHIP"
  | "DELIVERY"
  | "ORDER_SUMMARY"
  | "CONFIRMATION"
  | "UNKNOWN";

export type Intent =
  | "PRODUCT_SEARCH"
  | "CATEGORY_SELECTION"
  | "STYLE_SELECTION"
  | "COLOR_SELECTION"
  | "SIZE_SELECTION"
  | "CRAFTSMANSHIP"
  | "DELIVERY"
  | "ORDER"
  | "HELP"
  | "RESET"
  | "UNKNOWN";

export type MessageType =
  | "text"
  | "quick_replies"
  | "product_carousel"
  | "product_detail"
  | "collections"
  | "sizes"
  | "video"
  | "form"
  | "order_summary"
  | "confirmation"
  | "system";

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: Category | string;
  description: string;
  shortDescription: string;
  price: number;
  currency: string;
  images: string[];
  colors: string[];
  sizes: string[];
  materials: string[];
  styles: string[];
  occasions: string[];
  badge: string | null;
  featured: boolean;
  inventory: number;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: string;
  order: number;
}

export interface Preferences {
  category?: string | undefined;
  style?: string | undefined;
  color?: string | undefined;
  size?: string | undefined;
  occasion?: string | undefined;
  mode?: "guided" | "direct" | undefined;
}

export interface DeliveryDraft {
  name?: string | undefined;
  phone?: string | undefined;
  email?: string | undefined;
  address?: string | undefined;
  city?: string | undefined;
  state?: string | undefined;
  pinCode?: string | undefined;
}

export interface QuickReply {
  label: string;
  action: string;
  tone?: "pill" | "solid" | "ghost";
}

export interface OrderSummaryMeta {
  productName: string;
  productImage: string;
  size: string;
  color: string;
  price: number;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  name: string;
  estimate: string;
}

export interface OrderRecord {
  orderNumber: string;
  status: string;
  productName: string;
  productImage?: string;
  size: string;
  color: string;
  subtotal: number;
  name: string;
  city: string;
  estimate: string;
  createdAt?: string;
}

export interface MessageMetadata {
  quickReplies?: QuickReply[];
  products?: Product[];
  product?: Product;
  videos?: Video[];
  progress?: "category" | "style" | "color" | "size";
  collections?: CollectionCard[];
  summary?: OrderSummaryMeta;
  order?: OrderRecord;
  intent?: Intent;
  viewedVideos?: string[];
  form?: DeliveryDraft;
}

export interface CollectionCard {
  id: string;
  name: string;
  description: string;
  meta: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  message: string;
  type: MessageType;
  metadata: MessageMetadata;
  createdAt: string;
}

export interface ConversationSnapshot {
  id: string;
  sessionId: string;
  state: ConversationState;
  preferences: Preferences;
  selectedProduct: Product | null;
  selectedSize: string | null;
  selectedColor: string | null;
  deliveryDraft: DeliveryDraft;
  viewedVideos: string[];
  messageCount: number;
  createdAt?: string;
}

export interface ChatResponse {
  conversation: ConversationSnapshot;
  messages: ChatMessage[];
  intent?: Intent;
}

export const COLLECTIONS: Array<CollectionCard & { categories: string[] }> = [
  {
    id: "classics",
    name: "Classics",
    description: "Loafers, Oxfords and refined dress shoes.",
    meta: "Loafers • Oxfords • Dress shoes",
    categories: ["loafer", "dress"],
  },
  {
    id: "everyday",
    name: "Everyday",
    description: "Sneakers and effortless slip-ons.",
    meta: "Sneakers • Slip-ons",
    categories: ["sneaker", "loafer"],
  },
  {
    id: "statement",
    name: "Statement",
    description: "Boots and limited-edition silhouettes.",
    meta: "Boots • Limited editions",
    categories: ["boot"],
  },
];

export const CATEGORY_LABEL: Record<string, string> = {
  loafer: "Loafers",
  sneaker: "Sneakers",
  boot: "Boots",
  dress: "Dress shoes",
};

export const formatPrice = (value: number) => `₹${value.toLocaleString("en-IN")}`;
