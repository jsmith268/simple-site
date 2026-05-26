# SimpleSight

An autonomous web-development agency. A customer pays, completes an intake, and an
agentic pipeline designs, builds, reviews, fixes, and publishes a complete, professional
**informational** website — with the guarantee that **every paying customer always ends up
with a live website**.

> Scope is the brand promise: simple, informational business sites done extremely well —
> no heavy animation, no complex web-apps.

## Monorepo layout

```
apps/
  marketing/   Public marketing site + pricing (the original simple-site)
  portal/      Customer dashboard + operator console + API + onboarding
  renderer/    Multi-tenant renderer — serves every site at username.<ROOT_DOMAIN>
packages/
  contracts/   Zod domain types (SiteSpec, ThemeTokens, Intake, Agent/Critic)
  blocks/      16-block library + registry + defensive renderer + baseline assembler
  theme/       Design tokens → CSS variables, presets, WCAG contrast
  engine/      Agentic engine: model routing, LLM runner (AI SDK v6), defineAgent,
               buildLlmCritic, never-kill supervisor, checkpointed conductor
  agents/      Pipeline stages (discovery/theme/copy/seo) + render-verify + runBuildPipeline
  db/          Drizzle schema + repos; Postgres in prod, JSON-store facade offline
  provisioning/ Stripe billing + Vercel deploy/domains + two-phase go-live
  seo/ extractors/ observability/ env/ ui/
```

## How it works

```
purchase (Stripe) → onboarding intake → build pipeline → preview at user.simplesight.co
→ go-live (subdomain / custom domain) + hosting subscription → 30-day money-back guarantee
```

The build pipeline (`runBuildPipeline`): **discovery → theme (WCAG critic) → baseline
assemble → copy → SEO → render-verify (hard schema gate) → publish**. Each stage runs
through the conductor: producer → read-only critic → never-kill supervisor, with a bounded
revise loop and a **deterministic fallback** so a stage failure can never sink the build.

### The zero-fail guarantee

Literal zero-failure isn't possible with LLMs — so instead the architecture guarantees the
thing customers pay for: *a finished, professional site, always.*

1. **Deterministic baseline floor** — the pipeline never builds from nothing; it enhances a
   complete, valid site assembled from the block library. Worst case, the customer gets that.
2. **Never-kill supervisor** — quality issues converge or escalate-and-continue; output is
   never silently lost.
3. **Checkpointed, resumable conductor** + a **watchdog cron** (`/api/cron/watchdog`) that
   restarts stale runs.
4. **Hard render gate** — every block's props are validated against its Zod schema before
   persistence; the renderer can never receive an invalid block.

## Running locally (offline — no external services)

```bash
pnpm install
cp .env.example .env          # SIMPLESIGHT_OFFLINE=1 is the default
pnpm dev                       # marketing :3000, renderer :3001, portal :3002
```

Offline mode uses deterministic agents and a local JSON store (`.data/`), so the entire
flow — purchase → onboarding → build → preview → go-live → refund — runs with **zero**
external services. Verify it:

```bash
pnpm --filter @simplesight/portal acceptance   # 4 zero-fail drills
```

Preview a tenant: open `http://localhost:3001/?tenant=<username>`.

## Going to production

Fill the keys in `.env` (see `.env.example`):

- **DATABASE_URL** — Neon Postgres. Then `pnpm db:generate && pnpm db:migrate`.
- **AI** — `AI_GATEWAY_API_KEY` (or `VERCEL_OIDC_TOKEN`) routes agents through the Vercel AI
  Gateway; agents switch from deterministic to LLM-enhanced automatically.
- **STRIPE_*** — build fee + monthly/annual hosting + webhooks.
- **VERCEL_API_TOKEN / VERCEL_RENDERER_PROJECT_ID** — custom domains + dedicated deploys.
- **ROOT_DOMAIN** — point it at Vercel nameservers and add `*.<ROOT_DOMAIN>` to the renderer
  project for wildcard subdomain previews.

Nothing else changes — the repos and provisioning are written to light up the moment the
keys are present.

## Build status

All six build phases are implemented and verified offline (each is a commit on
`simplesight-build`): monorepo · blocks+renderer · intake+commerce · engine+pipeline ·
portals · hosting/domains/go-live · hardening. See `docs/00-simplesight-master-plan.md`.
