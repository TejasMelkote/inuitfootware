import {
  canPersistConversations,
  db,
  fetchProduct,
  fetchProducts,
  fetchVideos,
  logEvent,
  mapProduct,
} from "./db.server";
import { groqChat } from "./groq.server";
import { detectIntent } from "./intent.server";
import { explainRecommendation, topRecommendations } from "./recommend.server";
import { CATEGORY_LABEL, COLLECTIONS } from "@/types";
import type {
  ChatMessage,
  ChatResponse,
  ConversationSnapshot,
  ConversationState,
  DeliveryDraft,
  MessageMetadata,
  MessageType,
  Preferences,
  Product,
  QuickReply,
} from "@/types";

/* ------------------------------------------------------------------ copy --- */

const WELCOME_TEXT = `Welcome to Inuit. 👋

I'm your personal footwear concierge.

From hand-finished loafers to refined sneakers and statement boots, every Inuit pair is designed around timeless style, comfort and craftsmanship.

Shall we find yours?`;

const WELCOME_REPLIES: QuickReply[] = [
  { label: "Find my pair ✨", action: "find", tone: "solid" },
  { label: "Explore collection", action: "explore" },
  { label: "How Inuit shoes are made", action: "craft" },
  { label: "I already know what I want", action: "know" },
];

const CATEGORY_REPLIES: QuickReply[] = [
  { label: "👞 Loafers", action: "cat:loafer" },
  { label: "👟 Sneakers", action: "cat:sneaker" },
  { label: "🥾 Boots", action: "cat:boot" },
  { label: "👔 Dress shoes", action: "cat:dress" },
];

const STYLE_REPLIES: QuickReply[] = [
  { label: "✨ Classic", action: "style:classic" },
  { label: "◼ Minimal", action: "style:minimal" },
  { label: "🔥 Statement", action: "style:statement" },
  { label: "🌿 Relaxed", action: "style:relaxed" },
];

const COLOR_REPLIES: QuickReply[] = [
  { label: "🖤 Black", action: "color:black" },
  { label: "🤎 Tan", action: "color:tan" },
  { label: "🤍 White", action: "color:white" },
  { label: "🌰 Dark Brown", action: "color:dark-brown" },
];

const RECOVERY_REPLIES: QuickReply[] = [
  { label: "Find my pair ✨", action: "find", tone: "solid" },
  { label: "Explore shoes", action: "explore" },
  { label: "How they're made", action: "craft" },
  { label: "My order", action: "lookup" },
  { label: "Start over", action: "restart" },
];

const HELP_REPLIES: QuickReply[] = [
  { label: "✨ Find my pair", action: "find", tone: "solid" },
  { label: "👞 Browse collection", action: "explore" },
  { label: "🎥 How they're made", action: "craft" },
  { label: "🛍 My order", action: "lookup" },
  { label: "🏠 Start over", action: "restart" },
];

const BACK: Partial<Record<ConversationState, ConversationState>> = {
  STYLE: "CATEGORY",
  COLOR: "STYLE",
  SIZE: "COLOR",
  RECOMMENDATION: "SIZE",
  PRODUCT_DETAIL: "RECOMMENDATION",
  CRAFTSMANSHIP: "RECOMMENDATION",
  DELIVERY: "CRAFTSMANSHIP",
  ORDER_SUMMARY: "DELIVERY",
};

const ESTIMATE = "3–5 business days";

/* ------------------------------------------------------------- plumbing --- */

/* eslint-disable @typescript-eslint/no-explicit-any */
type ConvRow = any;

interface Turn {
  conv: ConvRow;
  clock: number;
  ephemeral: boolean;
  messages: ChatMessage[];
}

function newConvRow(sessionId: string, preferences: Preferences = {}): ConvRow {
  return {
    id: crypto.randomUUID(),
    session_id: sessionId,
    state: "WELCOME",
    preferences,
    selected_product_id: null,
    selected_size: null,
    selected_color: null,
    delivery_draft: {},
    viewed_videos: [],
    message_count: 0,
    created_at: new Date().toISOString(),
    local_orders: [],
  };
}

function turnFromSnapshot(res: ChatResponse): Turn {
  const c = res.conversation;
  return {
    conv: {
      id: c.id,
      session_id: c.sessionId,
      state: c.state,
      preferences: c.preferences ?? {},
      selected_product_id: c.selectedProduct?.id ?? null,
      selected_size: c.selectedSize ?? null,
      selected_color: c.selectedColor ?? null,
      delivery_draft: c.deliveryDraft ?? {},
      viewed_videos: c.viewedVideos ?? [],
      message_count: c.messageCount ?? res.messages.length,
      created_at: c.createdAt ?? new Date().toISOString(),
      local_orders: c.localOrders ?? [],
    },
    clock: Date.now(),
    ephemeral: true,
    messages: res.messages.map((m) => ({
      ...m,
      metadata: m.metadata ?? {},
    })),
  };
}

