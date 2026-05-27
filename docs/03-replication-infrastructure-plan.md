# SimpleSight — Infrastructure to replicate multi-page bespoke sites

**Status:** plan (2026-05-26). Goal: turn the **one-off, hand-driven** Holdfast build into a **repeatable SimpleSight capability** — onboarding answers in → a built, deployed, multi-page bespoke site out — for *any* business.

This plan is derived by auditing exactly what I had to improvise to ship Holdfast (`docs/02-holdfast-exact-prompts.md`) that is **not** part of the real product yet.

---

## 0. The honest gap: what was hand-driven vs. what must exist

| For Holdfast I did this **by hand / one-off** | It must become this **product component** | Status |
|---|---|---|
| Wrote the `businessText` paragraph | **Onboarding → `BusinessProfile`** structured intake (the question set) | intake exists, schema doesn’t |
| `generateDesignBrief()` | **Brief agent** — keep; fix skill-name resolution; add **font whitelist** + **WCAG palette validator** | exists, partial |
| Hand-wrote the per-page **section narratives**, the **page list**, and which **components/embeds** each page uses | **Information-Architecture (IA) agent**: brief + profile → `SiteIA` (pages, ordered section narratives, component/embed selection) | **missing — the central gap** |
| Hard-coded a 9-file foundation spec + the component set (nav/footer/IG/map/form/section/faq) | **Component catalog** + **Foundation generator** (parameterized by brief + IA selection) | missing |
| Hard-coded per-page generation with Holdfast facts | **Generalized Page generator** (driven by `SiteIA`) | missing (have a hardcoded version) |
| Agent improvised the Next scaffold (package.json, tsconfig `@/*`, postcss, next.config) | **Scaffolder** — a versioned Next 16 + Tailwind v4 **starter template** stamped per site | missing |
| Copy-pasted a `withRetry` helper into each script | **Shared resilient LLM client** in `engine` (retry/backoff/timeout + token/cost accounting) | missing |
| Ad-hoc save-as-you-go + skip-if-exists | **Conductor-driven checkpointed run** (idempotency, resumable, per-file artifacts) | conductor exists, not wired |
| `curl`-verified image URLs by hand; Opus guessed photo IDs | **Asset service** — source (Unsplash API / generation) + verify liveness + fallback → validated **asset manifest** fed to agents | missing |
| `next build` locally; fix-loop specified but unused | **Code-critic service** in **Vercel Sandbox**: parse → typecheck → lint → build, with the **fix-reprompt loop wired in code** | missing |
| (not done) | **Visual critic** — Sandbox screenshot → Opus multimodal score vs. brief | missing |
| Ran `vercel deploy` manually | **Deploy/provisioning integration** — programmatic per-site Vercel project + deploy + preview alias (+ domain on go-live) | provisioning pkg exists, not wired to bespoke |
| Nothing persisted | **Artifact + run persistence** (brief, IA, files, logs, screenshots, scores, cost) | missing for bespoke |
| No operator view | **Admin** — per-run view of brief/IA/files/screenshots/critic feedback + **edit-and-regenerate** any stage | admin exists, not for bespoke |
| No budget control | **Cost-sentinel** — per-build token/$ ceiling + bounded retries | missing |

**Reusable as-is:** the conductor/critic/supervisor engine, the skills registry + `/admin/skills` editor, the provisioning package (Vercel domains), db (offline JSON store + Neon), `contracts`, the Brief agent + `generateJson`, the design-skill corpus.

---

## 1. Data contracts (the backbone) — `packages/contracts`

Define and version these; every agent reads/writes them, every artifact persists against them.

- **`BusinessProfile`** — normalized onboarding: identity, positioning, offerings, audience, voice, proof/stats, primary goal, hours, contact/socials, location (address → geocode), requested pages, requested components, requested embeds, visual mood, brand assets.
- **`DesignBrief`** — *exists* (`packages/agents/src/bespoke/brief.ts`). Extend: fonts must come from a vetted whitelist; palette must pass a contrast check.
- **`SiteIA`** — the missing piece: `pages: [{ name, slug, role, sections: [{ kind, narrative, components: ComponentRef[] }] }]`, plus global `chrome` (nav structure incl. dropdowns, footer) and `embeds` placement. This replaces my hand-written `def.narrative`.
- **`ComponentSpec`** — catalog entry: `{ type, propsSchema, interactive: boolean, requires?: 'client' }` (nav, footer, social-feed, map, lead-form, accordion, pricing-tiers, schedule, gallery, testimonials, stat-bento, marquee, cta-band…).
- **`AssetManifest`** — verified images/SVGs available to generators (url, alt, role, dimensions, liveness=200).
- **`GeneratedFile`**, **`BuildReport`**, **`CriticReport`**, **`BuildRun`** (status, stage traces, costs, artifacts, escalation flag).

---

## 2. The replication pipeline (target)

```
Onboarding ─▶ BusinessProfile
                  │
                  ├─▶ Brief agent ─▶ DesignBrief ─▶ [Brief validator: fonts whitelist, WCAG]
                  │
                  └─▶ IA agent ────▶ SiteIA  (pages + section narratives + component/embed selection)
                                        │      ▲ design/IA critic gate
                  Asset service ────────┤
                  (verified manifest)   │
                                        ▼
   Scaffolder ─▶ Foundation generator ─▶ Page generators (per SiteIA page)
                                        │
                                        ▼
                  Code-critic (Vercel Sandbox): parse→typecheck→lint→build
                                        │  └─ fix-reprompt loop (bounded)
                                        ▼
                  [later] Visual critic: screenshot → Opus multimodal → score/gate
                                        │
                                        ▼
                  Deploy (per-site Vercel project) ─▶ preview ─▶ go-live + domain
```

