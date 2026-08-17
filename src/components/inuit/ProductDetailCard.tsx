import { useState } from "react";

import { SizeGuide } from "@/components/inuit/SizeGuide";
import { cn } from "@/lib/utils";
import { formatPrice, type Product } from "@/types";

interface Props {
  product: Product;
  selectedSize?: string | null;
  selectedColor?: string | null;
  disabled?: boolean;
  onVariant: (product: Product, size: string, color: string) => void;
}

export function ProductDetailCard({
  product,
  selectedSize,
  selectedColor,
  disabled,
  onVariant,
}: Props) {
  const [size, setSize] = useState(
    selectedSize && product.sizes.includes(selectedSize) ? selectedSize : (product.sizes[0] ?? ""),
  );
  const [color, setColor] = useState(
    selectedColor && product.colors.includes(selectedColor)
      ? selectedColor
      : (product.colors[0] ?? ""),
  );

  const update = (nextSize: string, nextColor: string) => {
    setSize(nextSize);
    setColor(nextColor);
    onVariant(product, nextSize, nextColor);
  };

  return (
    <div className="animate-rise overflow-hidden rounded-lg border border-border bg-card shadow-card">
      <div className="aspect-16/10 overflow-hidden bg-secondary">
        <img
          src={product.images[0]}
          alt={`${product.name} in ${color}`}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="space-y-4 p-5">
        <div>
          <p className="label-caps">{product.badge ?? "Atelier"}</p>
          <h3 className="mt-1 font-serif text-2xl">{product.name}</h3>
          <p className="mt-2 text-sm leading-relaxed text-taupe">{product.description}</p>
        </div>

        <dl className="grid gap-2 border-y border-border py-4 text-xs sm:grid-cols-2">
          <div className="flex gap-2">
            <dt className="text-taupe">Materials</dt>
            <dd>{product.materials.join(", ")}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-taupe">Price</dt>
            <dd>{formatPrice(product.price)}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-taupe">Occasions</dt>
            <dd className="capitalize">{product.occasions.join(", ")}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-taupe">Availability</dt>
            <dd>{product.inventory > 0 ? `${product.inventory} pairs` : "Sold through"}</dd>
          </div>
        </dl>

        <div className="space-y-3">
          <div>
            <p className="label-caps mb-2">Colour</p>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((option) => (
                <button
                  key={option}
                  type="button"
                  disabled={disabled}
                  onClick={() => update(size, option)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs transition-colors disabled:opacity-45",
                    option === color
                      ? "border-border-strong bg-secondary"
                      : "border-border hover:bg-secondary",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="label-caps">Size</p>
              <SizeGuide />
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((option) => (
                <button
                  key={option}
                  type="button"
                  disabled={disabled}
                  onClick={() => update(option, color)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs transition-colors disabled:opacity-45",
                    option === size
                      ? "border-border-strong bg-secondary"
                      : "border-border hover:bg-secondary",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
