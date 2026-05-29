# Second audit round + round-2 features (~02:35)

W1–W8 (docs/10) and NW1–NW4 (docs/11) are done & committed, ~3h still on the clock,
still ZERO product API spend. Re-audited for the next batch of high-value, no-API,
offline-verifiable improvements.

## Gaps found this round

1. **Every page shares the homepage's `<title>`/description.** `generateMetadata` uses
   only the site-level `seo` defaults; each `Page` carries its own `seo {title, description}`
   that's ignored. A real correctness/SEO bug on multi-page sites.
2. **No branded 404 for unknown tenants** — bare Next default. And the `/preview/variant/*`
   routes are indexable (should be `noindex`).
3. **No security headers** on served sites (X-Content-Type-Options, Referrer-Policy,
   X-Frame-Options/frame-ancestors, basic permissions). Cheap hardening.
4. **Sitemap has no `<lastmod>`** — now that version history records a timestamp per write,
   the sitemap can advertise freshness. And inner pages lack breadcrumb JSON-LD.
5. **Operator has no cross-tenant analytics view** — NW3 is per-project only; the fleet
   console can't see total reach.

## Round-2 plan (priority)

- **NW5 · Per-page SEO.** `generateMetadata` resolves the page by slug and uses its own
  `seo.title`/`seo.description` (fallback to site defaults); per-page canonical + OG title.
- **NW6 · Branded not-found + crawl hygiene + security headers.** Renderer `not-found.tsx`
  (branded), `noindex` on `/preview/*`, and security response headers via `proxy.ts`.
- **NW7 · Sitemap `<lastmod>` + breadcrumb JSON-LD.** lastmod from the latest version
  timestamp; BreadcrumbList JSON-LD on inner pages.
- **NW8 · Admin fleet analytics.** A `getFleetHitTotals()` aggregate + a section in
  `/admin` showing total views and the top tenants by reach.

Implement in order, commit + verify each (typecheck/build + live offline curl where possible).
Continue until 04:49, then restore cc-watchdog defaults and write the final summary.
