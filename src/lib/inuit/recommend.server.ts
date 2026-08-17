import type { Preferences, Product } from "@/types";
import { CATEGORY_LABEL } from "@/types";

export interface ScoredProduct {
  product: Product;
  score: number;
  reasons: string[];
}

/**
 * Deterministic recommendation scoring.
 * category +5 · style +3 · colour +2 · size available +2 · occasion +2 · featured +1
 */
export function scoreProducts(products: Product[], prefs: Preferences): ScoredProduct[] {
  return products
    .map((product) => {
      let score = 0;
      const reasons: string[] = [];

      if (prefs.category && product.category === prefs.category) {
        score += 5;
        reasons.push("category");
      }
      if (prefs.style && product.styles.includes(prefs.style)) {
        score += 3;
        reasons.push("style");
      }
      if (prefs.color && product.colors.some((c) => normalise(c) === normalise(prefs.color!))) {
        score += 2;
        reasons.push("colour");
      }
      if (prefs.size && product.sizes.includes(prefs.size)) {
        score += 2;
        reasons.push("size");
      }
      if (prefs.occasion && product.occasions.includes(prefs.occasion)) {
        score += 2;
        reasons.push("occasion");
      }
      if (product.featured) score += 1;

      return { product, score, reasons };
    })
    .sort((a, b) => b.score - a.score || b.product.price - a.product.price);
}

export function topRecommendations(products: Product[], prefs: Preferences, limit = 3) {
  return scoreProducts(products, prefs).slice(0, limit);
}

const normalise = (value: string) => value.toLowerCase().replace(/[\s_]+/g, "-");

const colourWord: Record<string, string> = {
  black: "black",
  tan: "tan",
  white: "white",
  "dark-brown": "dark brown",
};

/** Concise, human explanation that references the user's own choices. */
export function explainRecommendation(prefs: Preferences, best?: Product): string {
  const pieces: string[] = [];
  if (prefs.style) pieces.push(prefs.style === "statement" ? "Statement" : capitalise(prefs.style));
  if (prefs.color) pieces.push(colourWord[normalise(prefs.color)] ?? prefs.color.toLowerCase());
  const category = prefs.category ? CATEGORY_LABEL[prefs.category]?.toLowerCase() : undefined;

  const lead = pieces.length
    ? `${pieces.join(" ")}${category ? ` ${category}` : ""} — a quietly strong combination.`
    : "I have a few pairs in mind.";

  if (!best) return `${lead} Here's what I'd consider.`;
  const first = best.name.split(" ")[0];
  const occasion = prefs.occasion ? ` It reads beautifully for something ${prefs.occasion}.` : "";
  return `${lead} The ${first} feels like the strongest match for what you're after.${occasion}`;
}

const capitalise = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
