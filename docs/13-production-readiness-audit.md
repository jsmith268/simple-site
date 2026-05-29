# Production-readiness audit (2026-05-29)

**Verdict: NOT ready to go live. Adding the API keys will not make it ready — and on
the current code, adding keys is itself dangerous.** Filling in `.env` turns on a
publicly reachable operator console (kill switch, every customer's PII, fleet-wide skill
overrides) and a real-money refund/domain-purchase API with no authentication, points the
app at an empty database with no tables, enables a non-idempotent billing webhook, and
activates a refund button that takes the site down and emails "your refund is on its way"
without actually refunding anyone. The customer build pipeline, as wired, cannot run on
Vercel at all.

The **offline product is genuinely solid** — it typechecks clean, each app builds, the
deterministic block pipeline has a real zero-fail design, the AI-SDK-v6 usage is correct,
and no secrets are committed. The gap is entirely in the *production* path: the things that
only light up when keys are present have, in several cases, never actually been exercised
against a real service.

This audit was produced by reading the current code on `feat/replication-infra`, not the
docs (which claim "all green" but predate the regressions below). Every finding cites
`file:line`. Severity: **P0** = blocks launch / unsafe with real keys; **P1** = will fail
or behave incorrectly in production; **P2/P3** = correctness/hardening.

---

## What is healthy (so we don't relitigate it)

- `pnpm -r typecheck` passes clean (all 16 packages/apps).
- Each app builds with `next build` **individually** (renderer verified: exit 0). A single
  `turbo build` of all three at once can OOM/SIGTERM a worker on a constrained machine —
  operational only; on Vercel each app is its own build.
- Offline (`SIMPLESIGHT_OFFLINE=1`) flow is coherent and safe: never-kill supervisor +
  deterministic fallback + hard render gate (the block pipeline), local JSON store is
  gitignored, and `.data/` holds only test data (`smoke@test.demo`, `amountCents: 0`) — no
  real PII, never committed.
- AI engine internals are current and correct: `ai@6` `generateText` + `Output.object`
  (no stray `generateObject`), the empty-`{}` tool_use workaround (JSON-string wire format +
  retry) is present and sound, model IDs validate against the gateway, retries use
  exponential backoff, convergence is bounded (`maxPasses: 3`).
- Stripe webhook signature verification uses the raw body correctly **when keys are present**.
- The bespoke engine is now wired to the customer path — the earlier "orphaned engine"
  finding is resolved (`onboarding/[projectId]/conversation-actions.ts:29` → `runRound` →
  `runBespokeBuild`).

---

## P0 — Launch blockers (adding keys does not fix these)

### P0-1 · No authentication or authorization anywhere
No auth library is installed (no `@clerk/*`, no `next-auth` in any `package.json`); there is
no `middleware.ts`/`proxy.ts` in `apps/portal`. The `customers.clerkUserId` column
(`packages/db/src/schema/core.ts:19`) is never set or read.

- **Operator console is fully public.** `GET /admin` renders every customer's project, email,
  spend and escalations (`apps/portal/app/admin/page.tsx`). Every operator action is a
  `"use server"` function with no caller check: kill switch (`admin/actions.ts:38`),
  fleet-wide skill/prompt overrides (`admin/skills-actions.ts:30`, `admin/intake-actions.ts:28`,
  `admin/builds-actions.ts:112`), build re-trigger (`admin/actions.ts:44`).
- **Customer IDOR.** Every customer loader/action takes `projectId` from the URL with no
  ownership check — anyone with a project id can read or mutate anyone's project
  (`dashboard/actions.ts`, `studio/[projectId]/studio-actions.ts`, `onboarding/actions.ts`).
- **Real-money actions are unauthenticated.** `refundAction`, `buyDomainAction`,
  `goLive*Action` (`dashboard/go-live-actions.ts:54,70,78,89`) and the build route
  (`api/projects/[projectId]/build/route.ts:10`) can be invoked by anyone for any project.

