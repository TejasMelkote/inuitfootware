import { cn } from "@/lib/utils";
import type { QuickReply } from "@/types";

interface Props {
  replies: QuickReply[];
  disabled?: boolean;
  onSelect: (reply: QuickReply) => void;
  className?: string;
}

export function QuickReplies({ replies, disabled, onSelect, className }: Props) {
  if (!replies.length) return null;
  return (
    <div className={cn("flex flex-wrap gap-2 pt-1", className)}>
      {replies.map((reply, index) => (
        <button
          key={`${reply.action}-${reply.label}`}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(reply)}
          style={{ animationDelay: `${index * 45}ms` }}
          className={cn(
            "animate-fade-up rounded-full px-4 py-2 text-[0.8125rem] transition-all duration-300 disabled:opacity-45",
            reply.tone === "solid"
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft"
              : reply.tone === "ghost"
                ? "text-taupe hover:text-foreground"
                : "border border-border bg-card text-foreground hover:border-border-strong hover:bg-secondary",
          )}
        >
          {reply.label}
        </button>
      ))}
    </div>
  );
}
