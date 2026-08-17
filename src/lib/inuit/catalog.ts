import type { Product, Video } from "@/types";

/** Built-in atelier catalog. Used when no Supabase keys are set. */
export const CATALOG_PRODUCTS: Product[] = [
  {
    id: "prd-milano",
    name: "Milano Loafer",
    slug: "milano",
    category: "loafer",
    description:
      "A soft, unlined loafer built on our Milano last. Hand-finished full-grain leather softens with wear and takes the shape of your foot — equally at home at dinner or in the boardroom.",
    shortDescription: "Hand-finished full-grain leather",
    price: 18900,
    currency: "INR",
    images: ["/products/milano.jpg"],
    colors: ["Black", "Tan", "Dark Brown"],
    sizes: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
    materials: ["Full-grain leather", "Leather sole"],
    styles: ["classic", "minimal"],
    occasions: ["formal", "business", "dinner"],
    badge: "Atelier Made",
    featured: true,
    inventory: 14,
  },
  {
    id: "prd-atelier-sneaker",
    name: "Atelier Sneaker",
    slug: "atelier-sneaker",
    category: "sneaker",
    description:
      "Our quietest silhouette. Full-grain leather panels, a suede toe and a hand-trimmed cupsole — designed to be worn every day and still look considered.",
    shortDescription: "Minimal leather and suede construction",
    price: 15500,
    currency: "INR",
    images: ["/products/atelier-sneaker.jpg"],
    colors: ["White", "Tan"],
    sizes: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
    materials: ["Calf leather", "Suede"],
    styles: ["minimal", "relaxed"],
    occasions: ["casual", "travel", "weekend"],
    badge: "New Season",
    featured: true,
    inventory: 20,
  },
  {
    id: "prd-heritage-boot",
    name: "Heritage Boot",
    slug: "heritage-boot",
    category: "boot",
    description:
      "A six-eyelet boot with a storm welt and a structured shaft that holds its shape for years. Made in a limited run of 200 pairs each season.",
    shortDescription: "Full-grain leather with a structured silhouette",
    price: 22900,
    currency: "INR",
    images: ["/products/heritage-boot.jpg"],
    colors: ["Tan", "Dark Brown"],
    sizes: ["UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
    materials: ["Full-grain leather", "Storm welt"],
    styles: ["statement", "relaxed"],
    occasions: ["casual", "winter", "travel"],
    badge: "Limited Run",
    featured: true,
    inventory: 8,
  },
  {
    id: "prd-verona-oxford",
    name: "Verona Oxford",
    slug: "verona-oxford",
    category: "dress",
    description:
      "The Verona is our formal cornerstone — a closed-lacing cap-toe oxford in polished box calf, hand-lasted for a clean, elongated line under tailoring.",
    shortDescription: "Refined cap-toe formal silhouette",
    price: 19800,
    currency: "INR",
    images: ["/products/verona-oxford.jpg"],
    colors: ["Black", "Dark Brown"],
    sizes: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
    materials: ["Box calf leather", "Leather sole"],
    styles: ["classic", "minimal"],
    occasions: ["formal", "wedding", "business"],
    badge: "Formal Icon",
    featured: true,
    inventory: 12,
  },
  {
    id: "prd-monaco-slip-on",
    name: "Monaco Slip-On",
    slug: "monaco-slip-on",
    category: "loafer",
    description:
      "Unlined nappa leather with a low, understated profile. The pair our clients reach for on flights, in summer, and everywhere formality is optional.",
    shortDescription: "Soft leather with an understated profile",
    price: 16900,
    currency: "INR",
    images: ["/products/monaco-slip-on.jpg"],
    colors: ["Tan", "Black", "Dark Brown"],
    sizes: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10"],
    materials: ["Nappa leather"],
    styles: ["relaxed", "minimal"],
    occasions: ["casual", "travel", "summer"],
    badge: "Everyday",
    featured: false,
    inventory: 18,
  },
  {
    id: "prd-aspen-chelsea",
    name: "Aspen Chelsea",
    slug: "aspen-chelsea",
    category: "boot",
    description:
      "Classic Chelsea construction, cut slightly sharper through the waist. A leather-stacked heel and hand-burnished finish give it depth that reads beautifully in winter light.",
    shortDescription: "Classic Chelsea construction with a modern edge",
    price: 21500,
    currency: "INR",
    images: ["/products/aspen-chelsea.jpg"],
    colors: ["Dark Brown", "Black"],
    sizes: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
    materials: ["Calf leather", "Elastic gore"],
    styles: ["classic", "statement"],
    occasions: ["dinner", "winter", "business"],
    badge: "Signature",
    featured: true,
    inventory: 10,
  },
  {
    id: "prd-roma-derby",
    name: "Roma Derby",
    slug: "roma-derby",
    category: "dress",
    description:
      "An open-laced derby with a rounder last and a softer shoulder — the more forgiving cousin of the Verona, made for long days in tailoring.",
    shortDescription: "Softly structured open-laced derby",
    price: 18500,
    currency: "INR",
    images: ["/products/roma-derby.jpg"],
    colors: ["Black", "Dark Brown"],
    sizes: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"],
    materials: ["Box calf leather"],
    styles: ["classic", "relaxed"],
    occasions: ["business", "formal", "wedding"],
    badge: "Atelier Made",
    featured: false,
    inventory: 15,
  },
  {
    id: "prd-luna-court",
    name: "Luna Court Sneaker",
    slug: "luna-court",
    category: "sneaker",
    description:
      "A low court profile in soft white calf with a tonal heel tab. Cleaned up enough for dinner, quiet enough for everything else.",
    shortDescription: "Low court profile in soft white calf",
    price: 16200,
    currency: "INR",
    images: ["/products/luna-court.jpg"],
    colors: ["White", "Tan"],
    sizes: ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10"],
    materials: ["Calf leather", "Rubber cupsole"],
    styles: ["minimal", "statement"],
    occasions: ["casual", "dinner", "weekend"],
    badge: "New Season",
    featured: false,
    inventory: 22,
  },
];

export const CATALOG_VIDEOS: Video[] = [
  {
    id: "vid-leather",
    title: "Selecting the Leather",
    description: "Every Inuit pair begins with carefully selected hides chosen for grain, durability and feel.",
    thumbnailUrl: "/atelier/leather.jpg",
    videoUrl: "/atelier/leather.mp4",
    duration: "0:12",
    order: 1,
  },
  {
    id: "vid-assembly",
    title: "Hand Assembly",
    description: "Skilled artisans shape, stitch and construct each pair with precision.",
    thumbnailUrl: "/atelier/assembly.jpg",
    videoUrl: "/atelier/assembly.mp4",
    duration: "0:12",
    order: 2,
  },
  {
    id: "vid-finish",
    title: "The Final Finish",
    description: "Every pair is inspected, polished and finished before it leaves the atelier.",
    thumbnailUrl: "/atelier/finish.jpg",
    videoUrl: "/atelier/finish.mp4",
    duration: "0:12",
    order: 3,
  },
];

export function filterCatalog(
  products: Product[],
  filters: {
    category?: string | undefined;
    style?: string | undefined;
    color?: string | undefined;
    size?: string | undefined;
    featured?: boolean | undefined;
    ids?: string[] | undefined;
  } = {},
): Product[] {
  return products.filter((product) => {
    if (filters.ids?.length && !filters.ids.includes(product.id)) return false;
    if (filters.category && product.category !== filters.category) return false;
    if (filters.featured !== undefined && product.featured !== filters.featured) return false;
    if (filters.style && !product.styles.includes(filters.style)) return false;
    if (filters.color && !product.colors.some((c) => c.toLowerCase() === filters.color!.toLowerCase()))
      return false;
    if (filters.size && !product.sizes.includes(filters.size)) return false;
    return true;
  });
}
