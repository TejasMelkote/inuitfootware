import { SizeGuide } from "@/components/inuit/SizeGuide";

const SIZES = ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11"];

interface Props {
  disabled?: boolean;
  onSelect: (size: string) => void;
}

export function SizePicker({ disabled, onSelect }: Props) {
  return (
    <div className="animate-fade-up space-y-3">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {SIZES.map((size, index) => (
          <button
            key={size}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(size)}
            style={{ animationDelay: `${index * 40}ms` }}
            className="animate-fade-up rounded-md border border-border bg-card py-2.5 text-xs transition-all duration-300 hover:border-border-strong hover:bg-secondary disabled:opacity-45"
          >
            {size}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <SizeGuide />
        <span className="text-taupe/60 text-xs">Not sure? Our lasts run true to size.</span>
      </div>
    </div>
  );
}
