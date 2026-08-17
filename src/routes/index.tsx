import { createFileRoute, Link } from "@tanstack/react-router";

import heroImage from "@/assets/hero.jpg";
import { ConciergeChat } from "@/components/inuit/ConciergeChat";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "INUIT — Handcrafted Luxury Footwear, Ordered by Conversation" },
      {
        name: "description",
        content:
          "INUIT crafts leather loafers, sneakers, boots and dress shoes in small runs. Shop the collection through a quiet conversation with our concierge.",
      },
      { property: "og:title", content: "INUIT — Handcrafted Luxury Footwear" },
      {
        property: "og:description",
        content:
          "Leather loafers, sneakers, boots and dress shoes, made in small runs. Ordered through a conversation, not a checkout form.",
      },
    ],
  }),
  component: Home,
});

const PILLARS = [
  { title: "Hand-lasted", body: "Each pair shaped on a wooden last, then rested before finishing." },
  { title: "Small runs", body: "Never more than a few hundred pairs of any silhouette." },
  { title: "Full-grain only", body: "Hides selected for grain, tannage and how they age." },
];

function Home() {
  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <span className="font-serif text-xl tracking-[0.42em]">INUIT</span>
          <nav className="flex items-center gap-6 text-[0.6875rem] tracking-[0.2em] text-taupe uppercase">
            <a href="#atelier" className="transition-colors hover:text-foreground">
              Atelier
            </a>
            <a href="#concierge" className="transition-colors hover:text-foreground">
              Concierge
            </a>
            <Link to="/admin" className="transition-colors hover:text-foreground">
              Studio
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-10 px-5 pt-12 pb-16 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:pt-20">
        <div className="animate-fade-up space-y-7">
          <p className="label-caps">Est. 1974 · Handmade in small runs</p>
          <h1 className="font-serif text-[clamp(2.6rem,6vw,4.6rem)] leading-[0.98]">
            Footwear worth
            <br />
            the wait.
          </h1>
          <p className="max-w-md text-[0.9375rem] leading-relaxed text-taupe">
            INUIT makes leather shoes the slow way — one last, one pair, one conversation at a time.
            Our concierge will help you find yours, then arrange delivery to your door.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href="#concierge"
              className="rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Speak with the concierge
            </a>
            <a
              href="#atelier"
              className="text-[0.6875rem] tracking-[0.2em] text-taupe uppercase underline decoration-border underline-offset-8 transition-colors hover:text-foreground"
            >
              Inside the atelier
            </a>
          </div>
          <dl className="grid max-w-md gap-5 border-t border-border pt-7 sm:grid-cols-3">
            {PILLARS.map((pillar) => (
              <div key={pillar.title}>
                <dt className="font-serif text-base">{pillar.title}</dt>
                <dd className="mt-1 text-xs leading-relaxed text-taupe">{pillar.body}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="animate-fade-in relative">
          <div className="overflow-hidden rounded-xl border border-border shadow-panel">
            <img
              src={heroImage}
              alt="A pair of INUIT leather loafers resting on a linen surface in warm light"
              className="aspect-4/5 w-full object-cover"
            />
          </div>
          <p className="label-caps absolute -bottom-6 left-1 hidden lg:block">
            The Milano Loafer · No. 001
          </p>
        </div>
      </section>

      <section id="concierge" className="mx-auto max-w-4xl scroll-mt-20 px-5 pb-24">
        <div className="mb-6 flex items-end justify-between gap-6">
          <div>
            <p className="label-caps">Personal shopping</p>
            <h2 className="mt-1 font-serif text-3xl">Your concierge</h2>
          </div>
          <p className="hidden max-w-xs text-xs leading-relaxed text-taupe sm:block">
            Answer a few quiet questions, see the pairs that suit, watch them being made, and order
            without a single form to fight.
          </p>
        </div>
        <ConciergeChat />
      </section>

      <footer id="atelier" className="border-t border-border bg-secondary/40">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:grid-cols-3">
          <div>
            <p className="font-serif text-xl tracking-[0.42em]">INUIT</p>
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-taupe">
              A small atelier making leather footwear for people who would rather own one good pair.
            </p>
          </div>
          <div className="space-y-2 text-xs text-taupe">
            <p className="label-caps">Atelier</p>
            <p>Mumbai · Florence</p>
            <p>Mon–Sat, 10:00–18:00 IST</p>
          </div>
          <div className="space-y-2 text-xs text-taupe">
            <p className="label-caps">Care</p>
            <p>Complimentary insured delivery</p>
            <p>Lifetime resoling on welted pairs</p>
            <p>concierge@inuit.example</p>
          </div>
        </div>
        <p className="border-t border-border px-5 py-5 text-center text-[0.625rem] tracking-[0.2em] text-taupe/70 uppercase">
          © {new Date().getFullYear()} INUIT · A fictional house, built for demonstration
        </p>
      </footer>
    </main>
  );
}
