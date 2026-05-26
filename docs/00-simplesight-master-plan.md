# SimpleSight — Master Plan

> An autonomous web-development agency. A customer pays, completes an intake, and an
> agentic pipeline designs, builds, reviews, fixes, and publishes a complete, professional
> informational website — with a guarantee that **every paying customer always ends up with
> a live website**.

**Status:** design (v0.1, 2026-05-26)
**Scope of SimpleSight:** simple, informational business websites — no heavy animation, no
complex web-apps. The brand promise *is* the constraint: simple sites, done extremely well.

---

## 0. North star and the honest version of "zero failure"

Literal zero-failure is not achievable with LLMs — individual agent calls will fail, time out,
return malformed output, or produce sub-threshold work. So we do not promise that. We promise
the thing the customer actually cares about:

> **Every customer who completes onboarding sees a finished, professional website at the end —
> always.**

That is achievable, and the entire architecture is bent toward it through four mechanisms,
borrowed and hardened from the multi-blog audit:

1. **A deterministic baseline floor.** The pipeline never builds "from nothing." It starts from
   a guaranteed-valid, already-good site assembled from a curated **block library + a generated
   design-token theme**. Agents *progressively enhance* that baseline. If every enhancement
   step failed, the customer would still get the (already professional) baseline. There is no
   state in which the output is "broken" or "empty."
2. **Supervisor never kills on quality.** Multi-blog's hardest-won lesson: the supervisor
   *never* returns `kill` for quality issues. A failed gate either converges (retry within a
   small budget) or **holds for human review** — output is never silently lost. SimpleSight
   inherits this exactly, with "human review" being our internal ops queue, invisible to the
   customer.
3. **Durable, crash-safe orchestration.** The build runs as a Vercel Workflow (`'use workflow'`
   / `'use step'`). Steps are checkpointed and retried automatically; a crash, timeout, or
   redeploy **resumes from the last completed step**, not from scratch. A watchdog auto-restarts
   any run that goes stale.
4. **Convergence over per-gate loops.** Instead of N independent review→fix loops that can
   thrash, a bounded "managing-editor" convergence gate collects *all* findings and fixes them
   together (multi-blog proved this converges where per-gate loops did not).

The customer-facing SLA is therefore: *finished site within the build window, or your money
back* — backed by the 30-day guarantee, not by a fictional zero-fail claim.

---

## 1. End-to-end product flow

```
  Marketing site (existing simple-site)
        │  "Get your website" → pricing → checkout
        ▼
  [1] PURCHASE  (Stripe Checkout: one-time build fee; hosting subscription offered later)
        │  webhook: checkout.session.completed  → create Customer + Project, start onboarding
        ▼
  [2] ONBOARDING / INTAKE  (gated, post-purchase, saved incrementally)
        │  • Style & theme questionnaire (tone, audience, color feel, references they like)
        │  • Business info (name, services, hours, locations, contact, socials)
        │  • Asset upload (their own photos → Vercel Blob)
        │  • Optional: link existing website/socials → we crawl for more context
        │  • Username chosen → reserves  username.simplesight.co
        ▼
  [3] BUILD PIPELINE  (durable Vercel Workflow — the agentic core, §4)
        │  Discovery → Design Brief → Theme → Content → Assembly → Copy/SEO →
        │  per-stage critic + bounded fix loop → Convergence gate → Baseline-guaranteed
        ▼
  [4] PREVIEW  (multi-tenant renderer)
        │  Customer sees their site live at username.simplesight.co
        │  Customer dashboard: request changes (→ targeted re-run), approve
        ▼
  [5] GO-LIVE  (only after customer approves + hosting subscription active)
        │  • Stay multi-tenant on a real domain, OR promote to a dedicated Vercel deployment
        │  • Buy a domain through us, OR bring their own (we emit exact A/CNAME records)
        ▼
  [6] HOSTING (recurring)  + 30-day money-back guarantee window
```