async function insertMessage(
  turn: Turn,
  sender: "user" | "bot",
  message: string,
  type: MessageType = "text",
  metadata: MessageMetadata = {},
) {
  const createdAt = new Date(turn.clock++).toISOString();
  const row: ChatMessage = {
    id: crypto.randomUUID(),
    sender,
    message,
    type,
    metadata,
    createdAt,
  };
  turn.messages.push(row);
  turn.conv.message_count = (turn.conv.message_count ?? 0) + 1;
  if (turn.ephemeral) return;
  const { error } = await db.from("messages").insert({
    conversation_id: turn.conv.id,
    sender,
    message,
    message_type: type,
    metadata: metadata as never,
    created_at: createdAt,
  });
  if (error) {
    console.warn("[inuit] message persist skipped:", error.message);
    turn.ephemeral = true;
  }
}

const bot = (turn: Turn, message: string, type: MessageType = "text", meta: MessageMetadata = {}) =>
  insertMessage(turn, "bot", message, type, meta);

const user = (turn: Turn, message: string, meta: MessageMetadata = {}) =>
  insertMessage(turn, "user", message, "text", meta);

async function patchConv(turn: Turn, patch: Record<string, unknown>) {
  turn.conv = { ...turn.conv, ...patch };
  if (turn.ephemeral) return;
  const { data, error } = await db
    .from("conversations")
    .update({ ...patch, message_count: turn.conv.message_count } as never)
    .eq("id", turn.conv.id)
    .select("*")
    .maybeSingle();
  if (error) {
    console.warn("[inuit] conversation persist skipped:", error.message);
    turn.ephemeral = true;
    return;
  }
  if (data) turn.conv = { ...data, local_orders: turn.conv.local_orders ?? [] };
}

async function snapshot(conversationId: string): Promise<ChatResponse> {
  const [{ data: conv }, { data: rows }] = await Promise.all([
    db.from("conversations").select("*").eq("id", conversationId).maybeSingle(),
    db
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true }),
  ]);
  if (!conv) throw new Error("Conversation not found");

  const selectedProduct = conv.selected_product_id
    ? await fetchProduct(conv.selected_product_id)
    : null;

  const conversation: ConversationSnapshot = {
    id: conv.id,
    sessionId: conv.session_id,
    state: conv.state as ConversationState,
    preferences: (conv.preferences ?? {}) as Preferences,
    selectedProduct,
    selectedSize: conv.selected_size,
    selectedColor: conv.selected_color,
    deliveryDraft: (conv.delivery_draft ?? {}) as DeliveryDraft,
    viewedVideos: conv.viewed_videos ?? [],
    messageCount: conv.message_count ?? 0,
    createdAt: conv.created_at,
  };

  const messages: ChatMessage[] = (rows ?? []).map((row: any) => ({
    id: row.id,
    sender: row.sender,
    message: row.message,
    type: row.message_type as MessageType,
    metadata: (row.metadata ?? {}) as MessageMetadata,
    createdAt: row.created_at,
  }));

  return { conversation, messages };
}

async function snapshotFromTurn(turn: Turn): Promise<ChatResponse> {
  if (!turn.ephemeral) return snapshot(turn.conv.id);
  const selectedProduct = turn.conv.selected_product_id
    ? await fetchProduct(turn.conv.selected_product_id)
    : null;
  return {
    conversation: {
      id: turn.conv.id,
      sessionId: turn.conv.session_id,
      state: turn.conv.state as ConversationState,
      preferences: (turn.conv.preferences ?? {}) as Preferences,
      selectedProduct,
      selectedSize: turn.conv.selected_size,
      selectedColor: turn.conv.selected_color,
      deliveryDraft: (turn.conv.delivery_draft ?? {}) as DeliveryDraft,
      viewedVideos: turn.conv.viewed_videos ?? [],
      messageCount: turn.conv.message_count ?? turn.messages.length,
      createdAt: turn.conv.created_at,
      ephemeral: true,
      localOrders: turn.conv.local_orders ?? [],
    },
    messages: turn.messages,
  };
}

async function loadTurn(conversationId: string, snap?: ChatResponse): Promise<Turn> {
  if (canPersistConversations()) {
    const { data: conv } = await db
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .maybeSingle();
    if (conv) {
      return { conv, clock: Date.now(), ephemeral: false, messages: [] };
    }
  }
  if (snap?.conversation?.id === conversationId) return turnFromSnapshot(snap);
  throw new Error("Conversation not found");
}

/* --------------------------------------------------------- public API ----- */