**Fix:** install + wire Clerk; add a portal `proxy.ts` session gate; add an operator-role
check on `/admin/**` and every admin action; add a `requireOwnedProject(projectId)` helper
used by every customer loader/action (server actions must re-verify — a proxy alone does not
protect direct server-action invocation).

### P0-2 · No database migrations exist
`packages/db/migrations/` does not exist and no `.sql` has ever been generated
(`drizzle.config.ts` → `out: './migrations'`, empty). Adding `DATABASE_URL` connects to an
**empty Postgres with zero tables**; every repo query throws `relation "..." does not exist`.
Offline mode hides this because it never touches Postgres.
**Fix (mandatory):** `pnpm db:generate` then `pnpm db:migrate` against the Neon URL; add a CI
check that schema == latest migration to prevent future drift.

### P0-3 · Stripe webhook is not idempotent; subscription/refund records are dropped
`apps/portal/app/api/stripe/webhook/route.ts:21` → `createPurchasedProject`
(`packages/db/src/repos/commerce.ts:54`) unconditionally inserts a project + payment with no
dedup on Stripe `event.id` or `paymentIntentId`, and there is **no unique index on
`payments.stripePaymentIntentId`** (`schema/core.ts:61`). Stripe delivers at-least-once →
duplicate customers, projects, and fulfilment on every retry. The `subscriptions` and
`refunds` tables are **never written by any code** (verified by grep) — the hosting
subscription id from the webhook is logged and discarded (`route.ts:30`).
**Fix:** persist + dedup on `event.id`; add `unique()` on `stripePaymentIntentId` and upsert
by it; wrap project+payment creation in `db.transaction`; persist subscription + refund rows.

### P0-4 · Refund issues no refund and cancels no subscription in production
`refundAction` calls `refundAndCancel({})` with an **empty object**
(`dashboard/go-live-actions.ts:95`); `refundAndCancel` only acts when given
`paymentIntentId`/`subscriptionId` (`billing.ts:134`), which are never persisted/loaded. So in
live mode no Stripe refund is issued and no subscription cancelled, yet the project is set to
`refunded`, the site is unpublished, and the customer is emailed "your refund is on its way"
(`go-live-actions.ts:96-100`). Customer gets no money back and keeps being billed — a
chargeback/legal landmine.
**Fix:** persist `paymentIntentId` + `subscriptionId`; load and pass them; record a `refunds`
row; only email after the Stripe refund succeeds.

### P0-5 · Build and go-live are not gated on payment
`runBuildPipeline` checks only the kill switch + daily budget — never payment status
(`packages/agents/src/pipeline.ts:50`). `goLive` flips the project to `live` with no check
that a hosting subscription exists or was paid (`provisioning/src/publish.ts`,
`db/src/repos/hosting.ts:90`), and nothing forces the customer to complete the hosting
checkout — the publish button is independent of it. No `invoice.payment_failed` /
`customer.subscription.deleted` handling, so a site stays live forever even if the
subscription is never paid.
**Fix:** gate the build on a verified `buildFeePaidAt`; require an active subscription before
`markLive`; handle dunning/cancellation webhooks to unpublish.

### P0-6 · The bespoke build cannot run in Vercel's serverless runtime
Customer onboarding fires `void runRound(projectId).catch(...)`
(`onboarding/[projectId]/conversation-actions.ts:29`) — fire-and-forget inside a server
action. On Vercel the function instance is frozen/killed once it responds; there is no queue,
no Vercel Workflow, no `waitUntil` (confirmed: no WDK/Inngest/QStash anywhere). The build then
shells out to `npm install` + `npm run build` (`bespoke/runner.ts:31`) and `vercel deploy`
via the CLI reading a local macOS `auth.json` (`bespoke/deploy.ts:14,56`), writing to
ephemeral `tmpdir()` (`dual.ts:45`). None of this exists on a server. The production-correct
`SandboxBuildRunner` is a throwing stub (`runner.ts:49`). Realistic outcome in production: the
customer is stuck on "Generating…" forever, or silently downgraded to a template (see P0-7).
**Fix:** run bespoke builds in a durable background executor with a real build host (Vercel
Workflow/Sandbox or a queue + worker); replace `LocalBuildRunner` with the Sandbox runner and
the CLI deploy with the Vercel REST deploy API.