All orchestrated by the existing **conductor** (checkpointed, idempotent, resumable, never-kill supervisor → converge or **hold-for-human**), with **cost-sentinel** and **artifact persistence** throughout.

---

## 3. Phased roadmap (critical path first)

**Phase 0 — Correctness & shared plumbing (small, unblocks everything)**
- Fix the **skill-name resolution** bug (kebab vs camel) so all requested skills inject.
- Add the **Google-Fonts whitelist** + **brief validator** (fonts available; palette WCAG AA) so no manual font substitution.
- Extract `withRetry` → a **resilient LLM client** in `engine` (retry/backoff/timeout + token/cost capture). One place, not copy-paste.

**Phase 1 — Contracts** (§1). Land the schemas; nothing else can be clean without them.

**Phase 2 — Onboarding → `BusinessProfile`.** Build the structured intake (the question set) in `apps/portal`; map answers → `BusinessProfile`. Optional Discovery agent to normalize freeform notes.

**Phase 3 — IA agent (THE unlock).** brief + profile → `SiteIA`, including a **component/embed selection** step (which catalog components each section uses). Add an IA/design critic gate (distinctiveness + coherence + “every requested embed placed”). *This is what replaces the human-authored narratives — the difference between “I built one” and “the system builds them.”*

**Phase 4 — Generalized generators + scaffolder.**
- **Scaffolder**: a versioned Next 16 + Tailwind v4 starter (config, `@/*` alias, fonts wiring) stamped per site.
- **Component catalog + Foundation generator**: generate the brief-styled implementations of the catalog components the IA selected (incl. the IG-feed / map / lead-form embeds as first-class catalog types).
- **Page generator**: driven by `SiteIA` + brief + `AssetManifest` (replaces `gen-holdfast-page.ts`).
- Retire the `gen-holdfast-*.ts` one-offs.

**Phase 5 — Asset service.** Source images (Unsplash API with a key, or generation) by the brief’s imagery direction + section role; verify liveness; fallback; emit `AssetManifest`. Generators consume the manifest instead of Opus inventing photo IDs (kills the broken-image risk at the source).

**Phase 6 — Code-critic in Vercel Sandbox.** parse → typecheck → lint → build inside an ephemeral microVM; the **fix-reprompt loop wired in code** (bounded). This is the gate that makes unattended runs safe (no fallback per the locked decision → converge or hold-for-human).

**Phase 7 — Orchestrate through the conductor.** Run the whole pipeline as a checkpointed, resumable, idempotent conductor run with **artifact persistence** + **cost-sentinel**. Folds in Phase 0 resilience. After this, a run survives a 529 storm or a crash and resumes.

**Phase 8 — Deploy/provisioning integration.** Programmatic per-site Vercel project create + deploy + preview alias; custom domain + hosting on go-live via the existing provisioning package.

**Phase 9 — Visual critic.** Sandbox screenshot → Opus 4.7 multimodal scoring vs. the brief + `critique` rubric; gate + reprompt. *(This is the loop you asked to wire next, after reviewing Holdfast — it slots in here and can run against the live build immediately as a standalone first step.)*

**Phase 10 — Admin + learning loop.** Per-run admin view (brief/IA/files/screenshots/critic scores/cost) with edit-and-regenerate per stage; operator feedback → new/edited skills that lift every future build.

**Critical path to “replicable multi-page sites”:** Phases 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8. Phases 9–10 are the quality/ops layers on top.

---

## 4. Honest trade-offs & risks

- **Cost & latency.** A site = brief + IA + foundation + N pages + per-file build/critique + retries, all Opus. Several minutes and real $ per site; the cost-sentinel (Phase 0/7) is not optional. The intermittent Anthropic **529s** make the resilient client + conductor resumability load-bearing, not nice-to-have.
- **No fallback (locked).** Bespoke-or-human-escalate means the code-critic (Phase 6) + conductor hold-for-human (Phase 7) are what protect the customer — a failed build waits on a person rather than shipping broken.
- **Catalog vs. unbounded bespoke.** The component catalog (Phase 4) buys reliability and embed coverage (IG/map/form always work) at a small uniqueness cost. Resolve by having the catalog define component **types + prop contracts**, while **Opus still authors the bespoke implementation per brief** — structure is known, design is not templated.
- **Embeds need real backends eventually.** The lead-form has no persistence and the IG feed is curated stock, not the live Instagram API. Fine for preview; productizing means a form endpoint + (optional) real IG Basic Display integration.
- **Assets.** Stock realism is the current ceiling; the Asset service (Phase 5) should leave room for customer-uploaded photos and/or generated imagery.

---

## 5. Recommended first moves

1. **Phase 0** (a day-ish): skill-name fix, font whitelist + brief validator, resilient LLM client — small, high-leverage, and they make every subsequent run correct and durable.
2. **Phase 9 visual critic as a standalone** — you explicitly want to see its feedback on Holdfast; it can be built and pointed at the live build now, independent of the rest, and it doubles as the quality gate later.
3. Then the **IA agent (Phase 3)** — the single change that turns “I can build one” into “the system builds them,” since it removes the hand-authored narratives.