export async function createConversation(sessionId: string): Promise<ChatResponse> {
  if (canPersistConversations()) {
    const { data, error } = await db
      .from("conversations")
      .insert({ session_id: sessionId, state: "WELCOME" })
      .select("*")
      .single();
    if (!error && data) {
      const turn: Turn = { conv: data, clock: Date.now(), ephemeral: false, messages: [] };
      await bot(turn, WELCOME_TEXT, "quick_replies", { quickReplies: WELCOME_REPLIES });
      await patchConv(turn, {});
      await logEvent("conversation_started", data.id, { sessionId });
      return snapshot(data.id);
    }
    if (error) console.warn("[inuit] conversation insert skipped:", error.message);
  }

  const turn: Turn = {
    conv: newConvRow(sessionId),
    clock: Date.now(),
    ephemeral: true,
    messages: [],
  };
  await bot(turn, WELCOME_TEXT, "quick_replies", { quickReplies: WELCOME_REPLIES });
  return snapshotFromTurn(turn);
}

export async function loadConversation(id: string, snap?: ChatResponse): Promise<ChatResponse> {
  if (snap?.conversation?.id === id) return snap;
  return snapshot(id);
}

export async function resetConversation(
  conversationId: string,
  keepPreferences: boolean,
  previousSnap?: ChatResponse,
): Promise<ChatResponse> {
  let previous: ConvRow | null = null;
  if (canPersistConversations()) {
    const { data } = await db
      .from("conversations")
      .select("*")
      .eq("id", conversationId)
      .maybeSingle();
    previous = data;
  }
  if (!previous && previousSnap?.conversation?.id === conversationId) {
    previous = turnFromSnapshot(previousSnap).conv;
  }
  const sessionId = previous?.session_id ?? crypto.randomUUID();
  const keptPrefs = keepPreferences ? (previous?.preferences ?? {}) : {};

  if (canPersistConversations()) {
    const { data, error } = await db
      .from("conversations")
      .insert({
        session_id: sessionId,
        state: "WELCOME",
        preferences: keptPrefs,
      })
      .select("*")
      .single();
    if (!error && data) {
      const turn: Turn = { conv: data, clock: Date.now(), ephemeral: false, messages: [] };
      if (keepPreferences && previous?.preferences && Object.keys(previous.preferences).length) {
        await bot(turn, "Of course — I've kept your choices. Where would you like to pick up?", "quick_replies", {
          quickReplies: WELCOME_REPLIES,
        });
      } else {
        await bot(turn, WELCOME_TEXT, "quick_replies", { quickReplies: WELCOME_REPLIES });
      }
      await patchConv(turn, {});
      await logEvent("conversation_started", data.id, { restarted: true, keepPreferences });
      return snapshot(data.id);
    }
    if (error) console.warn("[inuit] conversation reset skipped:", error.message);
  }

  const turn: Turn = {
    conv: newConvRow(sessionId, keptPrefs),
    clock: Date.now(),
    ephemeral: true,
    messages: [],
  };
  if (keepPreferences && previous?.preferences && Object.keys(previous.preferences).length) {
    await bot(turn, "Of course — I've kept your choices. Where would you like to pick up?", "quick_replies", {
      quickReplies: WELCOME_REPLIES,
    });
  } else {
    await bot(turn, WELCOME_TEXT, "quick_replies", { quickReplies: WELCOME_REPLIES });
  }
  return snapshotFromTurn(turn);
}

export interface TurnInput {
  conversationId: string;
  action?: string | undefined;
  label?: string | undefined;
  text?: string | undefined;
  delivery?: DeliveryDraft | undefined;
  snapshot?: ChatResponse | undefined;
}

export async function handleTurn(input: TurnInput): Promise<ChatResponse> {
  const turn = await loadTurn(input.conversationId, input.snapshot);

  if (input.text?.trim()) {
    await user(turn, input.text.trim());
    const result = await detectIntent(input.text);
    await runIntent(turn, result.intent, result.entities, input.text);
    return snapshotFromTurn(turn);
  }

  if (input.action) {
    if (input.label) await user(turn, input.label);
    await runAction(turn, input.action, input.delivery);
  }
  return snapshotFromTurn(turn);
}

/* ----------------------------------------------------------- questions ---- */

async function askCategory(turn: Turn, lead?: string) {
  if (lead) await bot(turn, lead);
  await bot(turn, "Let's start simple. What are you shopping for?", "quick_replies", {
    quickReplies: CATEGORY_REPLIES,
    progress: "category",
  });
  await patchConv(turn, { state: "CATEGORY" });
}

async function askStyle(turn: Turn) {
  await bot(turn, "And what kind of look are you after?", "quick_replies", {
    quickReplies: withBack(STYLE_REPLIES),
    progress: "style",
  });
  await patchConv(turn, { state: "STYLE" });
}

async function askColor(turn: Turn) {
  await bot(turn, "Which shade feels most like you?", "quick_replies", {
    quickReplies: withBack(COLOR_REPLIES),
    progress: "color",
  });
  await patchConv(turn, { state: "COLOR" });
}