### P0-7 · AI routing degrades to a template silently (and the key is likely misnamed)
The free-tier AI Gateway blocks Opus/Sonnet (the code's own comments say so —
`engine/src/resilient.ts:18`). A gateway 402/403 is **not** treated as transient
(`resilient.ts:58`), so it throws out of `runBespokeBuild`, is caught in `dual.ts:179`, and
the variant **silently falls back to a deterministic block template** presented to the
customer as "Studio A" — they paid for bespoke AI and get a template with no alert.
Compounding this, project memory and the engine audit both report `.env` defines
`ANTROPIC_KEY` (typo, should be `ANTHROPIC_API_KEY`), which would force Opus through that
blocking gateway instead of the direct Anthropic API. (`.env` is permission-protected; I could
not read it directly — **verify the key name before launch**, it is very likely the typo.)
**Fix:** rename the key in `.env`/Vercel env; detect gateway 402/403 explicitly and
fail-loud / hold-for-human rather than degrade to a template; prefer the direct Anthropic key
whenever present.

---

## P1 — Will fail or behave incorrectly in production

- **Go-live is partly simulated.** The `smoke_test` step is a hardcoded
  `succeeded` with no real HTTP check (`publish.ts:50`); SSL is recorded succeeded
  unconditionally (`publish.ts:44`); subdomain go-live is a pure DB flip with zero
  verification (`publish.ts:45`). A site is marked "live" even when unreachable.
- **The free-subdomain product has no wildcard provisioning.** `username.<ROOT>` requires
  `*.<ROOT_DOMAIN>` + a wildcard cert attached to the renderer project; nothing in code does
  this (`renderer/proxy.ts:17` assumes it). Undocumented manual prerequisite — without it the
  entire subdomain preview/go-live is unreachable.
- **Bespoke-vs-renderer go-live mismatch.** Bespoke sites deploy as their own Vercel project,
  but domain attach targets the renderer via `VERCEL_RENDERER_PROJECT_ID`
  (`provisioning/src/vercel.ts:54`), which serves the *SiteSpec* — so a custom domain points at
  the wrong site or a renderer 404.
- **Two divergent build pipelines.** Customer path = bespoke; admin "rebuild", dashboard
  "request changes", and the watchdog all run the *legacy block* pipeline (`runBuildPipeline`).
  A watchdog "restart" of a stalled bespoke build produces a different, block-mode site.
- **Watchdog is non-idempotent.** It re-triggers stale runs without marking the old run failed
  (`api/cron/watchdog/route.ts:30`, `pipeline.ts:50`), so the stale run re-matches on every
  tick → duplicate builds + double LLM spend. Also the cron is scheduled daily
  (`vercel.json`), contradicting the 15-minute staleness constant — on Hobby, recovery is ~24h.
- **`resend` and `@vercel/blob` are not installed** — they exist only as string-indirection
  dynamic imports (`observability/src/notify.ts:31`, `onboarding/[projectId]/brand-actions.ts:18`),
  absent from every `package.json`. So transactional email and logo upload **throw at runtime
  in production** when their keys are set. Email is effectively non-functional.
- **Neon driver/pooling.** Uses `postgres-js` over TCP with no `max` set (`db/src/client.ts:19`);
  on serverless this exhausts Neon connections under load unless the **pooled** URL is used.
  Not enforced or documented.
- **Half-online env states are unguarded.** `isOffline()` (AI-key based) and `hasDatabase()`
  (DATABASE_URL based) are decoupled (`env/src/index.ts:8,20`). AI-key-but-no-DB runs live LLMs
  writing to ephemeral `.data` (lost between invocations); DB-but-`OFFLINE=1` writes mock sites
  into the real DB. No fail-fast assertion ties them together.
- **DNS instructions are hardcoded guesses** (`vercel.ts:33` returns `76.76.21.21` /
  `cname.vercel-dns.com`) instead of reading the per-domain config from the Vercel API; attach
  and status calls don't check `res.ok`; `buyDomain` omits `expectedPrice` and will likely 400.
