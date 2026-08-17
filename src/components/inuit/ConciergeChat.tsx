import { useEffect, useRef, useState } from "react";
import { ArrowUp, RotateCcw } from "lucide-react";

import { MessageRow } from "@/components/inuit/MessageRow";
import { VideoPlayer } from "@/components/inuit/VideoPlayer";
import { TypingIndicator } from "@/components/inuit/TypingIndicator";
import { useConcierge } from "@/hooks/useConcierge";
import { CATEGORY_LABEL } from "@/types";
import type { Video } from "@/types";

export function ConciergeChat() {
  const { conversation, messages, typing, busy, ready, send, sendText, submitDelivery, restart } =
    useConcierge();
  const [draft, setDraft] = useState("");
  const [watching, setWatching] = useState<Video | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTo({ top: node.scrollHeight, behavior: "smooth" });
  }, [messages.length, typing]);

  const prefs = conversation?.preferences ?? {};
  const chips = [
    prefs.category ? (CATEGORY_LABEL[prefs.category] ?? prefs.category) : null,
    prefs.style,
    prefs.color,
    prefs.size,
  ].filter(Boolean) as string[];

  const lastBotIndex = messages.reduce(
    (acc, message, index) => (message.sender === "bot" ? index : acc),
    -1,
  );

  return (
    <section
      aria-label="INUIT concierge"
      className="flex h-[min(88vh,940px)] flex-col overflow-hidden rounded-xl border border-border bg-background/70 shadow-panel backdrop-blur-sm"
    >
      <header className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
        <div>
          <p className="font-serif text-lg leading-none">Concierge</p>
          <p className="mt-1 flex items-center gap-1.5 text-[0.6875rem] tracking-[0.14em] text-taupe uppercase">
            <span className="h-1 w-1 rounded-full bg-champagne" />
            {typing ? "Typing" : "Online"}
            <span className="text-taupe/50">·</span>
            <span className="normal-case tracking-normal">by Tejas Melkote</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {chips.length > 0 && (
            <div className="hidden flex-wrap justify-end gap-1.5 sm:flex">
              {chips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-border bg-card px-2.5 py-1 text-[0.625rem] tracking-[0.12em] uppercase"
                >
                  {chip}
                </span>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => restart(false)}
            aria-label="Start over"
            className="grid h-8 w-8 place-items-center rounded-full border border-border text-taupe transition-colors hover:bg-secondary hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      <div ref={scrollRef} className="scrollbar-none flex-1 space-y-5 overflow-y-auto px-5 py-6">
        {!ready && (
          <div className="space-y-3">
            <div className="h-4 w-40 animate-pulse rounded-full bg-muted" />
            <div className="h-16 w-2/3 animate-pulse rounded-2xl bg-muted" />
          </div>
        )}
        {messages.map((message, index) => (
          <MessageRow
            key={message.id}
            message={message}
            conversation={conversation}
            isLatest={index === lastBotIndex}
            busy={busy || typing}
            send={send}
            submitDelivery={submitDelivery}
            onWatchVideo={(video) => {
              setWatching(video);
              send(`video:${video.id}`);
            }}
          />
        ))}
        {typing && <TypingIndicator />}
      </div>

      <VideoPlayer video={watching} onClose={() => setWatching(null)} />

      <form
        className="flex items-center gap-2 border-t border-border px-4 py-3"
        onSubmit={(event) => {
          event.preventDefault();
          sendText(draft);
          setDraft("");
        }}
      >
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Tell me what you're looking for…"
          aria-label="Message the concierge"
          className="h-10 flex-1 rounded-full border border-border bg-card px-4 text-sm outline-none transition-colors placeholder:text-taupe/60 focus:border-border-strong"
        />
        <button
          type="submit"
          disabled={busy || !draft.trim()}
          aria-label="Send message"
          className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </form>
    </section>
  );
}