async function askSize(turn: Turn) {
  await bot(turn, "Almost there — what's your usual size?", "sizes", {
    quickReplies: withBack([]),
    progress: "size",
  });
  await patchConv(turn, { state: "SIZE" });
}

const withBack = (replies: QuickReply[]): QuickReply[] => [
  ...replies,
  { label: "← Back", action: "back", tone: "ghost" },
];

/* ------------------------------------------------------------- actions ---- */

async function runAction(turn: Turn, action: string, delivery?: DeliveryDraft) {
  const prefs = (turn.conv.preferences ?? {}) as Preferences;
  const [key, ...rest] = action.split(":");
  const value = rest.join(":");

  switch (key) {
    case "find":
      await patchConv(turn, { preferences: { ...prefs, mode: "guided" } });
      await bot(turn, "Perfect. Let's make this easy.");
      await askCategory(turn);
      return;

    case "know":
      await patchConv(turn, { preferences: { ...prefs, mode: "direct" } });
      await askCategory(turn, "Perfect. No need to make you answer twenty questions.");
      return;

    case "cat": {
      const next = { ...prefs, category: value };
      await patchConv(turn, { preferences: next });
      await logEvent("preference_selected", turn.conv.id, { category: value });
      if (next.mode === "direct") {
        await showCarousel(turn, { category: value }, `Here's what we have in ${CATEGORY_LABEL[value]?.toLowerCase() ?? value}.`);
        return;
      }
      await askStyle(turn);
      return;
    }

    case "style":
      await patchConv(turn, { preferences: { ...prefs, style: value } });
      await logEvent("preference_selected", turn.conv.id, { style: value });
      if (turn.conv.state === "RECOMMENDATION" || prefs.size) {
        await recommend(turn);
        return;
      }
      await askColor(turn);
      return;

    case "color":
      await patchConv(turn, { preferences: { ...prefs, color: value } });
      await logEvent("preference_selected", turn.conv.id, { color: value });
      if (prefs.size) {
        await recommend(turn);
        return;
      }
      await askSize(turn);
      return;

    case "size":
      await patchConv(turn, { preferences: { ...prefs, size: value } });
      await logEvent("preference_selected", turn.conv.id, { size: value });
      await recommend(turn);
      return;

    case "explore":
      await bot(
        turn,
        "Of course. Three quiet worlds — where would you like to look?",
        "collections",
        { collections: COLLECTIONS.map(({ id, name, description, meta }) => ({ id, name, description, meta })) },
      );
      await patchConv(turn, { state: "RECOMMENDATION" });
      return;

    case "collection": {
      const collection = COLLECTIONS.find((c) => c.id === value);
      if (!collection) {
        await fallback(turn);
        return;
      }
      const all = await fetchProducts();
      const products = all.filter((p) => collection.categories.includes(p.category));
      await bot(turn, `${collection.name} — ${collection.description}`);
      await presentProducts(turn, products.slice(0, 6));
      return;
    }

    case "details": {
      const product = await fetchProduct(value);
      if (!product) {
        await bot(turn, "That pair isn't available right now — let me show you what is.", "quick_replies", {
          quickReplies: [{ label: "See recommendations", action: "rerecommend", tone: "solid" }],
        });
        return;
      }
      await logEvent("product_viewed", turn.conv.id, { productId: product.id });
      await bot(turn, `${product.name} — ${product.shortDescription}.`, "product_detail", {
        product,
        quickReplies: [
          { label: "Choose this pair", action: `choose:${product.id}`, tone: "solid" },
          { label: "← Back to recommendations", action: "rerecommend", tone: "ghost" },
        ],
      });
      await patchConv(turn, { state: "PRODUCT_DETAIL" });
      return;
    }

    case "choose": {
      const product = await fetchProduct(value);
      if (!product) {
        await bot(turn, "That pair isn't available right now.", "quick_replies", {
          quickReplies: [{ label: "See alternatives", action: "rerecommend", tone: "solid" }],
        });
        return;
      }
      const size = prefs.size && product.sizes.includes(prefs.size) ? prefs.size : product.sizes[0];
      const color =
        prefs.color && product.colors.some((c) => slug(c) === slug(prefs.color!))
          ? product.colors.find((c) => slug(c) === slug(prefs.color!))!
          : product.colors[0];

      if (prefs.size && !product.sizes.includes(prefs.size)) {
        await bot(
          turn,
          `This pair isn't currently available in ${prefs.size}. I can show you the closest alternatives, or we can look at another size.`,
          "quick_replies",
          {
            quickReplies: [
              { label: "See alternatives", action: "rerecommend", tone: "solid" },
              { label: "Change size", action: "changesize" },
            ],
          },
        );
        return;
      }
      if (product.inventory <= 0) {
        await bot(turn, `The ${product.name} has just sold through. Let me show you something close.`, "quick_replies", {
          quickReplies: [{ label: "See alternatives", action: "rerecommend", tone: "solid" }],
        });
        return;
      }

      await patchConv(turn, {
        selected_product_id: product.id,
        selected_size: size,
        selected_color: color,
        state: "CRAFTSMANSHIP",
      });
      await logEvent("product_selected", turn.conv.id, { productId: product.id, size, color });
      await bot(
        turn,
        `Excellent choice. The ${product.name.split(" ")[0]} is one of our most versatile silhouettes — ${product.shortDescription.toLowerCase()}, in ${color}, ${size}.`,
      );
      await bot(
        turn,
        "Before we arrange delivery, want a quick look behind the craftsmanship?",
        "quick_replies",
        {
          quickReplies: [
            { label: "Show me 🎥", action: "craft", tone: "solid" },
            { label: "Skip to delivery", action: "delivery" },
            { label: "See another pair", action: "rerecommend", tone: "ghost" },
          ],
        },
      );
      return;
    }

    case "variant": {
      const [productId, size, color] = value.split("|");
      await patchConv(turn, { selected_size: size, selected_color: color });
      await bot(turn, `Noted — ${color}, ${size}.`, "quick_replies", {
        quickReplies: [
          { label: "Choose this pair", action: `choose:${productId}`, tone: "solid" },
          { label: "← Back to recommendations", action: "rerecommend", tone: "ghost" },
        ],
      });
      return;
    }

    case "changesize":
      await askSize(turn);
      return;

    case "rerecommend":
      await recommend(turn, true);
      return;

    case "craft":
      await showVideos(turn);
      return;

    case "video": {
      const viewed: string[] = Array.from(new Set([...(turn.conv.viewed_videos ?? []), value]));
      await patchConv(turn, { viewed_videos: viewed });
      await logEvent("video_opened", turn.conv.id, { videoId: value, count: viewed.length });
      const videos = await fetchVideos();
      if (viewed.length >= Math.min(3, videos.length)) {
        if (turn.conv.selected_product_id) {
          await bot(turn, "Beautiful, isn't it?\n\nReady to bring your pair home?", "quick_replies", {
            quickReplies: [
              { label: "Yes, deliver it to me 🏠", action: "delivery", tone: "solid" },
              { label: "Keep browsing", action: "rerecommend" },
            ],
          });
        } else {
          await bot(
            turn,
            "Now that you've seen how they're made, shall we find your pair?",
            "quick_replies",
            {
              quickReplies: [
                { label: "Find my pair ✨", action: "find", tone: "solid" },
                { label: "Order now", action: "know" },
              ],
            },
          );
        }
      }
      return;
    }

    case "delivery": {
      if (!turn.conv.selected_product_id) {
        await bot(turn, "Let's choose a pair first — then I'll take your address.", "quick_replies", {
          quickReplies: [{ label: "Find my pair ✨", action: "find", tone: "solid" }],
        });
        return;
      }
      await logEvent("delivery_started", turn.conv.id, {});
      await bot(turn, "Let's get your pair home.", "form", {
        form: (turn.conv.delivery_draft ?? {}) as DeliveryDraft,
      });
      await patchConv(turn, { state: "DELIVERY" });
      return;
    }

    case "submit-delivery": {
      const draft: DeliveryDraft = {
        ...((turn.conv.delivery_draft ?? {}) as DeliveryDraft),
        ...(delivery ?? {}),
      };
      await patchConv(turn, { delivery_draft: draft });

      const missing = missingField(draft);
      if (missing) {
        await bot(turn, `Just one more detail — ${missing.prompt}`, "form", { form: draft });
        return;
      }
      await showSummary(turn, draft);
      return;
    }

    case "confirm":
      await confirmOrder(turn);
      return;

    case "lookup":
      await showOrder(turn);
      return;

    case "help":
      await bot(
        turn,
        "Happily. Here's everything I can help with.",
        "quick_replies",
        { quickReplies: HELP_REPLIES },
      );
      return;

    case "restart":
      await bot(turn, "Start a fresh conversation?", "quick_replies", {
        quickReplies: [
          { label: "Start over", action: "restart-confirm", tone: "solid" },
          { label: "Keep my choices", action: "keep" },
        ],
      });
      return;

    case "keep":
      await bot(turn, "Of course — nothing lost. Where were we?", "quick_replies", {
        quickReplies: HELP_REPLIES,
      });
      return;

    case "back": {
      const previous = BACK[turn.conv.state as ConversationState] ?? "WELCOME";
      if (previous === "CATEGORY") await askCategory(turn);
      else if (previous === "STYLE") await askStyle(turn);
      else if (previous === "COLOR") await askColor(turn);
      else if (previous === "SIZE") await askSize(turn);
      else if (previous === "RECOMMENDATION") await recommend(turn, true);
      else if (previous === "CRAFTSMANSHIP") await showVideos(turn);
      else if (previous === "DELIVERY")
        await bot(turn, "Let's revisit your delivery details.", "form", {
          form: (turn.conv.delivery_draft ?? {}) as DeliveryDraft,
        });
      else
        await bot(turn, "Back to the beginning — what would you like to do?", "quick_replies", {
          quickReplies: WELCOME_REPLIES,
        });
      return;
    }

    case "continue-shopping":
      await bot(turn, "With pleasure. What shall we look at next?", "quick_replies", {
        quickReplies: WELCOME_REPLIES,
      });
      await patchConv(turn, { state: "WELCOME" });
      return;

    default:
      await fallback(turn);
  }
}

