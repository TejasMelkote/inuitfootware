# Routes

I keep every page as a file in this folder. TanStack Start maps each `.tsx` file to a URL — there is no `pages/` or `app/` directory in this project.

| File | URL |
| --- | --- |
| `index.tsx` | `/` — the INUIT storefront and concierge |
| `admin.tsx` | `/admin` — my studio dashboard |
| `__root.tsx` | App shell. Must keep `<Outlet />`. |
| `api/public/*.ts` | Public catalog, videos, and order lookup |

`routeTree.gen.ts` is generated. I do not edit it by hand.

— Tejas