Two portals observe this:
- **Customer dashboard** — progress, preview, request-changes, approve, billing, domain.
- **Admin/operator portal** — the multi-blog-style deep observability: every run, stage,
  agent invocation, critic verdict, cost, escalation; plus kill switch, retry, override.

---

## 2. System architecture (pnpm + Turbo monorepo)

The existing single-app `simple-site` becomes `apps/marketing`. New apps and packages around it.

```
simple-site/                      # repo root (pnpm workspace + turbo)
├── apps/
│   ├── marketing/                # existing simple-site — public site + pricing + checkout entry
│   ├── portal/                   # customer dashboard + admin/operator console (route groups)
│   └── renderer/                 # multi-tenant Next app: serves username.simplesight.co
├── packages/
│   ├── contracts/                # zod schemas + TS types: Project, Intake, Brief, SiteSpec,
│   │                             #   Block, ThemeTokens, Agent<I,O>, Critic, Verdict, RunState
│   ├── db/                       # Drizzle schema + client + repos (Neon Postgres)
│   ├── engine/                   # the agentic build engine (workflow, conductor, supervisor,
│   │                             #   convergence gate, model routing) — adapted from multi-blog/ai
│   ├── agents/                   # individual producer + critic agents (prompts + invoke)
│   ├── blocks/                   # the curated React block library + block registry/schemas
│   ├── theme/                    # design-token → CSS-vars (port multi-blog/theme)
│   ├── seo/                      # JSON-LD / schema.org / sitemap (port multi-blog/seo)
│   ├── extractors/               # crawl existing site / socials (port multi-blog/extractors)
│   ├── provisioning/             # Vercel deploy API, domains/DNS, Stripe billing wrappers
│   ├── observability/            # pino logger, tracing, cost capture (port multi-blog/observability)
│   └── ui/                       # shared portal UI components
├── docs/                         # this plan + per-module specs (mirrors multi-blog/docs)
└── turbo.json, pnpm-workspace.yaml, tsconfig.base.json
```

**Reuse from multi-blog (all *ported/adapted*, not imported — different DB schema, different
domain):** `theme`, `seo`, `extractors`, `observability`, `contracts` patterns are near-drop-in.
The *engine* borrows multi-blog's best architecture (`Agent<I,O>` interface, generic `runStep`
conductor, read-only critics with hard floors, never-kill supervisor, convergence gate, model
routing, full per-call invocation logging) but is rebuilt on the **Vercel Workflow DevKit** for
true crash-safe resume — closing the one real gap the audit found (multi-blog has no mid-run
resume; recovery is whole-attempt re-run).

**Stack:** Next.js 16, React 19, Tailwind v4 (matches existing). AI SDK v6 (`ai@^6`) via Vercel
AI Gateway (`provider/model` strings). Workflow DevKit (`workflow`, `@workflow/ai`). Drizzle +
Neon. Stripe. Clerk for portal auth. Vercel Blob for assets/artifacts.

> Per repo `AGENTS.md`: this is a modified Next.js — read `node_modules/next/dist/docs/` before
> writing Next-specific code. Per the workflow skill: read `node_modules/workflow/docs/` and
> verify AI SDK surface against `node_modules/ai/docs/` before writing engine code. Do not trust
> memorized APIs.

---

## 3. Data model (Neon Postgres / Drizzle)

Adapted from multi-blog's orchestration schema (which is excellent), reframed from "sites/posts"
to "projects/sites," and with provisioning promoted to typed columns (a gap the audit flagged).

**Customer & commerce**
- `customers` — id, clerk_user_id, email, stripe_customer_id, created_at.
- `projects` — id, customer_id, status (`purchased | onboarding | building | preview |
  changes_requested | approved | live | refunded | cancelled`), build_fee_paid_at,
  refund_deadline_at (purchase + 30d), username (reserves `username.simplesight.co`, unique).
- `subscriptions` — project_id, stripe_subscription_id, plan, status, current_period_end.
- `payments` / `refunds` — stripe ids, amounts, reasons, timestamps.