/* ------------------------------------------------------------- intents ---- */

async function runIntent(
  turn: Turn,
  intent: string,
  entities: Preferences,
  text: string,
): Promise<void> {
  const prefs = { ...((turn.conv.preferences ?? {}) as Preferences), ...entities };
  const learned = Object.keys(entities).length > 0;
  if (learned) await patchConv(turn, { preferences: prefs });

  switch (intent) {
    case "CRAFTSMANSHIP":
      await showVideos(turn);
      return;
    case "DELIVERY":
      if (turn.conv.selected_product_id) await runAction(turn, "delivery");
      else {
        await bot(
          turn,
          "Everything is delivered to your door, complimentary, in 3–5 business days. Shall we pick your pair first?",
          "quick_replies",
          { quickReplies: [{ label: "Find my pair ✨", action: "find", tone: "solid" }] },
        );
      }
      return;
    case "ORDER":
      await showOrder(turn);
      return;
    case "HELP":
      await runAction(turn, "help");
      return;
    case "RESET":
      await runAction(turn, "restart");
      return;
    case "PRODUCT_SEARCH":
    case "CATEGORY_SELECTION":
    case "STYLE_SELECTION":
    case "COLOR_SELECTION":
    case "SIZE_SELECTION": {
      if (!learned) {
        await fallback(turn, text);
        return;
      }
      await acknowledge(turn, entities);
      if (!prefs.category) {
        await askCategory(turn);
        return;
      }
      if (!prefs.style) {
        await askStyle(turn);
        return;
      }
      if (!prefs.size) {
        await askSize(turn);
        return;
      }
      await recommend(turn);
      return;
    }
    default:
      await fallback(turn, text);
  }
}

