/** Canonical site origin for sitemap, robots, and absolute links. */
export function getSiteUrl(): string {
  const explicit = process.env["SITE_URL"] ?? process.env["VITE_SITE_URL"];
  if (explicit) return explicit.replace(/\/$/, "");

  const production = process.env["VERCEL_PROJECT_PRODUCTION_URL"];
  if (production) return `https://${production.replace(/\/$/, "")}`;

  const preview = process.env["VERCEL_URL"];
  if (preview) return `https://${preview.replace(/\/$/, "")}`;

  return "http://localhost:3000";
}
