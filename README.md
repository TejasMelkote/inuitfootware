# INUIT

**A luxury footwear house you shop by talking.**

I am **Tejas Melkote**. INUIT is my original concierge storefront — a full-screen conversation that helps you find a pair, watch it being made, and place an order, without a typical product grid or checkout form.

Live: [inuitfootware.vercel.app](https://inuitfootware.vercel.app)

I built this because I wanted shopping to feel like a private stylist, not a catalog. The house is fictional. The product, the chat, the studio dashboard, and the deployment are mine.

## What I designed

- A guided conversation: category → style → colour → size
- Product carousels, detail cards, and a size picker inside the chat
- Craft films from the atelier
- Delivery capture and order lookup
- A progress rail so the session always feels composed
- An internal studio at `/admin` for funnel, inventory, and orders

The brand voice is quiet and specific. Unknown messages get a warm recovery, not an error.

## How I built it

| Layer | Choice |
| --- | --- |
| UI | React 19, TypeScript, Tailwind, shadcn/ui |
| App | TanStack Start, Router, and Query |
| Catalog & orders | Built-in atelier data (optional Supabase) |
| Language | Keyword intent, optional Groq if a key is present |

I am a B.Tech Computer Science (AI) student at Manipal Institute of Technology, Bengaluru. This project sits at the intersection of the things I care about: conversational interfaces, product design, and shipping a full stack that actually works in production.

More of my work: [tejas-melkote.vercel.app](https://tejas-melkote.vercel.app) · [GitHub](https://github.com/TejasMelkote)

## Run it locally

Nothing to configure. No API keys, no `.env`, no URLs.

```sh
git clone https://github.com/TejasMelkote/inuitfootware.git
cd inuitfootware
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:3000`). The catalog, concierge, orders, and studio all run from the built-in atelier data. Chat lives in your browser session.

### Optional extras

If you want a hosted database or smarter language, copy `.env.example` to `.env`. Everything below is optional — the app already works without them.

| Variable | Why I use it |
| --- | --- |
| `SUPABASE_URL` / `VITE_SUPABASE_URL` | Hosted catalog instead of the built-in one |
| `SUPABASE_PUBLISHABLE_KEY` / `VITE_SUPABASE_PUBLISHABLE_KEY` | Catalog and video reads from Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Save chats, orders, and studio analytics |
| `GROQ_API_KEY` | AI intent detection. Falls back to keywords if unset. |
| `SITE_URL` | Canonical origin. Vercel fills this in production. |

## Deploy

This is a TanStack Start app. Vercel runs the Nitro server on Functions.

1. Import `TejasMelkote/inuitfootware` at [vercel.com/new](https://vercel.com/new).
2. Deploy. No environment variables are required.
3. Framework preset: **TanStack Start**. Add Supabase or Groq later only if you want hosted persistence or AI replies.

```sh
vercel link
vercel env pull
vercel
```

## Conversation I wrote

1. Welcome, then a light preference question
2. Category → style → colour → size (free text can skip ahead)
3. Ranked recommendations with carousels and product cards
4. Craft films, size guide, or delivery
5. Order placement and lookup
6. A close, with the option to start a new styling session

`/admin` is omitted from the sitemap. It is my studio view, not a public page.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local development |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

---

Designed, written, and shipped by **Tejas Melkote**, Bengaluru.
