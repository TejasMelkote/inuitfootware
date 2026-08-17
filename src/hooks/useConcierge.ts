import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
  fetchConversation,
  restartConversation,
  sendTurn,
  startConversation,
} from "@/lib/inuit/api.functions";
import type { ChatMessage, ChatResponse, ConversationSnapshot, DeliveryDraft } from "@/types";

const CONV_KEY = "inuit.conversation";
const SESSION_KEY = "inuit.session";

const newSessionId = () =>
  `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export interface ConciergeApi {
  conversation: ConversationSnapshot | null;
  messages: ChatMessage[];
  typing: boolean;
  busy: boolean;
  ready: boolean;
  send: (action: string, label?: string) => void;
  sendText: (text: string) => void;
  submitDelivery: (draft: DeliveryDraft) => void;
  restart: (keep: boolean) => void;
}

export function useConcierge(): ConciergeApi {
  const [conversation, setConversation] = useState<ConversationSnapshot | null>(null);
  const [all, setAll] = useState<ChatMessage[]>([]);
  const [revealed, setRevealed] = useState(0);
  const [typing, setTyping] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const idRef = useRef<string | null>(null);

  const apply = useCallback((res: ChatResponse, base?: number) => {
    setConversation(res.conversation);
    setAll(res.messages);
    if (base !== undefined) setRevealed(Math.min(base, res.messages.length));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const boot = async () => {
      try {
        const existing = localStorage.getItem(CONV_KEY);
        if (existing) {
          try {
            const res = await fetchConversation({ data: { id: existing } });
            if (cancelled) return;
            idRef.current = res.conversation.id;
            apply(res, res.messages.length);
            setReady(true);
            return;
          } catch {
            localStorage.removeItem(CONV_KEY);
          }
        }
        let sessionId = localStorage.getItem(SESSION_KEY);
        if (!sessionId) {
          sessionId = newSessionId();
          localStorage.setItem(SESSION_KEY, sessionId);
        }
        const res = await startConversation({ data: { sessionId } });
        if (cancelled) return;
        idRef.current = res.conversation.id;
        localStorage.setItem(CONV_KEY, res.conversation.id);
        apply(res, 0);
        setReady(true);
      } catch {
        if (!cancelled) {
          setReady(true);
          toast.error("The concierge is momentarily unavailable. Please refresh to try again.");
        }
      }
    };
    void boot();
    return () => {
      cancelled = true;
    };
  }, [apply]);

  // Reveal messages one at a time so the conversation feels composed, not dumped.
  useEffect(() => {
    if (revealed >= all.length) {
      setTyping(false);
      return;
    }
    const next = all[revealed]!;
    if (next.sender === "user") {
      setRevealed((r) => r + 1);
      return;
    }
    setTyping(true);
    const delay = Math.min(1200, 420 + next.message.length * 11);
    const timer = setTimeout(() => {
      setTyping(false);
      setRevealed((r) => r + 1);
    }, delay);
    return () => clearTimeout(timer);
  }, [all, revealed]);

  const run = useCallback(
    async (
      payload: { action?: string; label?: string; text?: string; delivery?: DeliveryDraft },
      optimisticUser?: string,
    ) => {
      const id = idRef.current;
      if (!id || busy) return;
      setBusy(true);
      let base = all.length;
      if (optimisticUser) {
        base += 1;
        setAll((prev) => [
          ...prev,
          {
            id: `local-${Date.now()}`,
            sender: "user",
            message: optimisticUser,
            type: "text",
            metadata: {},
            createdAt: new Date().toISOString(),
          },
        ]);
        setRevealed(base);
      }
      try {
        const res = await sendTurn({ data: { conversationId: id, ...payload } });
        apply(res, base);
      } catch {
        toast.error("Something went wrong on our side. Please try that again.");
        setAll((prev) => prev.filter((m) => !m.id.startsWith("local-")));
      } finally {
        setBusy(false);
      }
    },
    [all.length, apply, busy],
  );

  const restart = useCallback(
    async (keep: boolean) => {
      const id = idRef.current;
      if (!id) return;
      setBusy(true);
      try {
        const res = await restartConversation({ data: { conversationId: id, keep } });
        idRef.current = res.conversation.id;
        localStorage.setItem(CONV_KEY, res.conversation.id);
        apply(res, 0);
      } catch {
        toast.error("Couldn't start a new conversation just now.");
      } finally {
        setBusy(false);
      }
    },
    [apply],
  );

  const send = useCallback(
    (action: string, label?: string) => {
      if (action === "restart-confirm") {
        void restart(false);
        return;
      }
      void run(label ? { action, label } : { action }, label);
    },
    [restart, run],
  );

  const sendText = useCallback(
    (text: string) => {
      const value = text.trim();
      if (!value) return;
      void run({ text: value }, value);
    },
    [run],
  );

  const submitDelivery = useCallback(
    (draft: DeliveryDraft) => {
      void run({ action: "submit-delivery", delivery: draft });
    },
    [run],
  );

  return {
    conversation,
    messages: all.slice(0, revealed),
    typing,
    busy,
    ready,
    send,
    sendText,
    submitDelivery,
    restart: (keep: boolean) => void restart(keep),
  };
}
