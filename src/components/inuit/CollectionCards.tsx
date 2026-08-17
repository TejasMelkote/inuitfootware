import type { CollectionCard } from "@/types";

interface Props {
  collections: CollectionCard[];
  disabled?: boolean;
  onSelect: (collection: CollectionCard) => void;
}

export function CollectionCards({ collections, disabled, onSelect }: Props) {
  return (
    <div className="animate-fade-up grid gap-3 sm:grid-cols-3">
      {collections.map((collection, index) => (
        <button
          key={collection.id}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(collection)}
          style={{ animationDelay: `${index * 70}ms` }}
          className="animate-rise group rounded-lg border border-border bg-card p-4 text-left shadow-soft transition-all duration-500 hover:border-border-strong hover:shadow-card disabled:opacity-50"
        >
          <p className="label-caps">0{index + 1}</p>
          <h3 className="mt-2 font-serif text-xl">{collection.name}</h3>
          <p className="mt-1 text-xs leading-relaxed text-taupe">{collection.description}</p>
          <p className="mt-3 text-[0.625rem] tracking-[0.16em] text-taupe/70 uppercase">
            {collection.meta}
          </p>
        </button>
      ))}
    </div>
  );
}
