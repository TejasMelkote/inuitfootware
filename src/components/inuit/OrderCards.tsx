import { Check } from "lucide-react";

import { formatPrice, type OrderRecord, type OrderSummaryMeta } from "@/types";

export function OrderSummaryCard({
  summary,
  disabled,
  onConfirm,
  onEdit,
}: {
  summary: OrderSummaryMeta;
  disabled?: boolean;
  onConfirm: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="animate-rise overflow-hidden rounded-lg border border-border bg-card shadow-card">
      <div className="flex gap-4 border-b border-border p-5">
        <img
          src={summary.productImage}
          alt={summary.productName}
          className="h-24 w-20 rounded-md object-cover"
        />
        <div className="flex-1">
          <p className="label-caps">Your order</p>
          <h3 className="mt-1 font-serif text-xl leading-tight">{summary.productName}</h3>
          <p className="mt-1 text-xs text-taupe">
            {summary.color} · {summary.size}
          </p>
          <p className="mt-2 text-sm">{formatPrice(summary.price)}</p>
        </div>
      </div>

      <dl className="space-y-2 p-5 text-sm">
        <Row label="Deliver to" value={summary.name} />
        <Row
          label="Address"
          value={`${summary.address}, ${summary.city}, ${summary.state} ${summary.pinCode}`}
        />
        <Row label="Shipping" value="Complimentary insured delivery" />
        <Row label="Estimated arrival" value={summary.estimate} />
        <div className="flex items-baseline justify-between border-t border-border pt-3">
          <dt className="label-caps">Total</dt>
          <dd className="font-serif text-xl">{formatPrice(summary.price)}</dd>
        </div>
      </dl>

      <div className="flex flex-col gap-2 px-5 pb-5 sm:flex-row">
        <button
          type="button"
          disabled={disabled}
          onClick={onConfirm}
          className="flex-1 rounded-full bg-primary py-2.5 text-sm text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-45"
        >
          Confirm order
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onEdit}
          className="rounded-full border border-border px-4 py-2.5 text-sm transition-colors hover:bg-secondary disabled:opacity-45"
        >
          Edit details
        </button>
      </div>
    </div>
  );
}

export function ConfirmationCard({ order }: { order: OrderRecord }) {
  return (
    <div className="animate-rise overflow-hidden rounded-lg border border-border bg-card shadow-panel">
      <div className="flex flex-col items-center gap-3 border-b border-border px-6 py-8 text-center">
        <span className="grid h-11 w-11 place-items-center rounded-full border border-champagne bg-accent">
          <Check className="h-4 w-4" />
        </span>
        <p className="animate-seal text-[0.625rem] tracking-[0.24em] text-taupe uppercase">
          Order confirmed
        </p>
        <h3 className="font-serif text-2xl">{order.orderNumber}</h3>
        <p className="max-w-sm text-sm text-taupe">
          Thank you, {order.name.split(" ")[0]}. Your pair is being prepared in the atelier and a
          confirmation is on its way.
        </p>
      </div>
      <dl className="space-y-2 p-5 text-sm">
        <Row label="Pair" value={`${order.productName} · ${order.color} · ${order.size}`} />
        <Row label="Delivering to" value={order.city} />
        <Row label="Estimated arrival" value={order.estimate} />
        <Row label="Total paid" value={formatPrice(order.subtotal)} />
      </dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-6">
      <dt className="label-caps shrink-0">{label}</dt>
      <dd className="text-right text-sm">{value}</dd>
    </div>
  );
}
