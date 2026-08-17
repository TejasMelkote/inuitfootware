import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { formatPrice, type Product } from "@/types";

interface Props {
  products: Product[];
  disabled?: boolean;
  onDetails: (product: Product) => void;
  onChoose: (product: Product) => void;
}

export function ProductCarousel({ products, disabled, onDetails, onChoose }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollBy = (direction: 1 | -1) => {
    trackRef.current?.scrollBy({ left: direction * 268, behavior: "smooth" });
  };

  if (!products.length) return null;

  return (
    <div className="animate-fade-up group/carousel relative -mx-1">
      <div
        ref={trackRef}
        className="scrollbar-none flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2"
      >
        {products.map((product, index) => (
          <article
            key={product.id}
            style={{ animationDelay: `${index * 70}ms` }}
            className="animate-rise flex w-[248px] shrink-0 snap-start flex-col overflow-hidden rounded-lg border border-border bg-card shadow-card transition-shadow duration-500 hover:shadow-panel"
          >
            <button
              type="button"
              onClick={() => onDetails(product)}
              className="relative block aspect-4/5 overflow-hidden bg-secondary"
            >
              <img
                src={product.images[0]}
                alt={`${product.name} — ${product.shortDescription}`}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 ease-out hover:scale-[1.04]"
              />
              {product.badge && (
                <span className="absolute top-3 left-3 rounded-full bg-background/85 px-2.5 py-1 text-[0.5625rem] tracking-[0.18em] uppercase backdrop-blur-sm">
                  {product.badge}
                </span>
              )}
            </button>
            <div className="flex flex-1 flex-col gap-1 p-4">
              <h3 className="font-serif text-lg leading-tight">{product.name}</h3>
              <p className="text-taupe text-xs leading-relaxed">{product.shortDescription}</p>
              <p className="mt-2 text-sm">{formatPrice(product.price)}</p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onChoose(product)}
                  className="flex-1 rounded-full bg-primary px-3 py-2 text-xs text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-45"
                >
                  Choose
                </button>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onDetails(product)}
                  className="rounded-full border border-border px-3 py-2 text-xs transition-colors hover:bg-secondary disabled:opacity-45"
                >
                  Details
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {products.length > 2 && (
        <>
          <button
            type="button"
            aria-label="Previous products"
            onClick={() => scrollBy(-1)}
            className="absolute top-1/3 -left-2 hidden h-8 w-8 place-items-center rounded-full border border-border bg-background/90 opacity-0 shadow-card backdrop-blur-sm transition-opacity duration-300 group-hover/carousel:opacity-100 sm:grid"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next products"
            onClick={() => scrollBy(1)}
            className="absolute top-1/3 -right-2 hidden h-8 w-8 place-items-center rounded-full border border-border bg-background/90 opacity-0 shadow-card backdrop-blur-sm transition-opacity duration-300 group-hover/carousel:opacity-100 sm:grid"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
}
