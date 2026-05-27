# Reviser convergence loop + imagery upgrade

**Date: 2026-05-27.** Both shipped on `feat/replication-infra`.

## A. The auto-fix convergence loop (Reviser)

### Architecture (producer/critic separation preserved)

```
deploy PREVIEW
   │
   ▼
┌───────────────────────────── convergence (bounded, default 3 passes) ─────────────────────────────┐
│  reviewSite (CRITICS, every page)                                                                  │
│     • full-page screenshot → DESIGN critic (Opus 4.7 multimodal)                                   │
│     • rendered text       → CONTENT critic (Opus 4.7, award-winning copy editor)                   │
│  → SiteReview (blocking findings?)                                                                 │
│        │ no blocking → CONVERGED → break                                                            │
│        │ blocking                                                                                  │
│        ▼                                                                                            │
│  REVISER agent (PRODUCER, separate from critics) — per affected page:                              │
│     takes the page file + its findings → rewrites it to fix every finding, preserving the rest     │
│        ▼                                                                                            │
│  code-critic rebuild (repairs any build break)                                                     │
│        ▼                                                                                            │
│  redeploy preview → RE-REVIEW (the critic AFTER the reviser) ── loops back to the reviser ─────────┘
│
└─ converged → PROMOTE to production   |   pass budget spent → HOLD for human (with remaining findings)
```

- **`reviser.ts`** — `revisePage()`: a producer agent, distinct from the critics. Given a page + its design+content findings, it rewrites the page to resolve every finding while preserving what works (server-component rules, capability rules, prop-type matching, imagery + punctuation rules all enforced).
- **`converge.ts`** — `runConvergence()`: the loop. Reviews → revises blocking pages → rebuilds (code-critic) → redeploys → **re-reviews** (the explicit critic-after-reviser), bounded by `maxPasses`. Exits clean (converged) or out of budget (→ hold).
- **Orchestrator** — deploys a **preview** first; runs convergence; **promotes to production only when clean** (so the customer never sees a pre-fix version); otherwise holds for human with the unresolved findings. No cost ceiling (per project decision).

### Why this shape
- The **reviser is a different agent than the critic** (your multi-blog producer/critic separation) — the thing that flags is never the thing that fixes, and a fresh critic pass verifies each fix.
- It loops **until good enough to show the customer** — re-review after every revise pass; only blocking findings force another pass.
- Bounded + hold-for-human: it never spins forever and never ships broken.

### Validated
The reviser was run on the live Wandercup café page with the real content-critic findings: it corrected *"roasted on Alberta, poured on Alberta"* → *"Roasted on Alberta Street. Poured on Alberta Street."* (the critic's suggested fix), kept the file a valid default-export page. (Full live loop = a fresh `runBespokeBuild` with `deploy` + `visualCritic`.)

### Next refinements (not blocking)
- Re-review only the **changed** pages each pass (cost), merging unchanged prior results.
- Cap total revise cost per page; escalate a page that won't converge individually.

## B. Imagery upgrade

Research (sources below) → three levers, all implemented:

1. **Two sources.** Asset service now queries **Unsplash AND Pexels** (keys loaded from `.env`: `UNSPLASH_ACCESS_KEY`, `PEXELS_API_KEY`), merges the pools, falls back to picsum only if both miss. Per-role **orientation** (hero=landscape, portraits=portrait, feed=square) + relevancy ordering.
2. **Art-direction-first, authentic queries.** Queries lead with the brief's **imagery direction + treatment** (threaded from the brief), plus authenticity modifiers (*candid, documentary, natural light, real*) to dodge the staged-corporate-stock look.
3. **Consistent brand treatment.** The generators (foundation + page) are now instructed to use real photos **prominently** (not CSS/SVG stand-ins) and apply **one consistent treatment** (subtle duotone via CSS filter + faint grain) so disparate stock reads as one commissioned set — the de-stocking move from the research. The `imageryDirection` skill was enriched with these techniques (sources, orientation, authenticity bias, the concrete duotone/grain CSS).

**Why it matters:** imagery scored ~55 on every prior build (the recurring weak dimension) because of generic picsum fallbacks + CSS-instead-of-photos. These three levers attack all three causes. The next full e2e build should show the imagery dimension rise.

### Sources
- [Shutterstock — stock photos that don't look stock](https://www.shutterstock.com/blog/stock-photos-that-dont-look-stock)
- [Stuff & Nonsense — stop using generic stock images](https://stuffandnonsense.co.uk/blog/newsletter-2)
- [CSS-Tricks — duotone image effect (SVG)](https://css-tricks.com/using-svg-to-create-a-duotone-image-effect/) · [Grainy gradients](https://css-tricks.com/grainy-gradients/)
- [Unsplash API docs](https://unsplash.com/documentation) · [Pexels API docs](https://www.pexels.com/api/documentation/)
