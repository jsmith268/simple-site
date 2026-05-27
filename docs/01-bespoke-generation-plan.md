# SimpleSight — Bespoke Generation Plan (the pivot away from templates)

**Status:** plan (2026-05-26) · supersedes the template/block approach for the *product output*.

## 0. Why the template approach failed

The Opus, GPT‑5, and Haiku med‑spa sites looked virtually identical because **the design was never the model's to decide.** Structure (which blocks, in what order), layout, palette family, type, spacing, and motion were all fixed by the playbook + block library. The LLM only wrote the *text*. So model choice changed the copy, not the design — and every site in a vertical converges on one look.

To reach the quality and variety of the hand‑built sites in `~/Projects` (referral‑booster, ai‑partner, skills‑directory, angel‑one), the AI must **generate the design and the code** — bespoke components, a per‑site design system, unique compositions — guided by the same skills that produced those sites. That is the pivot.

## 1. Principles

1. **The skills are the brain.** `impeccable`, `frontend-design`, `gradient-design`, `typeset`, `layout`, `graphics-forge`, `image-treatment`, `marketing-voice`, `critique`, `web-design-guidelines`, `polish`, `distill`, `animate` — these produced your good sites. They become the agents' system prompts and the critics' rubrics, and they stay **first‑class, versioned, and editable** so you can keep adding to them.
2. **Commit to one art direction per site.** The single biggest anti‑generic lever (from `frontend-design`): each site picks ONE distinctive direction and executes it precisely — never the safe average.
3. **Generate code, then prove it works.** Every generated file is parsed, built, rendered, and screenshot‑reviewed before it can ship. Nothing unverified reaches a customer.
4. **Bespoke ≠ unbounded risk.** Codegen has a higher failure surface than templates. The guarantee shifts from "always a site" to **"only render‑verified code ships; otherwise it escalates to a human"** — never a broken page. (A minimal safe‑mode fallback is optional; see §7.)
5. **Improve forever.** Operator feedback becomes new/edited skills and prompt augmentations that lift every future build (multi‑blog's learning loop).

## 2. The pipeline (durable, checkpointed, multi-blog conductor)

Input: the onboarding Q&A (structured intake) + optional reference URLs (direction only, never copied) + uploaded assets.

**Stage 1 — Discovery & Design Brief** *(this is what makes each site unique)*
- **Discovery agent**: Q&A → structured `BusinessProfile` (positioning, audience, voice, offerings, proof, constraints).
- **Art‑Direction agent** (skills: impeccable, frontend-design, gradient-design, typeset): produce a committed **Design Brief** — the taste‑design `DESIGN.md` artifact: ONE aesthetic direction, OKLCH palette (banned defaults enforced), real variable‑font pairing, spacing/density/motion dials, signature devices, imagery direction, voice. → `design-critic` gate scores *distinctiveness* + coherence (reject the generic).
- **Information‑Architecture agent**: brief + profile → sitemap + per‑page *section narrative* (a described composition, not fixed blocks).

**Stage 2 — Bespoke code generation** *(the core)*
- **Scaffold**: a per‑site Next.js 16 + Tailwind v4 project from a tiny starter that carries the brief's tokens, fonts, and the skills as context.
- **Design‑system agent**: emit `globals.css`/tokens (OKLCH palette, modular type scale, spacing, signature gradients, easings) from the brief — the design DNA.
- **Chrome agent**: bespoke nav + footer.
- **Section/page codegen agents**: generate real, varied TSX + Tailwind components per the section narrative — different layouts and devices per site, applying the skills. (Opus writes the components; this is where variety lives.)
- **Per‑file `code-critic`** (multi-blog's 5 gates): ① TS parse → ② lint/format → ③ import allowlist (no arbitrary deps/network) → ④ **build** → ⑤ **render in a sandbox + screenshot → multimodal visual critique** (Opus scores hierarchy, spacing, color, signature elements, polish; hard floor) → reject + reprompt‑with‑feedback, bounded retries.

**Stage 3 — Content & media** *(iteration agents)*
- **Copy agent** (marketing-voice): rich, on‑brand copy.
- **Imagery agent** (stock-imagery + image-treatment + graphics-forge): source/treat photos, generate custom SVG marks/illustrations, place them → `photo-critic`.
- **Polish agent** (polish/animate/delight): micro‑interactions, motion, final alignment/spacing pass.

**Stage 4 — Review & QA** *(multi-blog convergence)*
- Independent critics: design‑quality / "AI‑slop believability" test (`critique`), accessibility + `web-design-guidelines` audit, responsive (`adapt`), performance (`optimize`), copy (`marketing-voice`). Composite score + block/warn/info findings.
- **Convergence loop**: collect all findings → one managing‑editor fix pass → re‑review, bounded passes → publish or **hold‑for‑human**.
- **Forced human checkpoint** before the customer's first preview, ramping down (3→2→0) as first‑pass quality proves out.

**Stage 5 — Build, preview, deploy**
- Build the validated per‑site app; deploy it (Vercel file‑based deploy / project per site); preview at `username.simplesight.co`; custom domain + hosting on go‑live (existing provisioning).

## 3. Skills as the engine (continuously improvable)

- Ingest the full design‑skill library into our `packages/skills` (we already have a registry + `/admin/skills` editor + per‑agent attachment + runtime injection). Each agent declares the skills it applies; each critic declares the rubric skill it enforces.
- Every run records **which skills were applied + their versions** (observability).
- **Learning loop**: operator feedback on a build → an agent proposes a new/edited skill or prompt augmentation → after approval it applies to all future builds (multi-blog Feedback‑Meta‑Agent). This is how the system gets better over time.

## 4. Build / validate / deploy infrastructure

- **Vercel Sandbox** (ephemeral microVMs, GA) is the right tool to safely `build` + render + screenshot generated code inside the critic loop. It isolates untrusted generated code and gives us the render‑assertion + visual‑critique gates.
- **Multimodal visual critique**: screenshot in the sandbox → Opus 4.7 (multimodal) scores the rendered page against the brief and the `critique` rubric. This is the gate that catches "looks off" that text can't.
- **Deploy**: each finished site is its own Vercel deployment (matches how your hand‑built sites exist; clean isolation; trivial custom domains). The current multi‑tenant data‑renderer becomes legacy.

## 5. Observability & control (we have the foundation)

`/admin` already shows per‑run stage traces, prompts, variables, skills, and supports prompt/skill editing. Extend it for codegen: per run, see the **design brief**, each **generated file + its diffs + screenshots + critic scores**, the review findings, and the iteration history — with edit‑and‑regenerate on any stage.

## 6. What we keep vs. retire

**Keep (reused):** onboarding/intake + question set, the conductor/critic/supervisor engine, skills registry + admin editing, admin observability, Neon/persistence, AI Gateway + direct‑Opus wiring, billing/domains/go‑live, the design‑pattern corpus (now feeds the brief), and add Vercel Sandbox.

**Retire (legacy/fallback):** the fixed block library, the category playbooks, and the multi‑tenant data‑renderer *as the product output*. (Optionally retained as an emergency safe‑mode — see §7.)

## 7. Honest trade-offs

- **Zero‑fail weakens.** Templates always rendered. Bespoke codegen can fail; the floor becomes "render‑verified or human‑escalated." Recommendation: keep a **minimal safe‑mode generator** (one clean, generic-but-correct layout) purely as an emergency fallback so a paying customer is never left with nothing — invisible unless everything else fails.
- **Cost & latency are real.** A site = a design brief + design‑system + chrome + several page components, each with build + screenshot + visual critique + retries + a review convergence loop. That's *many* Opus calls and several minutes (and real $) per site. Acceptable for a high‑ticket product, but it must be budgeted (cost‑sentinel per build) and is far above the near‑free template path.
- **Opus access** is via your direct Anthropic key (free‑tier gateway blocks it); fine, already wired.

## 8. Phased roadmap

- **Phase 1 — Brief + single‑page codegen PoC.** Discovery → Design Brief → generate ONE bespoke landing page (TSX+Tailwind or self‑contained HTML) with Opus + the skills; build + (sandbox) screenshot + visual critic. Goal: prove a *single* generated page looks distinctive and premium — quality gate before scaling. **Start here.**
- **Phase 2 — Full multi‑page bespoke generation**: design‑system + chrome + per‑page codegen + the 5‑gate code‑critic loop in the sandbox.
- **Phase 3 — Content/media/polish iteration agents** (copy, imagery, custom SVG, motion).
- **Phase 4 — Review/QA convergence + human checkpoint + learning loop.**
- **Phase 5 — Per‑site build & deploy + preview/go‑live; retire the template path.**
- **Phase 6 — Skills expansion + continuous improvement** (ongoing; the system keeps getting better).

## 9. Decisions (LOCKED 2026-05-26)

1. **Output/deploy model** → **Per‑site Next.js 16 + Tailwind v4 project**, each deployed as its own Vercel deployment (matches the hand‑built sites; truest bespoke).
2. **Validation infra** → **Vercel Sandbox**: build + render + screenshot generated code in an ephemeral microVM; Opus 4.7 multimodal critiques the screenshot. This is the hard visual gate.
3. **Fallback** → **None.** Bespoke or human‑escalate. If codegen can't produce a verified site after bounded retries, the run holds for a human — a customer never receives a broken page, but a failed build waits on a person. (No safe‑mode template floor.)
4. **Cost** → Opus‑heavy, multi‑pass per build; budget via a per‑build cost ceiling (cost‑sentinel) and a bounded retry/convergence count.

## 10. Phase 1 build spec (next)

1. `BusinessProfile` + `DesignBrief` schemas (contracts). DesignBrief = the committed art direction: direction label, OKLCH palette, font pairing, spacing/density/motion dials, signature devices, imagery direction, voice, per‑page section narrative.
2. **Discovery agent** (Q&A → BusinessProfile) and **Art‑Direction agent** (→ DesignBrief) — Opus, skills‑injected; `design-critic` gate on distinctiveness.
3. **Page codegen agent** — Opus generates one bespoke Next.js page (TSX + Tailwind v4) from the brief, into a per‑site scaffold.
4. **Sandbox validate** — build + screenshot; **visual critic** (Opus multimodal) scores it; reject/reprompt (bounded).
5. Deploy the single page; show it. Goal: prove one generated page is distinctive + premium before scaling to the multi‑page engine.
