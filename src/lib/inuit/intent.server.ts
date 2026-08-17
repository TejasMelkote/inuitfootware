import { z } from "zod";
import type { Intent, Preferences } from "@/types";

export interface IntentResult {
  intent: Intent;
  entities: Preferences;
  source: "ai" | "keyword";
}

const intentSchema = z.object({
  intent: z.enum([
    "PRODUCT_SEARCH",
    "CATEGORY_SELECTION",
    "STYLE_SELECTION",
    "COLOR_SELECTION",
    "SIZE_SELECTION",
    "CRAFTSMANSHIP",
    "DELIVERY",
    "ORDER",
    "HELP",
    "RESET",
    "UNKNOWN",
  ]),
  category: z.enum(["loafer", "sneaker", "boot", "dress"]).nullish(),
  style: z.enum(["classic", "minimal", "statement", "relaxed"]).nullish(),
  color: z.enum(["black", "tan", "white", "dark-brown"]).nullish(),
  size: z.union([z.string(), z.number()]).nullish(),
  occasion: z.string().nullish(),
});

const SYSTEM_PROMPT = `You classify shopper messages for INUIT, a luxury footwear house.
Return JSON only, no prose. Shape:
{"intent":"...","category":"loafer|sneaker|boot|dress|null","style":"classic|minimal|statement|relaxed|null","color":"black|tan|white|dark-brown|null","size":"UK 9|null","occasion":"formal|business|casual|wedding|travel|winter|dinner|null"}
Intents: PRODUCT_SEARCH, CATEGORY_SELECTION, STYLE_SELECTION, COLOR_SELECTION, SIZE_SELECTION, CRAFTSMANSHIP, DELIVERY, ORDER, HELP, RESET, UNKNOWN.
Use UNKNOWN when the message is not about footwear shopping, craft, delivery or orders.`;

/** AI-assisted extraction with a deterministic keyword fallback. */
export async function detectIntent(text: string): Promise<IntentResult> {
  const keyword = keywordIntent(text);
  const apiKey = process.env["LOVABLE_API_KEY"] ?? process.env["OPENAI_API_KEY"];
  if (!apiKey || !text.trim()) return keyword;

  try {
    const isOpenAiKey = !process.env["LOVABLE_API_KEY"] && !!process.env["OPENAI_API_KEY"];
    const endpoint = isOpenAiKey
      ? "https://api.openai.com/v1/chat/completions"
      : "https://ai.gateway.lovable.dev/v1/chat/completions";
    const model = isOpenAiKey ? "gpt-4o-mini" : "google/gemini-3.1-flash-lite";

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const response = await fetch(endpoint, {
      method: "POST",
      signal: controller.signal,
      headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        temperature: 0,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: text.slice(0, 500) },
        ],
      }),
    });
    clearTimeout(timer);
    if (!response.ok) return keyword;

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = payload.choices?.[0]?.message?.content ?? "";
    const json = raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1);
    const parsed = intentSchema.safeParse(JSON.parse(json));
    if (!parsed.success) return keyword;

    const d = parsed.data;
    const entities: Record<string, string | undefined> = {
      category: d.category ?? keyword.entities.category,
      style: d.style ?? keyword.entities.style,
      color: d.color ?? keyword.entities.color,
      size: normaliseSize(d.size) ?? keyword.entities.size,
      occasion: d.occasion ?? keyword.entities.occasion ?? undefined,
    };

    const intent =
      d.intent === "UNKNOWN" && keyword.intent !== "UNKNOWN" ? keyword.intent : d.intent;
    return { intent, entities: strip(entities), source: "ai" };
  } catch {
    return keyword;
  }
}

function normaliseSize(size?: string | number | null): string | undefined {
  if (size === null || size === undefined) return undefined;
  const digits = String(size).match(/\d{1,2}/);
  if (!digits) return undefined;
  const n = Number(digits[0]);
  return n >= 5 && n <= 12 ? `UK ${n}` : undefined;
}

/** Deterministic keyword detection — always available, no API key needed. */
export function keywordIntent(text: string): IntentResult {
  const t = ` ${text.toLowerCase()} `;
  const entities: {
    category?: string;
    style?: string;
    color?: string;
    size?: string;
    occasion?: string;
  } = {};

  if (/loafer|slip[- ]?on|moccasin/.test(t)) entities.category = "loafer";
  else if (/sneaker|trainer|court/.test(t)) entities.category = "sneaker";
  else if (/boot|chelsea/.test(t)) entities.category = "boot";
  else if (/oxford|derby|dress shoe|formal shoe|brogue/.test(t)) entities.category = "dress";

  if (/dark brown|chocolate/.test(t)) entities.color = "dark-brown";
  else if (/black/.test(t)) entities.color = "black";
  else if (/\btan\b|camel|cognac|light brown/.test(t)) entities.color = "tan";
  else if (/white|ivory|off[- ]white/.test(t)) entities.color = "white";
  else if (/brown/.test(t)) entities.color = "tan";

  if (/minimal|understated|quiet|clean/.test(t)) entities.style = "minimal";
  else if (/classic|timeless|traditional/.test(t)) entities.style = "classic";
  else if (/statement|bold|striking|standout|edge/.test(t)) entities.style = "statement";
  else if (/relaxed|casual|easy|comfort/.test(t)) entities.style = "relaxed";

  const size = t.match(/\b(?:uk\s*)?(\d{1,2})\b/);
  if (size && /size|uk|\bi (?:am|take|wear)\b/.test(t)) {
    const n = Number(size[1]);
    if (n >= 5 && n <= 12) entities.size = `UK ${n}`;
  }

  if (/wedding|black tie|ceremony/.test(t)) entities.occasion = "wedding";
  else if (/office|work|boardroom|business|interview/.test(t)) entities.occasion = "business";
  else if (/formal|suit|tailoring/.test(t)) entities.occasion = "formal";
  else if (/travel|flight|holiday/.test(t)) entities.occasion = "travel";
  else if (/dinner|evening/.test(t)) entities.occasion = "dinner";
  else if (/weekend|everyday|daily/.test(t)) entities.occasion = "casual";

  let intent: Intent = "UNKNOWN";
  if (/start over|restart|reset|begin again/.test(t)) intent = "RESET";
  else if (/\bhelp\b|what can you do|options|menu/.test(t)) intent = "HELP";
  else if (/made|craft|artisan|atelier|factory|leather selection|how do you make/.test(t))
    intent = "CRAFTSMANSHIP";
  else if (/delivery|deliver|shipping|ship|dispatch|when will it arrive/.test(t))
    intent = "DELIVERY";
  else if (/\border\b|buy|purchase|checkout|my selection|my order/.test(t)) intent = "ORDER";
  else if (entities.size && !entities.category && !entities.color) intent = "SIZE_SELECTION";
  else if (entities.category) intent = "PRODUCT_SEARCH";
  else if (entities.color) intent = "COLOR_SELECTION";
  else if (entities.style) intent = "STYLE_SELECTION";
  else if (/shoe|pair|footwear|show me|looking for|recommend|suggest/.test(t))
    intent = "PRODUCT_SEARCH";

  return { intent, entities: strip(entities), source: "keyword" };
}

function strip(entities: Record<string, string | undefined>): Preferences {
  return Object.fromEntries(
    Object.entries(entities).filter(([, v]) => v !== undefined && v !== null),
  ) as Preferences;
}
