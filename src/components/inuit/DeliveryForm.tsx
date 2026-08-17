import { useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { DeliveryDraft } from "@/types";

interface Props {
  initial: DeliveryDraft;
  disabled?: boolean;
  onSubmit: (draft: DeliveryDraft) => void;
}

const FIELDS: Array<{
  key: keyof DeliveryDraft;
  label: string;
  placeholder: string;
  full?: boolean;
  type?: string;
}> = [
  { key: "name", label: "Full name", placeholder: "Ananya Rao", full: true },
  { key: "phone", label: "Phone", placeholder: "98765 43210", type: "tel" },
  { key: "email", label: "Email", placeholder: "you@example.com", type: "email" },
  { key: "address", label: "Address", placeholder: "Flat 4B, Rose Villa, Turner Road", full: true },
  { key: "city", label: "City", placeholder: "Mumbai" },
  { key: "state", label: "State", placeholder: "Maharashtra" },
  { key: "pinCode", label: "PIN code", placeholder: "400050" },
];

export function DeliveryForm({ initial, disabled, onSubmit }: Props) {
  const [draft, setDraft] = useState<DeliveryDraft>(initial ?? {});
  const [errors, setErrors] = useState<Partial<Record<keyof DeliveryDraft, string>>>({});

  const validate = (value: DeliveryDraft) => {
    const next: Partial<Record<keyof DeliveryDraft, string>> = {};
    if (!value.name?.trim()) next.name = "We'll need a name for the delivery.";
    if (!/^[\d\s+-]{10,15}$/.test(value.phone ?? "")) next.phone = "A 10-digit number, please.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email ?? "")) next.email = "That email looks off.";
    if (!value.address?.trim()) next.address = "Street and building, please.";
    if (!value.city?.trim()) next.city = "Which city?";
    if (!value.state?.trim()) next.state = "And the state?";
    if (!/^\d{6}$/.test((value.pinCode ?? "").replace(/\s/g, "")))
      next.pinCode = "Six digits, please.";
    return next;
  };

  return (
    <form
      className="animate-rise space-y-4 rounded-lg border border-border bg-card p-5 shadow-card"
      onSubmit={(event) => {
        event.preventDefault();
        const found = validate(draft);
        setErrors(found);
        if (Object.keys(found).length) return;
        onSubmit(draft);
      }}
    >
      <div>
        <p className="label-caps">Delivery details</p>
        <p className="mt-1 text-sm text-taupe">
          Complimentary insured shipping, signature on arrival.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {FIELDS.map((field) => (
          <label key={field.key} className={cn("space-y-1.5", field.full && "sm:col-span-2")}>
            <span className="label-caps">{field.label}</span>
            <Input
              type={field.type ?? "text"}
              value={draft[field.key] ?? ""}
              placeholder={field.placeholder}
              disabled={disabled}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, [field.key]: event.target.value }))
              }
              className={cn(
                "h-10 rounded-md border-border bg-background text-sm",
                errors[field.key] && "border-destructive",
              )}
            />
            {errors[field.key] && (
              <span className="block text-xs text-destructive">{errors[field.key]}</span>
            )}
          </label>
        ))}
      </div>

      <button
        type="submit"
        disabled={disabled}
        className="w-full rounded-full bg-primary py-2.5 text-sm text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-45"
      >
        Review my order
      </button>
    </form>
  );
}