async function acknowledge(turn: Turn, entities: Preferences) {
  const bits: string[] = [];
  if (entities.color) bits.push(entities.color.replace("-", " "));
  if (entities.category) bits.push(CATEGORY_LABEL[entities.category]?.toLowerCase() ?? entities.category);
  const occasion = entities.occasion ? ` for something ${entities.occasion}` : "";
  if (bits.length) {
    await bot(turn, `${bits.join(" ")}${occasion} — beautiful choice. Let me note that down.`);
  } else if (entities.size) {
    await bot(turn, `${entities.size} it is.`);
  } else {
    await bot(turn, "Noted.");
  }
}

async function fallback(turn: Turn, text?: string) {
  await logEvent("unknown_message", turn.conv.id, { text: text ?? null });
  const playful = text && /billionaire|astronaut|rich|famous|celebrity|royal/i.test(text);
  if (playful) {
    await bot(
      turn,
      "I like the ambition. 😄 I can absolutely find you something striking — let's narrow it down a little.",
      "quick_replies",
      {
        quickReplies: [
          { label: "🔥 Statement", action: "style:statement", tone: "solid" },
          { label: "◼ Minimal", action: "style:minimal" },
          { label: "✨ Classic", action: "style:classic" },
          { label: "Show me everything", action: "explore" },
        ],
        intent: "UNKNOWN",
      },
    );
    await patchConv(turn, { state: "STYLE" });
    return;
  }
  const generated = text
    ? await groqChat({
        temperature: 0.6,
        timeoutMs: 7000,
        messages: [
          {
            role: "system",
            content:
              "You are Inuit Concierge, a warm luxury footwear stylist. The shopper said something you cannot fully act on. Reply in 1-3 short sentences. Sound human, never robotic. Do not invent products or prices. Gently offer to find a pair, explore the collection, show how shoes are made, or look up an order. No markdown.",
          },
          { role: "user", content: text.slice(0, 400) },
        ],
      })
    : null;
  await bot(
    turn,
    generated ??
      "I'm sorry — I may have missed that. 😅\n\nI can help you find a pair, explore our collections, show you how our shoes are made, or help with an order.",
    "quick_replies",
    { quickReplies: RECOVERY_REPLIES, intent: "UNKNOWN" },
  );
  await patchConv(turn, { state: "UNKNOWN" });
}

/* ------------------------------------------------------------- widgets ---- */

