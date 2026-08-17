import { CollectionCards } from "@/components/inuit/CollectionCards";
import { DeliveryForm } from "@/components/inuit/DeliveryForm";
import { ConfirmationCard, OrderSummaryCard } from "@/components/inuit/OrderCards";
import { ProductCarousel } from "@/components/inuit/ProductCarousel";
import { ProductDetailCard } from "@/components/inuit/ProductDetailCard";
import { ProgressRail } from "@/components/inuit/ProgressRail";
import { QuickReplies } from "@/components/inuit/QuickReplies";
import { SizePicker } from "@/components/inuit/SizePicker";
import { VideoGrid } from "@/components/inuit/VideoGrid";
import { cn } from "@/lib/utils";
import type { ChatMessage, ConversationSnapshot, DeliveryDraft, Video } from "@/types";

interface Props {
  message: ChatMessage;
  conversation: ConversationSnapshot | null;
  isLatest: boolean;
  busy?: boolean;
  send: (action: string, label?: string) => void;
  submitDelivery: (draft: DeliveryDraft) => void;
  onWatchVideo?: (video: Video) => void;
}

export function MessageRow({
  message,
  conversation,
  isLatest,
  busy,
  send,
  submitDelivery,
  onWatchVideo,
}: Props) {
  const meta = message.metadata ?? {};
  const interactive = isLatest && !busy;
  const disabled = !interactive;

  if (message.sender === "user") {
    return (
      <div className="animate-fade-up flex justify-end">
        <p className="max-w-[80%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground">
          {message.message}
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-up space-y-3">
      {meta.progress && <ProgressRail active={meta.progress} />}

      {message.message && (
        <div className="flex gap-3">
          <span className="mt-1.5 hidden h-6 w-6 shrink-0 place-items-center rounded-full border border-border bg-card font-serif text-[0.625rem] sm:grid">
            IN
          </span>
          <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-border bg-card px-4 py-3 shadow-soft">
            {message.message.split("\n\n").map((paragraph, index) => (
              <p key={index} className={cn("text-sm leading-relaxed", index > 0 && "mt-2")}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      )}

      {message.type === "collections" && meta.collections && (
        <CollectionCards
          collections={meta.collections}
          disabled={disabled}
          onSelect={(collection) => send(`collection:${collection.id}`, collection.name)}
        />
      )}

      {message.type === "product_carousel" && meta.products && (
        <ProductCarousel
          products={meta.products}
          disabled={disabled}
          onDetails={(product) => send(`details:${product.id}`, `Tell me about the ${product.name}`)}
          onChoose={(product) => send(`choose:${product.id}`, `I'll take the ${product.name}`)}
        />
      )}

      {message.type === "product_detail" && meta.product && (
        <ProductDetailCard
          product={meta.product}
          selectedSize={conversation?.selectedSize ?? conversation?.preferences.size ?? null}
          selectedColor={conversation?.selectedColor ?? null}
          disabled={disabled}
          onVariant={(product, size, color) =>
            send(`variant:${product.id}|${size}|${color}`)
          }
        />
      )}

      {message.type === "sizes" && (
        <SizePicker disabled={disabled} onSelect={(size) => send(`size:${size}`, size)} />
      )}

      {message.type === "video" && meta.videos && (
        <VideoGrid
          videos={meta.videos}
          viewed={conversation?.viewedVideos ?? []}
          onOpen={(video) => (onWatchVideo ? onWatchVideo(video) : send(`video:${video.id}`))}
        />
      )}

      {message.type === "form" && (
        <DeliveryForm
          initial={meta.form ?? conversation?.deliveryDraft ?? {}}
          disabled={disabled}
          onSubmit={submitDelivery}
        />
      )}

      {message.type === "order_summary" && meta.summary && (
        <OrderSummaryCard
          summary={meta.summary}
          disabled={disabled}
          onConfirm={() => send("confirm", "Confirm my order")}
          onEdit={() => send("delivery", "Let me edit my details")}
        />
      )}

      {message.type === "confirmation" && meta.order && <ConfirmationCard order={meta.order} />}

      {meta.quickReplies && meta.quickReplies.length > 0 && (
        <QuickReplies
          replies={meta.quickReplies}
          disabled={disabled}
          onSelect={(reply) => send(reply.action, reply.label)}
        />
      )}
    </div>
  );
}