- **Customer build cost is uncapped** — `dual.ts:231` never passes `costCeilingCents` to
  `runBespokeBuild`.
- **A paying customer can't reach onboarding.** The `purchaseReceived` email has no link/id
  (`observability/src/notify.ts:63`) and `/onboarding/recent` is static — the intended "secure
  link" does not exist.
- **Refinement is a silent no-op in production.** `applyRevision` needs `variant.buildDir` on
  disk (`revise.ts:122`); in production that dir is in a dead instance's `/tmp`, so it takes the
  no-op branch and tells the customer "applied a refinement pass" without changing anything.
- **CRON_SECRET is optional and not constant-time.** If unset (the default), the watchdog
  endpoint is fully public — LLM-spend/DoS (`watchdog/route.ts:18`, `env/src/index.ts:43`);
  comparison uses `!==`.
- **Stored XSS via JSON-LD.** `JSON.stringify(...)` is injected with
  `dangerouslySetInnerHTML` into `<script type="application/ld+json">`
  (`renderer/.../page.tsx:44`, `renderer/lib/seo.ts:78`) without escaping `<`/`>`/`&`. The
  data is AI-generated from crawled URLs + customer free-text — not trusted. A
  `</script><script>` payload executes on the public tenant site.

---

## P2 / P3 — Correctness & hardening

- `?tenant=` host override is not gated to non-prod (`renderer/proxy.ts:14`).
- `/api/hit` analytics accepts unauthenticated writes for any username (count inflation).
- `saveSiteSpec` rewrites pages/blocks outside a transaction (`repos/pipeline.ts:303`); a crash
  leaves a half-built live site.
- `reserveUsername` is check-then-update with no transaction → race throws an unfriendly 500
  (`repos/intake.ts:25`).
- `connection_steps` inserts with no `onConflictDoUpdate` against its unique index → retried
  step throws in Postgres (`repos/hosting.ts:76`).
- Renderer `demoSpec` fallback serves a fake site whenever `DATABASE_URL` is absent
  (`renderer/lib/tenant.ts:14`) — risky if the renderer is deployed without a DB.
- No `Content-Security-Policy` on the renderer (defense-in-depth for the XSS sink above).
- `db:seed` is a stub (`db/src/seed.ts:18`).
- Dead code: `runAiBuild` has no callers; `wizard.tsx` + `submitOnboardingAction` are orphaned.
- `STRIPE_PRICE_BUILD_FEE` is not in the env schema; a missing price id sends an empty cart →
  a $0 "purchase" still fulfils (`billing.ts:38`). Annual hosting price is hardcoded in the UI
  and may not match the Stripe price (`go-live/page.tsx:9`).
- Env typos: `USPLASH_APPLICATOIN_ID` / `UNSPLASH_*` (per engine audit; cosmetic).

---

## Recommended order to reach launchable

1. **Auth first** (P0-1) — Clerk + portal `proxy.ts` + operator-role gate + `requireOwnedProject`.
   Nothing else is safe to expose until this lands.
2. **Database** (P0-2) — generate + run migrations; add the missing unique constraints.
3. **Money correctness** (P0-3, P0-4, P0-5) — idempotent webhook, persist subscription/refund,
   real refund, gate build/go-live on payment, handle dunning.
4. **Make the build run in prod** (P0-6, P0-7) — durable executor + Sandbox runner + API deploy;
   fix the AI key name and gateway-402 handling.
5. **Make go-live real** (P1) — provision the renderer wildcard, replace the fake smoke test /
   hardcoded DNS with real checks, reconcile the bespoke-vs-renderer target, fix the watchdog,
   install `resend`/`@vercel/blob`, use the Neon pooled URL, add the env fail-fast assertion.
6. **Hardening** (P1/P2) — escape JSON-LD + add CSP, lock down `/api/hit` and `?tenant=`,
   transaction-wrap the multi-row writes.

Until items 1–4 are done, **do not add live keys** — the current code would expose an open
admin console with a real-money API, an empty database, broken billing, and a build pipeline
that can't run.