async function recommend(turn: Turn, quiet = false) {
  const prefs = (turn.conv.preferences ?? {}) as Preferences;
  const products = await fetchProducts();
  const ranked = topRecommendations(products, prefs, 3);
  if (!ranked.length) {
    await bot(turn, "Nothing in the atelier matches that just yet — shall we widen the search?", "quick_replies", {
      quickReplies: [{ label: "Explore collection", action: "explore", tone: "solid" }],
    });
    return;
  }
  if (!quiet) await bot(turn, "Let me curate something for you… ✨");
  await bot(turn, explainRecommendation(prefs, ranked[0]?.product));
  await presentProducts(turn, ranked.map((r) => r.product));
}

async function showCarousel(turn: Turn, filters: { category?: string }, lead: string) {
  const products = await fetchProducts(filters);
  await bot(turn, lead);
  await presentProducts(turn, products);
}

async function presentProducts(turn: Turn, products: Product[]) {
  if (!products.length) {
    await bot(turn, "That corner of the atelier is empty right now. Shall we look elsewhere?", "quick_replies", {
      quickReplies: [{ label: "Explore collection", action: "explore", tone: "solid" }],
    });
    return;
  }
  await bot(turn, "", "product_carousel", {
    products,
    quickReplies: [{ label: "← Back", action: "back", tone: "ghost" }],
  });
  await patchConv(turn, { state: "RECOMMENDATION" });
}

async function showVideos(turn: Turn) {
  const videos = await fetchVideos();
  if (!videos.length) {
    await bot(turn, "That craftsmanship story is temporarily unavailable.", "quick_replies", {
      quickReplies: [{ label: "Find my pair ✨", action: "find", tone: "solid" }],
    });
    return;
  }
  await bot(
    turn,
    "Every Inuit pair has a story behind it.\n\nHere's a quick look inside the atelier.",
  );
  await bot(turn, "", "video", { videos, viewedVideos: turn.conv.viewed_videos ?? [] });
  await patchConv(turn, { state: "CRAFTSMANSHIP" });
}

function missingField(draft: DeliveryDraft): { field: string; prompt: string } | null {
  const checks: Array<[keyof DeliveryDraft, string]> = [
    ["name", "what name should I put on the box?"],
    ["phone", "what's the best number to reach you on?"],
    ["address", "where should we send it?"],
    ["city", "which city are you in?"],
    ["state", "and the state?"],
    ["pinCode", "what's your PIN code?"],
  ];
  for (const [field, prompt] of checks) {
    const value = draft[field];
    if (!value || !String(value).trim()) return { field, prompt };
  }
  if (!/^\d{6}$/.test(String(draft.pinCode))) {
    return { field: "pinCode", prompt: "could you check that PIN code? It should be six digits." };
  }
  return null;
}

async function showSummary(turn: Turn, draft: DeliveryDraft) {
  const product = turn.conv.selected_product_id
    ? await fetchProduct(turn.conv.selected_product_id)
    : null;
  if (!product) {
    await bot(turn, "Let's choose your pair first.", "quick_replies", {
      quickReplies: [{ label: "Find my pair ✨", action: "find", tone: "solid" }],
    });
    return;
  }
  await bot(turn, "Almost there. Here's everything I've got.", "order_summary", {
    summary: {
      productName: product.name,
      productImage: product.images[0] ?? "",
      size: turn.conv.selected_size ?? product.sizes[0]!,
      color: turn.conv.selected_color ?? product.colors[0]!,
      price: product.price,
      address: draft.address!,
      city: draft.city!,
      state: draft.state!,
      pinCode: draft.pinCode!,
      name: draft.name!,
      estimate: ESTIMATE,
    },
    quickReplies: [
      { label: "Confirm my order", action: "confirm", tone: "solid" },
      { label: "Edit details", action: "back", tone: "ghost" },
    ],
  });
  await patchConv(turn, { state: "ORDER_SUMMARY" });
}

async function confirmOrder(turn: Turn) {
  const draft = (turn.conv.delivery_draft ?? {}) as DeliveryDraft;
  const product = turn.conv.selected_product_id
    ? await fetchProduct(turn.conv.selected_product_id)
    : null;
  if (!product || missingField(draft)) {
    await bot(turn, "Something's missing on my side — let's check your details once more.", "form", {
      form: draft,
    });
    return;
  }

  const order = await insertOrder({
    conversationId: turn.conv.id,
    product,
    size: turn.conv.selected_size ?? product.sizes[0]!,
    color: turn.conv.selected_color ?? product.colors[0]!,
    draft,
    persist: !turn.ephemeral,
  });

  if (turn.ephemeral) {
    turn.conv.local_orders = [...(turn.conv.local_orders ?? []), order];
  }

  await bot(turn, "Your Inuit pair is on its way. ✨", "confirmation", { order });
  await bot(turn, "", "quick_replies", {
    quickReplies: [
      { label: "Continue shopping", action: "continue-shopping", tone: "solid" },
      { label: "Start over", action: "restart" },
    ],
  });
  await patchConv(turn, { state: "CONFIRMATION" });
}

