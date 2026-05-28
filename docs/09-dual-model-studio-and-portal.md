# Dual-model studio + customer portal (the $10k experience)

**Date: 2026-05-28.** Built on `feat/replication-infra`. This is the work that turns
SimpleSight from "a great engine wired to the wrong path" into a product a customer
walks step-by-step and pays for.

## What changed, in one paragraph

Customers now reach the **bespoke engine** through a conversational onboarding, get **two
designs built in parallel by two different models** (Claude Opus 4.8 + GPT-5.5), compare
and pick one or **regenerate with feedback** (up to 5 rounds / 10 designs), then refine
the winner in a **75/25 site-plus-chat workspace** with desktop/tablet/mobile preview and a
**comment → checklist → approve-rebuild** loop, and finally set up **hosting + a domain**
and go live. The whole thing runs locally with zero external services and lights up the
real models + Vercel deploys in production.

## The flow

```
/buy → checkout → /onboarding/[id]  (conversational "build lead" intake)
   → runRound()  → two BuildVariants (Studio A = Opus 4.8, Studio B = GPT-5.5)
   → /studio/[id]
        ├─ generating  → live progress (polls)
        ├─ comparing   → COMPARE two previews → choose | regenerate(feedback)  [≤5 rounds]
        ├─ selected    → WORKSPACE (75/25): page tabs · viewport switch · notes
        │                  → compile CHECKLIST → approve → applyRevision (keeps foundation) [≤5 revisions]
        └─ finalized   → /dashboard/[id]/go-live  (hosting + domain) → live
```

## Engine changes (`packages/engine`, `packages/agents`)

- **Models:** `MODELS.opus = claude-opus-4.8` (was 4.7), `DUEL_MODELS = {A: opus-4.8,
  B: openai/gpt-5.5}` — both env-overridable (`SIMPLESIGHT_MODEL_A/B/GPT`). OpenAI routes
  through the AI Gateway; Anthropic stays on the direct key (the free-tier gateway blocks
  Opus, and the direct path is what makes caching reliable).
- **Prompt caching:** `resilientGenerateText({cacheSystem})` marks the shared system prefix
  as an Anthropic ephemeral cache breakpoint. `page.ts`/`reviser.ts` were restructured so
  their system prompt is identical across every page call of a build → cache hits at ~10%
  input cost. Single-shot calls (brief, foundation) are not cached (a cache write with no
  read costs more).
- **Producers carry the voice ban list:** foundation/page/reviser now inject the full
  `marketing-voice` 24-tells list + a "what good looks like" target — tells are never
  written, not just caught in review. Brief got an anti-cliché rule; IA got a
  section-variety + hero-moment rule.
- **Critics judge with Opus 4.8 always** — decoupled from the model under test (GPT-built
  sites aren't graded by GPT). The reviser keeps the build model so each variant keeps its
  character.
- **Cost accounting fixed:** `generateJson({onCost})` threads real token cost (brief/IA/
  profile no longer report fabricated cents).

## Data model (`packages/contracts/generation.ts`, `packages/db`)

- `BuildVariant` (round, slot A/B, model, status, previewUrl, scores, optional renderable
  `spec`), `GenerationState` (round/revision counters + limits), `RevisionItem` +
  `RevisionChecklist`. Limits: `GENERATION_LIMITS = {maxRounds: 5, maxRevisions: 5}`.
- `repos/generation.ts` — full offline-store + Postgres branches (same pattern as the rest).

## Orchestration (`packages/agents/dual.ts`, `revise.ts`)

- `runRound(projectId, feedback?)` — creates two variants, builds both in **parallel**,
  failure-isolated; a round ALWAYS yields two viewable variants (offline falls back to a
  renderable block spec). Online = real bespoke build per model + Vercel preview deploy.
- `selectVariant`, `regenerate(feedback)`, `regensRemaining`.
- `compileChecklist` (deterministic grouping + summary), `applyRevision` (online: reviser
  rewrites only the commented pages → rebuild → redeploy → QA re-review; offline: marks
  applied). Keeps the foundation; bounded by the revision budget.
- Previews: deployed Vercel URL (online) **or** the renderer route
  `/preview/variant/[id]` rendering a stored `SiteSpec` (offline/dev).

## Portal (`apps/portal`)

- **Design system** (`app/globals.css` + `app/ui.tsx`): Tailwind v4 tokens (warm editorial
  palette, Fraunces/Inter/JetBrains), hook-free primitives.
- **Onboarding** (`app/onboarding/[id]/conversation.tsx`): a guided transcript — standard
  questions with chip answers + free text on every step, skip-and-infer, progressive depth
  (auto pages vs. name-every-page), contact, username, review.
- **Studio** (`app/studio/[id]`): generating / compare / workspace / finalized, with polling.
- **Go-live** (`app/dashboard/[id]/go-live`): hosting plan card + tabbed domains (free /
  connect / buy) with copy-able DNS + connection log + refund.
- **Dashboard** (`app/dashboard/[id]`): a hub that routes to the right step.

## Operational notes

- **Local/offline dev:** with no AI/DB/Vercel keys the entire flow works deterministically.
  The portal and renderer are separate apps — to share the offline JSON store between them,
  set the SAME `SIMPLESIGHT_DATA_DIR` for both, and set `NEXT_PUBLIC_RENDERER_URL`
  (e.g. `http://localhost:3001`) so preview iframes resolve.
- **Production:** set `ANTHROPIC_API_KEY` (Opus direct), `AI_GATEWAY_API_KEY` (GPT-5.5),
  `DATABASE_URL`, `VERCEL_API_TOKEN` (+ `VERCEL_TEAM_ID`) for per-variant preview deploys,
  `UNSPLASH_ACCESS_KEY`/`PEXELS_API_KEY` for imagery, `STRIPE_*` for billing.
- **Confirm the GPT-5.5 gateway id** (`SIMPLESIGHT_MODEL_GPT`) matches the live model string.

## Known follow-ups (honest)

- Offline `applyRevision` can't truly apply prose feedback (no model) — it advances the
  loop and re-publishes; the real edits happen on the online bespoke path.
- Bespoke (deployed) variants don't yet expose per-page tabs in the workspace (no stored
  `spec`); page tabs fall back to Home. Wire from the build's IA artifact next.
- Transactional email (build-ready / changes-done) is still a stub — add Resend.
- Crawl reference URLs / customer photo uploads into the imagery manifest.
