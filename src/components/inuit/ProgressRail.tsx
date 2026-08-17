import { cn } from "@/lib/utils";

const STEPS = [
  { key: "category", label: "Category" },
  { key: "style", label: "Style" },
  { key: "color", label: "Colour" },
  { key: "size", label: "Size" },
] as const;

export function ProgressRail({ active }: { active: string }) {
  const activeIndex = STEPS.findIndex((s) => s.key === active);
  return (
    <div className="flex items-center gap-3 pb-1">
      {STEPS.map((step, index) => (
        <div key={step.key} className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "h-1 w-1 rounded-full transition-colors duration-500",
                index < activeIndex
                  ? "bg-champagne"
                  : index === activeIndex
                    ? "bg-primary"
                    : "bg-border-strong",
              )}
            />
            <span
              className={cn(
                "text-[0.625rem] tracking-[0.2em] uppercase transition-colors duration-500",
                index === activeIndex ? "text-foreground" : "text-taupe/60",
              )}
            >
              {step.label}
            </span>
          </div>
          {index < STEPS.length - 1 && <span className="h-px w-4 bg-border" />}
        </div>
      ))}
    </div>
  );
}
