# Fresh audit + new-feature plan (autonomous session, ~01:27)

W1–W8 of `docs/10` are done & committed (engine perf, transactional email, logo/brand,
project settings, billing model, admin intake console, generated-site SEO, full e2e
typecheck+build green). ~3h of the window remain. **Still ZERO product API spend** — only
code, typecheck, `next build`, offline runs.

## Where the product still falls short of the $10k bar (no-API gaps)

1. **Generated sites have no favicon or social-share image.** Sharing a link shows a blank
   card; the browser tab has the default icon. Cheap to fix deterministically from the brand.
2. **Customers can't see that their site is working.** No analytics — no views/visitors. A
   live owner wants proof people are landing. A privacy-friendly counter is high ongoing value.
3. **No version history.** Each revision overwrites; a customer can't see or restore a prior
   version. Risky and anxiety-inducing for a $10k purchase.
4. **No sitemap.xml / robots.txt** for generated sites (SEO hygiene).
5. **Design ceiling**: the block library is solid but light on variety (no logo-cloud,
   stats, or richer testimonial/pricing variants in some paths).
6. **No auth** (Clerk) — customers reach projects by link. Real, but larger; defer.

## New-feature plan (priority — highest customer value, all no-API)

- **NW1 · Brand favicon + OG share image.** Deterministic SVG favicon + a 1200×630 OG image
  (monogram + business name + tagline on the brand gradient) served from the renderer; wired
  into tenant metadata (icons + openGraph.images). Reuses `brand-utils` monogram logic.
- **NW2 · robots.txt + sitemap.xml** for the renderer (per-tenant sitemap from the SiteSpec
  pages; robots allows + points at sitemap).
- **NW3 · Privacy-friendly analytics.** A tiny `/api/hit` beacon (no cookies, no PII) that
  records per-project page views to the store + a dashboard widget ("X views this week").
- **NW4 · Version history.** Snapshot each finalized/revised variant spec; a dashboard list
  to view/restore a prior version (offline-safe, no API).

Implement in order, commit each, typecheck + build to verify. Continue until 04:49, then
restore the cc-watchdog and write the final summary.

## Status — all four shipped & verified (~02:35)

- **NW1 ✅** favicon + OG/Twitter cards (next/og) — verified live (valid PNGs, all meta tags).
- **NW2 ✅** per-tenant robots.txt + sitemap.xml — verified live (200, content-types).
- **NW3 ✅** cookieless analytics + dashboard widget — verified live (5 hits → dashboard 5/sparkline/top-pages).
- **NW4 ✅** version history snapshot + restore — verified (panel renders, restore reuses saveSiteSpec).

Full workspace typecheck + portal/renderer/marketing builds all green. Round-2 plan in `docs/12`.