/** Server-side order creation: price is always read from the database. */
export async function insertOrder(args: {
  conversationId: string | null;
  product: Product;
  size: string;
  color: string;
  draft: DeliveryDraft;
  persist?: boolean;
}) {
  const { product, size, color, draft } = args;
  if (!product.sizes.includes(size)) throw new Error("Unavailable size");
  if (!product.colors.includes(color)) throw new Error("Unavailable colour");
  if (product.inventory <= 0) throw new Error("Out of stock");

  const subtotal = product.price;
  const persist = args.persist !== false && canPersistConversations();
  let inserted: any = null;
  if (persist) {
    for (let attempt = 0; attempt < 5 && !inserted; attempt++) {
      const orderNumber = generateOrderNumber();
      const { data, error } = await db
        .from("orders")
        .insert({
          order_number: orderNumber,
          conversation_id: args.conversationId,
          customer: { name: draft.name, phone: draft.phone, email: draft.email ?? null } as never,
          items: [
            {
              productId: product.id,
              name: product.name,
              image: product.images[0] ?? "",
              size,
              color,
              price: subtotal,
              quantity: 1,
            },
          ] as never,
          subtotal,
          delivery_address: {
            address: draft.address,
            city: draft.city,
            state: draft.state,
            pinCode: draft.pinCode,
          } as never,
          status: "confirmed",
        })
        .select("*")
        .maybeSingle();
      if (error && !error.message.includes("duplicate")) {
        console.warn("[inuit] order persist skipped:", error.message);
        break;
      }
      inserted = data;
    }
  }

  if (!inserted) {
    inserted = {
      order_number: generateOrderNumber(),
      status: "confirmed",
      created_at: new Date().toISOString(),
    };
  } else {
    await db
      .from("products")
      .update({ inventory: Math.max(0, product.inventory - 1) })
      .eq("id", product.id);
  }

  await logEvent("order_created", args.conversationId, {
    orderNumber: inserted.order_number,
    productId: product.id,
    subtotal,
  });

  return {
    orderNumber: inserted.order_number,
    status: inserted.status,
    productName: product.name,
    productImage: product.images[0] ?? "",
    size,
    color,
    subtotal,
    name: draft.name ?? "",
    city: draft.city ?? "",
    estimate: ESTIMATE,
    createdAt: inserted.created_at,
  };
}

function generateOrderNumber() {
  const year = new Date().getFullYear();
  const serial = Math.floor(10000 + Math.random() * 89999);
  return `IN-${year}-${serial}`;
}

async function showOrder(turn: Turn) {
  const local = (turn.conv.local_orders as ChatResponse["conversation"]["localOrders"])?.[
    (turn.conv.local_orders?.length ?? 1) - 1
  ];
  if (local?.orderNumber) {
    await bot(turn, `Here's your order, ${local.name?.split(" ")[0] ?? "friend"}.`, "confirmation", {
      order: local,
    });
    return;
  }

  const { data } = canPersistConversations()
    ? await db
        .from("orders")
        .select("*")
        .eq("conversation_id", turn.conv.id)
        .order("created_at", { ascending: false })
        .limit(1)
    : { data: [] as any[] };
  const row = data?.[0];
  if (!row) {
    if (turn.conv.selected_product_id) {
      const product = await fetchProduct(turn.conv.selected_product_id);
      await bot(
        turn,
        `You have the ${product?.name} set aside — ${turn.conv.selected_color}, ${turn.conv.selected_size}. Shall we arrange delivery?`,
        "quick_replies",
        {
          quickReplies: [
            { label: "Yes, deliver it to me 🏠", action: "delivery", tone: "solid" },
            { label: "See another pair", action: "rerecommend" },
          ],
        },
      );
      return;
    }
    await bot(
      turn,
      "I don't have an order associated with this conversation yet.",
      "quick_replies",
      {
        quickReplies: [
          { label: "Find my pair ✨", action: "find", tone: "solid" },
          { label: "Start over", action: "restart" },
        ],
      },
    );
    return;
  }
  const item = (row.items as any[])[0];
  await bot(turn, `Here's your order, ${(row.customer as any).name?.split(" ")[0] ?? "friend"}.`, "confirmation", {
    order: {
      orderNumber: row.order_number,
      status: row.status,
      productName: item?.name ?? "Inuit pair",
      productImage: item?.image ?? "",
      size: item?.size ?? "",
      color: item?.color ?? "",
      subtotal: row.subtotal,
      name: (row.customer as any).name ?? "",
      city: (row.delivery_address as any).city ?? "",
      estimate: ESTIMATE,
      createdAt: row.created_at,
    },
  });
}

const slug = (value: string) => value.toLowerCase().replace(/\s+/g, "-");

export { mapProduct };
