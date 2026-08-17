import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { adminOverview } from "@/lib/inuit/api.functions";
import { formatPrice } from "@/types";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "INUIT Studio — Concierge Performance Dashboard" },
      {
        name: "description",
        content:
          "Internal INUIT studio view: conversation volume, concierge funnel, catalogue inventory and confirmed orders.",
      },
      { property: "og:title", content: "INUIT Studio — Concierge Dashboard" },
      {
        property: "og:description",
        content: "Conversation volume, funnel drop-off, catalogue and orders for the INUIT concierge.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => adminOverview(),
    refetchInterval: 30_000,
  });

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <div>
            <p className="label-caps">Internal · Tejas Melkote</p>
            <h1 className="font-serif text-2xl">INUIT Studio</h1>
          </div>
          <Link
            to="/"
            className="text-[0.6875rem] tracking-[0.2em] text-taupe uppercase underline decoration-border underline-offset-8 hover:text-foreground"
          >
            Back to store
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-10 px-5 py-10">
        {isLoading && <p className="text-sm text-taupe">Gathering the numbers…</p>}
        {isError && (
          <p className="text-sm text-destructive">
            Something went wrong on our side. Try refreshing.
          </p>
        )}

        {data && (
          <>
            <section className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {[
                { label: "Conversations", value: String(data.stats.conversations) },
                { label: "Orders", value: String(data.stats.orders) },
                { label: "Conversion", value: `${data.stats.conversionRate}%` },
                { label: "Top category", value: data.stats.popularCategory },
                { label: "Top pair", value: data.stats.popularProduct },
                { label: "Videos opened", value: String(data.stats.videosOpened) },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-border bg-card p-4 shadow-soft"
                >
                  <p className="label-caps">{stat.label}</p>
                  <p className="mt-2 truncate font-serif text-2xl capitalize">{stat.value}</p>
                </div>
              ))}
            </section>

            <section className="rounded-lg border border-border bg-card p-5 shadow-soft">
              <p className="label-caps">Concierge funnel</p>
              <div className="mt-4 space-y-3">
                {data.funnel.map((step) => {
                  const max = data.funnel[0]?.value || 1;
                  return (
                    <div key={step.label} className="flex items-center gap-4">
                      <span className="w-44 shrink-0 text-xs text-taupe">{step.label}</span>
                      <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <span
                          className="block h-full rounded-full bg-primary transition-[width] duration-700"
                          style={{ width: `${Math.round((step.value / max) * 100)}%` }}
                        />
                      </span>
                      <span className="w-8 text-right text-xs">{step.value}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <Panel title="Catalogue">
                <Table
                  head={["Pair", "Category", "Price", "Stock"]}
                  rows={data.products.map((p) => [
                    p.name,
                    p.category,
                    formatPrice(p.price),
                    String(p.inventory),
                  ])}
                />
              </Panel>
              <Panel title="Craftsmanship films">
                <Table
                  head={["Title", "Duration", "Order"]}
                  rows={data.videos.map((v) => [v.title, v.duration, String(v.order)])}
                />
              </Panel>
            </section>

            <Panel title="Orders">
              <Table
                head={["Order", "Customer", "Pair", "Amount", "Status"]}
                rows={data.orders.map((o) => [
                  o.orderNumber,
                  o.customer,
                  o.product,
                  formatPrice(o.amount),
                  o.status,
                ])}
                empty="No orders yet."
              />
            </Panel>

            <Panel title="Recent conversations">
              <Table
                head={["Started", "Messages", "State", "Selected pair"]}
                rows={data.conversations.map((c) => [
                  new Date(c.createdAt).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }),
                  String(c.messageCount),
                  c.state,
                  c.selectedProduct ?? "—",
                ])}
                empty="No conversations yet."
              />
            </Panel>
          </>
        )}
      </div>
    </main>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card shadow-soft">
      <p className="label-caps border-b border-border px-5 py-3">{title}</p>
      <div className="overflow-x-auto p-5">{children}</div>
    </section>
  );
}

function Table({
  head,
  rows,
  empty,
}: {
  head: string[];
  rows: string[][];
  empty?: string;
}) {
  if (!rows.length) return <p className="text-sm text-taupe">{empty ?? "Nothing here yet."}</p>;
  return (
    <table className="w-full min-w-[420px] text-sm">
      <thead>
        <tr className="border-b border-border text-left">
          {head.map((cell) => (
            <th key={cell} className="label-caps py-2 font-normal">
              {cell}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={index} className="border-b border-border/60 last:border-0">
            {row.map((cell, cellIndex) => (
              <td key={cellIndex} className="py-2.5 capitalize first:font-normal">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