**Intake**
- `intakes` — project_id, style answers (jsonb), business info (jsonb), reference_urls (jsonb),
  crawled_context (jsonb), completed_at. Saved incrementally (each step upserts).
- `assets` — project_id, blob_url, kind (photo/logo), alt, width/height, dominant_color,
  source (`upload | crawl`), usage (where placed).

**Site definition (the generated artifact — data, not code)**
- `sites` — project_id, status, theme_tokens (jsonb), brand (jsonb: name/tagline/voice),
  nav (jsonb), seo (jsonb), live_domain, preview_username.
- `pages` — site_id, slug, title, seo (jsonb), order.
- `page_blocks` — page_id, block_type (FK to block registry), props (jsonb, validated against
  the block's zod schema), order. **This is what the renderer reads.**

**Orchestration (ported almost verbatim from multi-blog — proven design)**
- `pipeline_campaigns` — project_id, kind (`initial_build | change_request`), status
  (`in_progress | awaiting_review | approved | escalated | max_attempts_exceeded`),
  current_attempt, max_attempts (default 5), total_cost_cents.
- `pipeline_runs` — campaign_id, project_id, workflow_run_id (the Workflow DevKit run id!),
  status, attempt_number, trigger_reason, cost_cents, started/finished.
- `workflow_steps` — run_id, step_name, status (`queued|running|completed|failed|skipped`),
  attempt_number, idempotency_key, artifact_id, critic_verdict_id, error_message.
- `artifacts` — type, run_id, produced_by_agent(+version), parents[], blob_url | inline_json,
  input_hash, cost_cents. (content-addressed; provenance DAG)
- `critic_verdicts` — artifact_id, critic_name, verdict (`pass|revise|reject`), score,
  reasons, suggestions, axes (jsonb), floor_violations, cost_cents.
- `supervisor_decisions` — run_id, step_name, attempt, decision (`continue|retry_producer|
  escalate|hold_for_human`), reasoning.
- `agent_invocation_details` — full per-LLM-call transparency: run_id, step_name, attempt,
  call_index, model, system_prompt, user_message, raw_output, parsed_output, tokens, cost,
  ms. (powers the operator inspector + customer "behind the scenes" view if desired)
- `agent_costs_daily`, `agent_versions`, `prompt_overrides` — budget + versioning + operator
  override, as in multi-blog.

**Provisioning & hosting (promoted to typed columns — audit gap fix)**
- `deployments` — site_id, vercel_project_id, vercel_deployment_id, deploy_url, ready_state,
  is_production, created_at.
- `domains` — site_id, domain, type (`subdomain | custom`), verified, verification (jsonb:
  required A/CNAME/TXT records to show the customer), ssl_status, attached_at.
- `connection_steps` — site_id, step_name (`deploy | domain_attach | dns_records | dns_verify |
  ssl_issue | smoke_test | marked_live`), status, attempt, metadata (jsonb), error_message.

**Control & resilience**
- `fleet_settings` — singleton: autonomous_mode, daily_budget_ceiling_cents,
  per_stage_max_revisions (default 2), per_run_max_retries, quality_floors (jsonb),
  kill_switch_engaged (+reason).
- `escalations` — project_id, run_id, kind, severity (`info|warn|critical`), body, handled_at.

---

## 4. The agentic build pipeline (the heart)

A `pipeline_campaign` of kind `initial_build` runs as one durable **parent Vercel Workflow** per
project. Each stage is a **child workflow** (research recommends child-workflows-per-stage to stay
under the 240s replay budget). Inside a stage, each agent / critic / fix is a `'use step'`
function — full Node access, automatic retry, checkpointed.

### 4.1 Roles (the multi-blog three-role separation — non-negotiable)
- **Producer agent** — creates or fixes an artifact. Pure: prompt in, Zod-validated artifact out.
- **Critic agent** — *read-only*, multi-axis scoring with **hard floors**. Never mutates.
- **Supervisor** — *decides*: continue / retry_producer (within budget) / escalate /
  hold_for_human. **Never kills on quality.** Conflating execution with this decision is the
  root cause of brittleness (per multi-blog `ARCHITECTURE.md`).

### 4.2 Stages (in order)

| # | Stage | Producer agent(s) | Critic | Floor / gate |
|---|-------|-------------------|--------|--------------|
| 0 | **Baseline assembly** (deterministic) | *no LLM* — pick default block layout for the business category, apply a safe default theme | — | always passes (this is the floor) |
| 1 | **Discovery** | Intake-Synthesizer: intake + crawled context → structured `BusinessProfile` | Discovery-Critic | completeness ≥ floor; missing-info → use safe defaults, never block |
| 2 | **Design brief** | Design-Researcher (look at references) → Brand/Voice → Art-Director: prose design brief | Design-Critic | brief specificity ≥ floor |
| 3 | **Theme** | Theme-Designer: brief → `ThemeTokens` (palette/type/spacing/radius) | Theme-Critic (contrast/WCAG/coherence) | WCAG AA contrast = hard floor |
| 4 | **Information architecture** | IA-Agent: pages + nav + which blocks per page | IA-Critic | required pages present (home/about/services/contact) |
| 5 | **Block selection & population** | Section-Builder (per block: choose block_type + generate props/content) | Block-Critic (schema-valid? content quality?) | **props must pass the block's Zod schema** (hard, deterministic) |
| 6 | **Copywriting** | Copy-Editor + Voice-Editor (de-AI: strip em-dashes, AI-tell verbs — port multi-blog blocklist) | Copy-Critic | voice/quality score ≥ floor |
| 7 | **Imagery** | Imager: place customer assets; fill gaps from stock/treatment; alt text | Photo-Critic | every image has alt + valid src |
| 8 | **SEO + structure** | SEO-Agent: titles/meta/JSON-LD/sitemap | SEO-Critic | title 30–70, meta 120–170 |
| 9 | **Render verification** (deterministic) | build the `SiteSpec`, render every page in a sandbox, assert valid HTML + no thrown errors | — | **functional render assertion = hard gate** (catches the one thing LLMs can't fake) |
| 10 | **Convergence gate** | Managing-Editor: collect ALL findings across stages, fix together, max 4 passes | all critics in parallel | 0 block findings → publish-ready; else hold_for_human |
| 11 | **Publish (two-phase)** | Stage (write `pages`/`page_blocks`, status=staged) → Publish (flip to live, warm preview) | smoke test | both phases idempotent |

Stage 5's "props must pass the block's Zod schema" is the linchpin of zero-fail: the renderer
*cannot* receive invalid block props, because the gate rejects them before they're persisted, and
the baseline (stage 0) is always present as fallback.

### 4.3 Review → fix loop (bounded, scoped, escalates — never thrashes)
Per stage, inside the conductor's `runStep`:
1. Producer emits artifact → critic scores it.
2. `enforceFloor()` forces `reject` if score < floor (defense-in-depth: floor checked in critic
   *and* conductor).
3. Supervisor decides:
   - `revise` under `per_stage_max_revisions` (default **2**) → `retry_producer` with the
     critic's critique fed into the next prompt. **Scoped**: re-run only the failing unit
     (one block, one page), never the whole stage.
   - `revise`/`reject` past budget, or any floor violation → **escalate + continue** (accept
     current best and move on; the convergence gate will catch it later, and the baseline
     guarantees shippability).
   - 3 consecutive same-class failures → auto-pause that campaign + critical escalation.
4. The **convergence gate** (stage 10) is the real remediation: collect every finding, one
   consolidated managing-editor fix pass, max 4 passes, then either publish or `hold_for_human`.

### 4.4 Agent implementation pattern (AI SDK v6)
Each agent is `Agent<I,O>`: `{ name, version, model, budget:{maxTokens,maxMs,maxRetries},
invoke(input, ctx) }`. Inside `invoke`:
- `selectAgentModel(name, ctx)` → AI Gateway `provider/model` string (tier map: quick=Haiku,
  mid=Sonnet, deep=Opus; escalate to deep on retry ≥ 3).
- `generateText({ model, system, prompt, output: Output.object({ schema }) })` → Zod-validated
  `result.output`. (Note v6: `Output.object`, `inputSchema` for tools, `result.usage.inputTokens`.)
- Defense-in-depth on output: lenient JSON parse + field repair + deterministic cleanup
  (port multi-blog's hardening; budget for the v6 empty-`{}` tool_use quirk with retry-on-empty).
- Every call wrapped so the conductor records `agent_invocation_details`.

Critics use the shared `buildLlmCritic` factory: one schema `{verdict, score 0–1, reasons[],
suggestions[], axes{}}`, temperature 0.2, plus a `scoreFloor` constant per critic.

### 4.5 Change requests
A customer "request changes" (or operator edit) opens a `change_request` campaign: a *scoped*
re-run touching only affected pages/blocks, through the same critic+convergence gates, then
re-preview. Cheap because blocks are independent.

---

## 5. Zero-fail / resilience strategy (summary of guarantees)

| Risk | Mechanism |
|------|-----------|
| Agent call fails / malformed | 3-layer retry in the step (empty-output retry, network retry w/ backoff, gateway→direct provider fallback) + Zod repair |
| Step times out / crashes / redeploy | Workflow DevKit checkpoints each `'use step'`; run **resumes from last completed step** automatically |
| Quality below threshold | Supervisor never kills → converge (max 2 scoped revisions) → convergence gate (max 4 passes) → `hold_for_human` (internal ops queue) |
| Whole run stalls / orphaned | Watchdog cron scans for runs with no progress > N min → auto-restart via `start()` (idempotency keys prevent dup work) |
| Renderer gets bad data | Stage 5 hard Zod gate + stage 9 sandbox render assertion; renderer falls back to baseline block if a prop ever fails at runtime |
| Customer ends with nothing | **Impossible by construction** — baseline (stage 0) is already a complete, valid site; every later stage only enhances it |
| Cost runaway | Per-step budget check vs `daily_budget_ceiling_cents`; hard cap escalates (never silently truncates); kill switch pauses all workflows |
| Provider outage | AI Gateway model fallback (Anthropic→OpenAI); workflow suspends/retries with backoff |
| Bad deploy on go-live | Two-phase commit + smoke test; rollback = keep previous deployment; preview stays multi-tenant until smoke-test green |

Acceptance criteria for the system (burn-in, adapted from multi-blog's `ACCEPTANCE_CRITERIA.md`):
every completed onboarding produces a previewable site within the build window; 0 runs end in a
state with no site; first-pass (no human) rate target ramps 70% → 90% as prompts mature; per-build
cost ≤ target ceiling; all failure-injection drills pass (provider outage, mid-run kill resumes,
cost-burst cutoff, DB failover).

---

## 6. Hosting, previews, and domains

### 6.1 Preview (multi-tenant `username.simplesight.co`)
- `apps/renderer` is a single multi-tenant Next app. `simplesight.co` uses **Vercel
  nameservers** (mandatory for wildcard SSL); add apex + `*.simplesight.co` to the renderer
  project. (Vercel "Platforms" pattern; Platforms Starter Kit is the reference.)
- Middleware reads `Host`, extracts `username`, resolves `projects.username` → `site_id`,
  rewrites to `/_sites/[siteId]`. The page reads `pages`/`page_blocks` and renders blocks from
  `packages/blocks` by `block_type`, applying `theme_tokens` as CSS vars.
- Instant previews, per-subdomain SSL auto-issued, scales to many customers on one deploy.

### 6.2 Go-live
On approval + active hosting subscription, customer chooses:
- **Stay multi-tenant** (default, cheapest): just attach their real domain to the renderer
  project and keep serving from DB. or
- **Promote to dedicated deployment** (premium/isolation): `packages/provisioning` exports the
  `SiteSpec` to a static/SSG Next build and deploys via the **Vercel REST file-based deploy**
  (`POST /v2/files` with `x-vercel-digest`, then `POST /v13/deployments`, poll `readyState`).

### 6.3 Domains
- **Buy through us:** domain-search + purchase UI in the customer dashboard (registrar API),
  then auto-attach + auto-configure DNS (we control nameservers).
- **Bring your own:** `provisioning` calls `POST /v10/projects/{id}/domains`, reads back the
  required records, and the dashboard shows the customer **exact A `76.76.21.21` / CNAME
  `cname.vercel-dns.com` (or project-specific value) / TXT** records. Poll
  `projectsGetProjectDomain` until `verified` → SSL issues automatically.
- `connection_steps` tracks each provisioning step as a state machine with retry.

---

## 7. Portals (observability + control)

### 7.1 Admin / operator console (`apps/portal`, `/admin`, Clerk-gated to staff)
Mirrors multi-blog's portal, which is exactly the right reference:
- **Fleet overview** — projects by status, in-flight builds, open escalations, spend.
- **Run drill-in** — per `pipeline_run`: every `workflow_step` with status/duration/retries;
  attached `artifacts`, `critic_verdicts` (verdict/score/axes/reasons), `supervisor_decisions`,
  and per-call `agent_invocation_details` (system prompt, user msg, raw + parsed output, tokens,
  cost). This is the "see step by step" the user asked for.
- **Live progress** — Workflow DevKit **streaming** (`getWritable`/`getReadable` namespaced
  streams) gives real-time stage/agent output — an upgrade over multi-blog's 4s polling.
- **Controls** — approve / retry-with-refinement / prompt override / **kill switch** / handle
  escalation. Backed by `fleet_settings` + `prompt_overrides`.

### 7.2 Customer dashboard (`apps/portal`, customer-scoped)
Onboarding wizard; build progress (friendly, high-level view of the same workflow stream);
preview link; **request changes**; **approve**; billing (Stripe Customer Portal); domain
management (buy/connect + DNS instructions).

---

## 8. Billing & the 30-day guarantee

- **Stripe Checkout** for the one-time build fee; offer the monthly hosting subscription at
  go-live (or bundle). Webhooks are the source of truth: `checkout.session.completed` →
  create project + start onboarding; `customer.subscription.*` / `invoice.*` → hosting lifecycle.
- **Stripe Customer Portal** for self-serve cancel / payment method / plan change.
- **30-day money-back:** `projects.refund_deadline_at = purchase + 30d`. A refund request inside
  the window → `refunds.create` against the original charge **+** cancel the subscription **+**
  set project `refunded`, unpublish the site, release the subdomain. Business logic ours; Stripe
  Refunds + subscription-cancel are the primitives.

---

## 9. Security, auth, secrets

- Clerk for both portals; operator routes gated to a staff role; customer routes scoped by
  `customer_id`. Tenant isolation enforced in the renderer middleware + every DB query.
- Secrets via Vercel env / OIDC (AI Gateway via `VERCEL_OIDC_TOKEN` preferred, `AI_GATEWAY_API_KEY`
  fallback). `packages/env` validates required vars at boot (port multi-blog/env, trimmed).
- Generated content is data (block props), never executed code in the multi-tenant phase — no
  arbitrary-code execution surface until/unless we ship bespoke-TSX (Phase 2), which runs only
  through the sandbox render gate + import allowlist (per multi-blog's `code_critic`).

---

## 10. Phased roadmap

Build in vertical slices so there's always a working end-to-end path, widened over time.

**Phase 0 — Monorepo foundation**
Convert `simple-site` → pnpm/turbo workspace; move existing site to `apps/marketing`; scaffold
empty `apps/portal`, `apps/renderer`, and `packages/*`. Stand up Neon + Drizzle + first
migration (customers, projects, intakes, sites, pages, page_blocks). Port `theme`, `seo`,
`observability`, `contracts`, `env`, `extractors` from multi-blog.

**Phase 1 — The block library + renderer (the floor)**
Build `packages/blocks`: ~12–16 production-grade, Zod-schema'd informational blocks (hero, about,
services grid, feature, testimonial, gallery, contact + map, hours, CTA, FAQ, footer, nav).
Build `apps/renderer` multi-tenant: `Host`→tenant→`page_blocks`→render with theme tokens. Seed
one hand-authored site as data; confirm it renders at a test subdomain. **Deliverable: a
data-defined site renders live.** This alone is the zero-fail floor.

**Phase 2 — Intake + commerce**
Stripe Checkout + webhook → project creation. Post-purchase onboarding wizard (style, business,
asset upload to Blob, optional crawl via `extractors`, username reservation). **Deliverable:
pay → onboard → data saved.**

**Phase 3 — The engine + pipeline (block mode)**
Build `packages/engine` (conductor `runStep`, never-kill supervisor, model routing, convergence
gate, invocation logging) on Workflow DevKit. Build `packages/agents` stages 0–11 in **block
mode** (agents select + populate blocks, generate theme). Wire to durable workflow with
checkpoint/resume + watchdog. **Deliverable: onboarding → autonomous build → previewable site,
guaranteed.** This is the core ask.

**Phase 4 — Portals**
Admin run-drill-in + live streaming + controls (kill switch, retry, override). Customer
dashboard: progress, preview, request-changes (scoped re-run), approve. **Deliverable: full
observability + customer self-serve loop.**

**Phase 5 — Hosting, domains, go-live**
`packages/provisioning`: domain buy/connect, DNS instruction UI, verification polling; optional
dedicated deploy. Two-phase publish + smoke test + connection_steps. Hosting subscription + go-live
gating. 30-day refund flow. **Deliverable: customer can take their site fully live on a real
domain and pay monthly.**

**Phase 6 — Hardening & autonomy ramp**
Failure-injection drills; burn-in; first-pass-rate tuning; cost ceilings; auto-restart watchdog;
escalation routing. Ramp human checkpoints down (multi-blog's 3→2→0 schedule) as quality proves
out. **Deliverable: meets acceptance criteria; runs hands-off with exception-only oversight.**

**Phase 7 (later) — Bespoke component generation**
Add agent-authored TSX components behind the existing critic + **sandbox render assertion** +
import allowlist (multi-blog `code_critic` pattern), as an enhancement layer on top of blocks.
Higher "custom" ceiling without sacrificing the zero-fail floor.

---

## 11. Open decisions & risks

- **Registrar for "buy a domain through us"** — which API (Vercel Domains, or a registrar like
  Namecheap/Dynadot)? Affects `provisioning`.
- **Pricing** — build fee + hosting tiers (and what "dedicated deployment" premium costs). Drives
  Stripe product setup. (The marketing site already has pricing history to reconcile.)
- **Block library breadth** — how many block variants per type to feel non-templated. More
  variants = more "custom" but more to maintain. Start ~12–16 types × 2–3 variants.
- **Crawl scope & legality** — crawling the customer's *own* linked site is fine; be careful with
  scope and rate.
- **Human-in-the-loop at launch** — recommend Phase 3–5 keep an operator approval checkpoint
  before customer preview (multi-blog's lesson: autonomy is a Phase-2 unlock, not a Phase-0
  assumption). Customers pay a lot; a human glances before they see it, until first-pass rate is high.
- **Replay budget** — keep per-stage child workflows under 2,000 events / 240s replay; large
  artifacts (rendered HTML, images) go to Blob, never workflow payloads (50 MB cap).
- **AI SDK v6 empty-`{}` tool_use quirk** — budget for the JSON-string-wire-schema workaround on
  complex nested schemas (multi-blog hit this hard).

---

*Inputs: full audit of `multi-blog-project` (docs, `packages/ai` orchestration code, `apps/portal`,
`packages/db` schema) + current Vercel deploy/domains/Workflow/AI-SDK research. See git history of
this repo and the multi-blog repo for provenance.*
