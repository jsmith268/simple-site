# Capability gates + multi-page design & content review

**Date: 2026-05-27.** Two upgrades, both shipped on `feat/replication-infra`.

## 1. Capability gates (structured, operator-controlled feature flags)

The onboarding input is already structured (`BusinessProfile`); what was missing is a **hard allowlist** over what a generated site may contain. Added `SiteCapabilities` (`packages/contracts/src/bespoke.ts`):

| Capability | Default | Notes |
|---|---|---|
| `leadForm`, `socialFeed`, `map`, `pricingDisplay`, `events` | **on** | |
| `newsletter` | **off** | no signup/subscribe UI anywhere |
| `ecommerce` | **off** | no cart/checkout/"Buy now"/purchase; products shown informationally, CTAs = Visit/Inquire/Contact |
| `booking` | **off** | use a contact/inquiry form instead |
| `blog` | **off** | |

**Operator-governed, not pitch-inferred.** `runBespokeBuild({ capabilities })` overrides the defaults; the orchestrator forces `profile.capabilities = resolveCapabilities(overrides)` on every run, so a pitch saying "sell beans online" still won't produce commerce while `ecommerce` is off. Flip a flag later to enable.

**Enforced at three layers** (`packages/agents/src/bespoke/capabilities.ts`):
1. **IA agent** — only selects from `allowedComponents(caps)`; the `capabilityRules(caps)` block is injected; `chrome.footer.showNewsletter` forced false when newsletter is off.
2. **`validateSiteIA` gate** — flags any disabled component (or a newsletter footer) as **blocking**.
3. **Foundation + Page generators** — the same rules block forbids the disabled components *and* the copy/CTAs ("Subscribe", "Add to cart", etc.).

Extending later = one flag + one catalog mapping + one rule line.

## 2. Multi-page review — design **and** content

**Before:** the reviewer screenshotted only the Home page, once, and scored design only — which is why a grammar error on the *Visit* page slipped through.

**Now** (`reviewSite`, `packages/agents/src/bespoke/review.ts`): for **every** page —
- a **full-page screenshot** → **design critic** (Opus 4.7 multimodal, award-winning-designer rubric);
- the **rendered text** (fetched + `extractText`) → **content critic** (`critic-content.ts`, award-winning copy-editor rubric: grammar, idiom/natural English, clarity, voice, no placeholder/fabricated copy). Reading the *text* (not OCR'ing a screenshot) makes grammar detection reliable.

Aggregated into a `SiteReview` (per-page design + content scores + findings). **Grammar/idiom errors are blocking.** Wired as the orchestrator's review stage: it saves `review-report.json` (+ a flattened `visual-report.json` for the admin panel + learning loop) and, if any blocking finding exists, **holds for human** — a real verification gate.

**Validated live** against Wandercup: the content critic flagged the exact *"roasted on Alberta → roasted in Alberta"* idiom error (blocking), plus a truncated `hello@` email, duplicate section numbers, stray spaces before periods, and literal `·` escapes leaking into copy.

**Bonus fixes surfaced by the review:** generators now told to write real punctuation characters (never literal `–`/`·` in JSX); `extractText` decodes numeric HTML entities.

## 3. Next step — the auto-fix convergence loop

The review currently **gates** (holds for human on blocking findings). The completion is to **auto-correct and re-verify**:
1. Collect blocking findings → a targeted **fix pass**: content findings → patch the offending copy in the page file (cheap, surgical, with the critic's suggested fix); design findings → reprompt the page.
2. Rebuild (code-critic) → redeploy preview → **re-review** → repeat, bounded (e.g. 3 passes) → pass or hold-for-human.
3. Ideally review a **preview** deploy, converge, then promote to production — so a customer never sees the pre-fix version.

This turns "held for human with findings" into "fixed itself and shipped clean," matching the master plan's Stage-4 convergence.
