# Holdfast build — the exact prompts for every agent

This documents the **verbatim** prompts that produced https://bespoke-holdfast.vercel.app (the 5‑page Holdfast Climbing site). Reproduced from the generator scripts:
- `packages/agents/scripts/gen-holdfast-brief.ts` (→ `packages/agents/src/bespoke/brief.ts`)
- `packages/engine/scripts/gen-holdfast-foundation.ts`
- `packages/engine/scripts/gen-holdfast-page.ts`

**Model:** `claude-opus-4-7` (Opus 4.7) via the **direct Anthropic API** (`@ai-sdk/anthropic`, `createAnthropic({ apiKey })`). Opus ignores `temperature`. The free‑tier AI Gateway blocks Opus, so the direct key is used.

**Shape of every call:** each agent call = a **system prompt** + a **user prompt**. There were **3 generative agents** (Brief, Foundation, Per‑page) plus **2 non‑LLM procedures** (image gate, build/fix loop). Below, each is given in full.

> **Three honest caveats discovered while documenting this** (also see “Known discrepancies” at the end):
> 1. The Brief agent *requests* three skills but only **`premium-design`** actually injected — `design-standards` and `marketing-voice` resolved to `undefined` (registry stores them as `designStandards`/`marketingVoice`; the agent asked for kebab‑case). So the brief prompt that *ran* carried one skill body, not three.
> 2. The **fonts** Opus chose in the brief (Bigshot One / Söhne) aren’t usable Google Fonts; the substitution to Anton/Oswald/Fraunces/Inter Tight/JetBrains Mono was **hard‑coded in the Foundation system prompt**, not decided by the model.
> 3. The per‑page **section narratives** were **hand‑written in the page script**, *in addition to* the brief’s own Opus‑generated narratives (the full brief JSON was also injected). Both were present in each page prompt.

---

## Agent A — Design Brief

Implemented by `generateDesignBrief(businessText, 'anthropic/claude-opus-4.7')`, which calls the engine’s `generateJson()` (text‑JSON mode — plain `generateText`, then parse + Zod‑validate, to avoid the Opus `Output.object` empty‑`{}` bug). `generateJson` **appends** this line to the system prompt:

```
\n\nOUTPUT FORMAT: respond with ONLY one valid JSON object — no markdown, no code fences, no commentary before or after.
```

### A.1 — System prompt (verbatim template)

```
You are an award-winning art director scoping a BESPOKE website. Your job is to commit to ONE distinctive, specific aesthetic direction that fits this exact business — never the safe, generic average. Two different businesses must yield two visibly different briefs.

Apply this expertise:
${skillText('premium-design', 'design-standards', 'marketing-voice')}

Hard rules:
- Commit to one clear direction and justify it. Avoid the default SaaS look.
- Palette in OKLCH thinking, tinted neutrals, never pure gray/black, never the default blue-on-white. WCAG AA.
- Choose real variable display fonts with character (NOT Inter/Roboto/Open Sans/Lato/Montserrat as the display face).
- signatureDevices must be 3-5 SPECIFIC, buildable devices (e.g. "asymmetric 8/4 hero with a bordered stat rail", "OKLCH aurora-mesh hero", "hairline-bento metrics", "oversized serif section numerals", "duotone-treated photography").
- pages: a real sitemap (Home + the most common pages for this business) where each section has a clear intent — described as compositions, not generic block names.
- Voice per marketing-voice: human, specific, no AI-tell filler.
```

**`${skillText(...)}` actually expanded to ONLY this `premium-design` body** (the other two skills resolved to nothing):

```
## premium-design
Apply these techniques — they are what make a site read as professionally designed, not templated.

TYPOGRAPHY (biggest signal)
- Oversized fluid display: font-size clamp(2.6rem, 6vw, ~6.5rem); line-height 0.92–0.98; letter-spacing -0.035em. Bigger size = tighter tracking + tighter leading.
- Use a real variable display font (Fraunces/Newsreader/Manrope/Space Grotesk) with the opsz axis pushed up at display size. Never default to Inter/Roboto/Open Sans as the display face.
- One accent emphasis per headline: either an italic accent clause or a gradient-clipped word — never the whole headline.
- Eyebrow/kicker above headings: mono, UPPERCASE, letter-spacing 0.18–0.28em, small, muted, optionally with a 40px hairline rule.

COLOR & TEXTURE
- Signature gradient interpolated in OKLCH (use the "in oklch" keyword) so midpoints don't go muddy gray. Multi-stop or multi-radial "mesh" for heroes.
- Layered hero: a radial base wash + ONE blurred accent orb + a hairline — restraint reads more premium than a field of blobs.
- Add a faint SVG fractalNoise grain overlay (opacity ~0.03) to kill the flat-digital look.
- Tinted neutrals, not pure gray/black. 60/30/10 weight. WCAG AA minimum.

COMPOSITION & DEPTH
- Hairline bento: grid with gap:1px on a border-colored background, each cell on the page background → crisp dividers, no border math. Great for stats/metrics.
- Asymmetric grids (e.g. 2fr/1fr hero with a bordered stat rail) beat centered-everything.
- Two-layer shadows (tight contact + soft ambient) and a colored glow on primary CTA hover. Restrained hairline-bordered cards with a hover lift beat heavy glassmorphism.
- Tone-band sections (light / muted / inverted) for page rhythm instead of dividers.

MOTION (subtle, accessible)
- Reveal sections on scroll (fade + 20px rise), staggered, eased cubic-bezier(0.22,1,0.36,1). Always honor prefers-reduced-motion.

Avoid the amateur tells: emoji icons, clip-art, rainbow palettes, centered-everything, default fonts, walls of text, fabricated stats, heavy drop shadows.
```

### A.2 — User prompt (verbatim)

```
Business / brief:
${businessText}

JSON shape (fill every field):
{
  "direction": string, "rationale": string,
  "palette": { "mode": "light"|"dark", "background": hex, "foreground": hex, "primary": hex, "accent": hex, "muted": hex, "note": string },
  "fonts": { "display": string, "body": string, "pairingNote": string },
  "type": { "displayTreatment": string, "scaleNote": string },
  "spacing": { "density": "airy"|"comfortable"|"compact", "rhythmNote": string },
  "motion": { "level": "subtle"|"expressive", "note": string },
  "signatureDevices": string[] (3-5),
  "imagery": { "direction": string, "treatment": string },
  "voice": string,
  "pages": [ { "name": string, "slug": string, "sections": [ { "kind": string, "intent": string } ] } ] (>=3 pages, >=3 sections each)
}

Produce the Design Brief now as a single JSON object.
```

### A.3 — `${businessText}` (verbatim — THE single seed input for the whole site)

```
Holdfast Climbing + Movement — an indoor climbing gym in the RiNo Art District, Denver CO (2500 Larimer St). 22,000 sq ft of bouldering, 50-ft rope & lead walls, auto-belays, a fitness training mezzanine, and a yoga/movement studio. Classes, youth programs, leagues, competitions, memberships, day passes. 200+ routes reset weekly. Founded 2019, 2,500+ members. Voice: bold, energetic, encouraging, community-first, a little irreverent — never bro-y or intimidating. Audience: total beginners to advanced climbers, families, fitness folks. Goal: get people to book a free first climb and convert to memberships. Hours Mon–Fri 6a–11p, Sat–Sun 8a–9p. hello@holdfast.demo, @holdfastclimbing. Aesthetic should be bold, athletic, energetic.
```

**Output:** the full design brief JSON → **Appendix A**. (`maxOutputTokens: 6000`.) This call retried through 5 backoff rounds due to Anthropic 529s.

---

## Agent B — Shared Foundation (one call → 9 files)

`generateText({ model: anthropic('claude-opus-4-7'), system, prompt, maxOutputTokens: 32000 })`. Output parsed by `=== FILE: <path> ===` delimiters into the 9 foundation files.

### B.1 — System prompt (verbatim)

```
You are an award-winning front-end designer/developer building the SHARED FOUNDATION (global CSS, layout, and reusable components) for a BESPOKE, premium multi-page website for an indoor climbing gym in Next.js 16 (App Router) + Tailwind v4. Implement the committed Design Brief faithfully. Bold, athletic, energetic — never a template, never generic.

NON-NEGOTIABLE buildability constraints:
- Tailwind v4 utilities + the palette CSS variables. No external libraries. No next/image (use plain <img>). No next/font (fonts via Google Fonts <link> in layout).
- Inline SVG for ALL icons/marks. No emoji.
- Components using useState/onClick/onSubmit/onChange MUST start with 'use client' as the literal first line. Components with no interactivity must NOT have 'use client'.
- Every component is a proper default export: export default function Name() { ... }. Each file self-contained, no cross-imports except where specified.
- Use real Unsplash climbing photo URLs of the form https://images.unsplash.com/photo-<id>?auto=format&fit=crop&w=<w>&q=80 with alt text and loading="lazy".
- Escape apostrophes/quotes in JSX text correctly (use &apos; or curly strings) so the build never fails on unescaped entities.
- TypeScript-safe: type all component props with interfaces; type event handlers (React.FormEvent, React.ChangeEvent).

FONTS: The brief names some fonts that are NOT on Google Fonts (Bigshot One is poor quality, Söhne is paid). Substitute with high-quality Google Fonts that achieve the same condensed-industrial editorial feel: use 'Oswald' (or 'Anton' for the hero) as the condensed DISPLAY face, 'Fraunces' for the italic editorial accent clause, 'Inter Tight' for body, and 'JetBrains Mono' for kickers/grade tags. Wire these via one Google Fonts <link> in layout and CSS variables --font-display, --font-accent, --font-body, --font-mono.

PALETTE & DEVICES: implement the brief's palette (--bg #F2EDE4, --fg #161412, --primary #FF4A1C route-tape orange, --accent #3B5BDB cobalt, --muted #C9C0B0) and signature devices (route-tape marquee, grade-card hairline-bento, oversized condensed section numerals, duotone chalk+ink photography, asymmetric hero). Photos duotone-ish via CSS filter so orange stays the only saturated accent.

Files to produce (EXACT specs):

1) app/globals.css
   - First line EXACTLY: @import "tailwindcss";
   - :root palette vars (--bg,--fg,--primary,--accent,--muted) + font vars.
   - Custom utilities/classes: route-tape marquee animation (keyframes scroll), grain overlay (.grain via SVG data URI ~0.04 opacity), gradient-text/.text-tape, .numeral oversized section numeral, scroll-reveal keyframes (fade + 20px rise, play on load with stagger via .reveal and animation-delay), .duotone img filter (grayscale + contrast + slight sepia in chalk tone), hairline-bento helpers.
   - @media (prefers-reduced-motion: reduce) disabling animations and forcing opacity:1/transform:none.
   - Set body { background: var(--bg); color: var(--fg); font-family: var(--font-body); }

2) app/layout.tsx (server component, NO 'use client')
   - import './globals.css'
   - import SiteNav from '@/components/SiteNav' and SiteFooter from '@/components/SiteFooter'
   - <html lang="en"><head> with the Google Fonts <link rel="preconnect"> + stylesheet link for Oswald, Anton, Fraunces (ital), Inter Tight, JetBrains Mono.</head><body><SiteNav/>{children}<SiteFooter/></body></html>
   - export const metadata = { title, description } (climbing gym, Denver RiNo).
   - children typed { children: React.ReactNode }.

3) app/components/SiteNav.tsx ('use client')
   - Sticky top nav with logo (inline SVG mark + 'HOLDFAST' wordmark). Desktop mega-menu dropdowns on hover/click:
     [Climb ▸] -> links to /climb#bouldering, /climb#ropes, /climb#auto-belays, /climb#training
     [Learn ▸] -> links to /programs#intro, /programs#youth, /programs#private, /programs#clinics
     plus top links: Membership (/membership), Visit (/visit).
   - A prominent "Free First Climb" button -> /visit#book (orange/route-tape style).
   - Working mobile hamburger with useState (open/close), full-screen or slide panel with all links + the dropdown items expanded.
   - Use next/link 'Link' from 'next/link' for internal links.

4) app/components/SiteFooter.tsx (server component, no hooks)
   - Rich footer: hours (Mon–Fri 6a–11p, Sat–Sun 8a–9p), address 2500 Larimer St, Denver, CO 80205, nav columns (Climb/Learn/Visit/Company), socials (Instagram @holdfastclimbing -> https://instagram.com/holdfastclimbing, plus inline SVG icons), a newsletter email input (plain, no JS needed — it can be a simple form with type=email and a button; no state). Email hello@holdfast.demo. Brand voice tagline.

5) app/components/InstagramFeed.tsx (server component)
   - Header: @holdfastclimbing avatar (use an Unsplash portrait/climbing img) + handle + follower count (e.g. "18.4k followers") + "Follow on Instagram" button -> https://instagram.com/holdfastclimbing.
   - Responsive grid of 6 to 8 square photo tiles (aspect-square) with hover overlay showing a heart inline-SVG + like count + short caption. Verified Unsplash climbing photos (bouldering, rope walls, chalk, gym interiors). Use real photo ids.

6) app/components/LocationMap.tsx (server component)
   - A styled card containing EXACTLY this iframe: <iframe src="https://www.google.com/maps?q=2500%20Larimer%20St%2C%20Denver%2C%20CO%2080205&output=embed" loading="lazy" ...> with title, full width, ~360-420px tall, rounded/bordered.
   - Alongside: address block, hours, and a "Get Directions" link -> https://www.google.com/maps?q=2500+Larimer+St,+Denver,+CO+80205.

7) app/components/TrialForm.tsx ('use client')
   - Functional lead form, useState for fields + submitted flag. Fields: full name (text, required), email (email, required), phone (tel, required), experience level <select> (options: Never climbed / Beginner / Intermediate / Advanced), preferred date (date), message (textarea). HTML required validation. onSubmit -> e.preventDefault() -> set submitted=true -> render a success-state card ("You're booked in — we'll be in touch", reset option). No backend. Style with palette, route-tape submit button. Accept optional prop { id?: string } so the page can anchor #book to it.

8) app/components/Section.tsx (server component)
   - Reusable section wrapper: props { id?: string; numeral?: string; kicker?: string; title?: React.ReactNode; children: React.ReactNode; className?: string; }. Renders the oversized condensed numeral device + mono kicker + display title, plus children. Used across pages.

9) app/components/FAQItem.tsx ('use client')
   - Accordion item: props { question: string; answer: React.ReactNode; defaultOpen?: boolean }. useState open toggle, inline SVG chevron that rotates, smooth height/opacity. Used on Visit page FAQ.

Return ALL NINE files in EXACTLY this delimited format, nothing else outside the blocks (no markdown fences, no commentary). Use exactly these labels:
=== FILE: app/globals.css ===
<code>
=== FILE: app/layout.tsx ===
<code>
=== FILE: app/components/SiteNav.tsx ===
<code>
=== FILE: app/components/SiteFooter.tsx ===
<code>
=== FILE: app/components/InstagramFeed.tsx ===
<code>
=== FILE: app/components/LocationMap.tsx ===
<code>
=== FILE: app/components/TrialForm.tsx ===
<code>
=== FILE: app/components/Section.tsx ===
<code>
=== FILE: app/components/FAQItem.tsx ===
<code>
```

### B.2 — User prompt (verbatim; `${brief}` = the full Appendix‑A JSON, injected as text)

```
The committed Design Brief (implement faithfully):
${brief}

Business facts for copy:
- Holdfast Climbing + Movement, indoor climbing gym, RiNo Art District, 2500 Larimer St, Denver CO 80205. Founded 2019, 2,500+ members.
- 22,000 sq ft: bouldering, 50-ft rope & lead walls, auto-belays, fitness training mezzanine, yoga/movement studio. 200+ routes reset weekly.
- Classes, youth programs, leagues, competitions, memberships, day passes.
- Hours Mon–Fri 6a–11p, Sat–Sun 8a–9p. Email hello@holdfast.demo. Instagram @holdfastclimbing.
- Goal: book a free first climb, convert to memberships.
- Voice: bold, energetic, encouraging, community-first, a little irreverent — never bro-y or intimidating.

Write all NINE complete files now. Specific, gorgeous, buildable.
```

---

## Agent C — Per‑page generator (run once per page: home, climb, classes→programs, membership, visit)

`generateText({ model: anthropic('claude-opus-4-7'), system, prompt, maxOutputTokens: 32000 })`, one call per page, output parsed by the single `=== FILE: <path> ===` delimiter.

### C.1 — System prompt (verbatim; `${def.label}` is the page’s file path)

```
You are an award-winning front-end designer/developer building ONE bespoke, premium PAGE of a multi-page website for an indoor climbing gym in Next.js 16 (App Router) + Tailwind v4. Implement the committed Design Brief faithfully. Bold, athletic, energetic, community-first, a little irreverent — never bro-y, never a template, never generic AI filler.

This page is a SERVER COMPONENT (no 'use client', no hooks, no event handlers). All interactivity lives in the already-built client components you import.

You MUST import and use these prebuilt components by their alias paths (they already exist — do NOT redefine them):
- import SiteNav / SiteFooter are already in layout — do NOT add them.
- import InstagramFeed from '@/components/InstagramFeed';  // <InstagramFeed /> — no props
- import LocationMap from '@/components/LocationMap';        // <LocationMap /> — no props
- import TrialForm from '@/components/TrialForm';            // <TrialForm id?="book" /> — optional id prop for anchoring
- import Section from '@/components/Section';                // <Section id? numeral? kicker? title? className?>{children}</Section>
- import FAQItem from '@/components/FAQItem';                // <FAQItem question={string} answer={ReactNode} defaultOpen? />
- import Link from 'next/link';                              // for internal links

The '@/' alias maps to the app/ directory.

NON-NEGOTIABLE buildability constraints:
- EXACTLY one file. export default function Page() { return (<main>…</main>) }. (You MAY also export const metadata = {...}.)
- Only the imports listed above (components you use) + 'next/link'. NO other external libraries. NO next/image (use plain <img>). NO next/font. NO React hooks. NO 'use client'.
- Real Unsplash climbing photo URLs: https://images.unsplash.com/photo-<id>?auto=format&fit=crop&w=<w>&q=80 — bouldering, rope walls, chalk, gym interiors, climbers, portraits for coaches. Always alt text + loading="lazy" on non-hero images.
- Inline SVG for ALL icons/marks. No emoji.
- Escape apostrophes/quotes in JSX text (&apos; / curly strings) so the build never breaks on react/no-unescaped-entities.
- Style with Tailwind v4 utilities + palette CSS vars: bg-[var(--bg)], text-[var(--fg)], text-[var(--primary)], border-[var(--muted)], bg-[var(--accent)] etc. Use the globals.css helper classes (.numeral, .reveal, .grain, .duotone, route-tape marquee, hairline-bento). Fonts via the CSS vars --font-display, --font-accent, --font-body, --font-mono e.g. style={{ fontFamily: 'var(--font-display)' }} or font-[family-name:var(--font-display)].
- RICH page: many distinct, well-composed sections (hero, feature grids, stats, schedule/pricing/coach cards/testimonials/FAQ/events strip/CTAs as relevant). Real, specific copy in brand voice. Specific route names, grades, coach names, Denver/RiNo flavor, concrete hours/prices. SHIP ZERO AI-tell filler.

Palette: --bg #F2EDE4 chalk off-white, --fg #161412 ink, --primary #FF4A1C route-tape orange (CTAs/accents, never body text), --accent #3B5BDB cobalt, --muted #C9C0B0 concrete.

Return EXACTLY one delimited file block, nothing else (no markdown fences, no commentary):
=== FILE: ${def.label} ===
<code>
```

### C.2 — User prompt (verbatim; `${brief}` = Appendix‑A JSON, `${def.narrative}` = the page narrative below)

```
The committed Design Brief (implement faithfully):
${brief}

Business facts:
- Holdfast Climbing + Movement, RiNo Art District, 2500 Larimer St, Denver CO 80205. Founded 2019, 2,500+ members.
- 22,000 sq ft: bouldering, 50-ft rope & lead walls, auto-belays, fitness training mezzanine, yoga/movement studio. 200+ routes reset weekly.
- Hours Mon–Fri 6a–11p, Sat–Sun 8a–9p. hello@holdfast.demo. Instagram @holdfastclimbing.
- Goal: book a free first climb, convert to memberships.

This page's narrative:
${def.narrative}

Write the ONE complete file now. Make it gorgeous, specific, rich, and buildable.
```

### C.3 — The per‑page `${def.narrative}` values (verbatim — the page‑specific info)

**HOME** → `app/page.tsx`
```
HOME (/). The flagship. Sections: (1) Asymmetric 8/4 hero with a duotone climbing photo, an oversized condensed headline with ONE Fraunces-italic accent clause, the route-tape orange "Free First Climb" CTA -> /visit#book, and a bordered vertical "session log" rail (today's hours, set count "200+ routes", a crowd-meter dot). (2) Route-tape marquee strip of stats. (3) "What's inside" grade-card hairline-bento metrics grid (22,000 sq ft, 50-ft walls, auto-belays, training mezzanine, yoga studio) each tagged with a fake V-grade. (4) Three-or-four feature cards linking to /climb, /programs, /membership, /visit with duotone photos. (5) Stats band (2,500+ members, founded 2019, 200+ routes/week). (6) Testimonials / member pull-quotes (3 real-sounding, named, Denver-flavored). (7) <InstagramFeed /> embed. (8) A TrialForm CTA section: short pitch + <TrialForm /> (you can pass no props or id). (9) <LocationMap /> embed. (10) Closing CTA band. Include InstagramFeed, TrialForm, AND LocationMap — all three.
```

**CLIMB** → `app/climb/page.tsx`
```
CLIMB (/climb). Hero, then four anchored deep-dive sections with EXACT ids: a <section id="bouldering">, <section id="ropes">, <section id="auto-belays">, <section id="training">. Each: a duotone photo, copy on the discipline, a grade-card detail row, and a relevant CTA. Add a "200+ routes reset weekly" route-setting explainer, a difficulty/grade legend (V0–V12 bouldering + 5.6–5.13 ropes) as a hairline-bento grid, a safety/orientation note, and a closing "Book a free first climb" CTA -> /visit#book. End with a <TrialForm /> or CTA band. Use the Section component for numbered sections where helpful.
```

**CLASSES (deployed at /programs)** → `app/programs/page.tsx`
```
CLASSES & COACHING (/programs). Hero. Anchored sections with EXACT ids: <section id="intro"> (Intro to Climbing classes), <section id="youth"> (youth programs / teams), <section id="private"> (private coaching), <section id="clinics"> (skills clinics: movement, lead, lock-off strength). Include a weekly SCHEDULE/TIMETABLE (a real table or grid: days x times x class names — e.g. Intro to Bouldering Tue/Thu 6:30p, Youth Send Squad Sat 10a, Lead Climbing Clinic Wed 7p, Movement Yoga Mon/Fri 9a). Include 3–4 COACH CARDS (name, discipline, a real-sounding bio, an Unsplash portrait, a fun "go-to grade" tag). A leagues & competitions strip. FAQ-ish blurbs. Closing CTA -> /visit#book. End with CTA band.
```

**MEMBERSHIP** → `app/membership/page.tsx`
```
MEMBERSHIP & PRICING (/membership). Hero. REAL pricing tiers as cards (at least: Day Pass $24, Punch Pass 10-visits $190, Monthly Membership $89/mo, Annual/Founding $79/mo billed annual, Student/Youth discounted ~$69/mo, Family add-ons). Each tier: price, who it's for, bullet list of perks, a CTA. Mark one tier "Most popular" with the route-tape accent. A comparison/what's-included hairline-bento grid (gear rental, guest passes, fitness mezzanine, yoga classes, member events, route-reset priority). Founding-member / community angle. A short FAQ on freezes, cancellations, first-climb-free. Closing CTA -> /visit#book + a TrialForm or CTA band.
```

**VISIT** → `app/visit/page.tsx`
```
VISIT (/visit). Hero. A "first time here?" what-to-expect / what-to-bring section. HOURS prominently (Mon–Fri 6a–11p, Sat–Sun 8a–9p) as a styled grid. <LocationMap /> embed. A <section id="book"> "Book your free first climb" section containing the full <TrialForm id="book" /> with a strong pitch. Parking/transit (RiNo Art District) note. A FAQ accordion using several <FAQItem /> components (questions: Do I need a reservation? What should I wear? Is gear included on my first climb? Can I bring kids? Do you have day passes? Where do I park?). Day-pass + waiver note. Include LocationMap, the full TrialForm (with id="book"), the FAQ accordion (multiple FAQItem), and hours.
```

---

## Procedure D — Image quality gate (NOT an LLM agent)

No prompt — this is a verification routine the build runner executed against every image URL emitted by Agents B and C:

```
For each unique image URL found in the generated files:
  code = `curl -s -o /dev/null -w '%{http_code}' "<url>"`
  if code != 200:
     replace with a different known-good Unsplash climbing photo id
     (or fallback https://picsum.photos/seed/<word>/<w>/<h>)
Re-run until every image returns 200. (Holdfast: 27 URLs checked, 6 swapped → 0 broken.)
```

---

## Procedure E — Build + fix loop (template; did NOT fire for Holdfast)

`npm run build` (`next build`) was run after writing all files. **For Holdfast it passed on the first attempt**, so the repair prompt below was never sent. The template that *would* be sent to Opus on a build failure (per the build recipe) is:

```
SYSTEM: You are fixing a Next.js 16 + Tailwind v4 build error in a generated file. Return the corrected, complete file in the same delimited format, nothing else.

USER:
This Next 16 + Tailwind v4 build failed with:
<build stderr/stdout>

Here is the current <file path>:
<current file contents>

Return the corrected full <file path> in the same delimited format:
=== FILE: <path> ===
<code>
```
Loop: overwrite the file with Opus’s correction → rebuild → repeat, up to ~6 attempts. Common targets: missing `'use client'`, cross‑file import/prop mismatches, unescaped JSX entities, hooks in a server component.

---

## Known discrepancies (between intent and what actually ran)

1. **Skill injection bug** — Agent A requested `premium-design`, `design-standards`, `marketing-voice`; only `premium-design` resolved (registry names are `designStandards`/`marketingVoice`). The brief was produced with one skill body, not three. *Fix: align the registry keys or the lookup.*
2. **Fonts were hard‑coded, not chosen** — the brief specced Bigshot One / Söhne (not usable Google Fonts); the Foundation system prompt hard‑coded the Anton/Oswald/Fraunces/Inter Tight/JetBrains Mono substitution. *Fix: constrain the brief agent to a vetted Google‑Fonts whitelist.*
3. **Page narratives were hand‑authored** — `${def.narrative}` was written by a human in the page script; the brief’s own Opus‑generated narratives (Appendix A `pages[].sections[].intent`) were also injected. To make this self‑serve, an **Information‑Architecture agent** must generate the narratives from the brief + onboarding. *(This is the central gap addressed in `docs/03-replication-infrastructure-plan.md`.)*
4. **Everything was one‑off scripts** — `gen-holdfast-*.ts` hard‑code the business facts, page list, file specs, and component catalog for Holdfast specifically. None of it is parameterized for an arbitrary business yet.

---

## Appendix A — the generated Design Brief (`brief.json`, injected verbatim into Agents B & C)

```json
{
  "direction": "Chalk & Concrete Brutalism — a high-contrast, route-tape inspired editorial system that feels like a magazine printed on the gym wall. Oversized condensed display type, a single electric route-tape accent against warm chalk-dust neutrals, and grid layouts that echo the geometry of a setter's wall map.",
  "rationale": "Holdfast is bold, athletic, community-first, and a little irreverent — the opposite of the soft, pastel wellness aesthetic most climbing gyms default to. RiNo is a working-class arts district full of raw concrete, muraled warehouses, and screenprinted posters; the site should feel like it belongs on Larimer Street, not in a yoga lobby. A brutalist editorial system with one screaming route-tape accent gives us the energy of a competition bib while the chalk-dust neutrals stay welcoming to total beginners — bold without being bro-y.",
  "palette": { "mode": "light", "background": "#F2EDE4", "foreground": "#161412", "primary": "#FF4A1C", "accent": "#3B5BDB", "muted": "#C9C0B0", "note": "Chalk-dust warm off-white background with near-black ink for editorial contrast. Primary is a route-tape safety orange — used surgically for CTAs, grade tags, and one accent word per headline. Accent is a deep belay-rope cobalt for secondary moments. Muted is sun-bleached concrete. All pairings clear WCAG AA; orange is used on dark or as fill only, never as body text." },
  "fonts": { "display": "Bigshot One paired with Fraunces (italic accent clauses)", "body": "Söhne, with JetBrains Mono for kickers and grade tags", "pairingNote": "A condensed industrial display face carries the athletic weight; Fraunces italic at high opsz handles the one editorial accent clause per headline; Söhne keeps body copy human; JetBrains Mono handles route-setter / grade-card metadata." },
  "type": { "displayTreatment": "Headlines condensed at clamp(3rem, 8.5vw, 8rem), line-height 0.88, tracking -0.04em, ALL CAPS hero hook. One word swapped to Fraunces italic in route-tape orange. Kickers mono uppercase 0.78rem, tracking 0.26em, prefixed with a 40px hairline rule and a V-grade-style tag.", "scaleNote": "Aggressive scale jump: body 1.05rem → section heads ~2.2rem → display ~7rem. Almost nothing in the middle." },
  "spacing": { "density": "comfortable", "rhythmNote": "Tall section padding clamp(6rem, 12vh, 10rem) with tone-band alternation: chalk → concrete muted → inverted near-black band for the membership pitch. 12-col grid, compositions lean 8/4 or 7/5 asymmetric." },
  "motion": { "level": "expressive", "note": "Hero headline staggered word-reveal on load (12px rise, 60ms stagger). Route-tape marquee crawls at 40s/loop. Scroll-reveals 20px rise + fade, staggered. Card hover = 2px lift + 1px orange underline grow. Disabled under prefers-reduced-motion." },
  "signatureDevices": [
    "Route-tape marquee strip — a thin orange band under the hero scrolling weekly stats in mono caps, like competition bib tape",
    "Grade-card metrics: hairline-bento grid with 1px gaps on foreground color, each cell tagged with a fake V-grade (V2, V7, V11)",
    "Asymmetric 8/4 hero with a bordered vertical 'session log' rail showing today's hours, set count, and a live 'crowd meter' dot",
    "Oversized condensed numerals as section markers (01 / 02 / 03) bleeding off the left edge at 12rem, foreground at 8% opacity",
    "Duotone climber photography in chalk + ink (no orange in photos) so the route-tape accent stays the only saturated color"
  ],
  "imagery": { "direction": "Real climbers mid-move — chalked hands, taped fingers, a kid topping out, a 60-year-old on an auto-belay. No stock, no glossy alpine shots. RiNo warehouse light: tall windows, dust in the air.", "treatment": "Duotone #161412 shadows / #F2EDE4 highlights, grain at 0.04. Crops tight and off-center. Occasional full-bleed wide wall shot for scale." },
  "voice": "Direct, encouraging, a little smart-ass. Short sentences. Talks to a first-timer like a V8 crusher. Never uses 'journey,' 'unleash,' 'elevate,' or 'community' as a noun alone. Says 'send,' 'flash,' 'project,' 'beta' — explains in plain English the first time.",
  "pages": [
    { "name": "Home", "slug": "/", "sections": [
      {"kind":"hero","intent":"Asymmetric 8/4 split: 'PULL HARDER. FALL SOFTER.' with 'softer' Fraunces italic orange. Right rail: today's hours, crowd dot, CTA 'Book Your Free First Climb'."},
      {"kind":"route-tape marquee","intent":"'200+ ROUTES RESET WEEKLY · 50FT LEAD WALL · 22,000 SQ FT · 2,500+ MEMBERS · FIRST CLIMB FREE'."},
      {"kind":"first-climb walkthrough","intent":"Three numbered cards 01/02/03 — Book it, Show up, We'll teach you. Kills intimidation."},
      {"kind":"grade-card metrics bento","intent":"Hairline-bento with V-grade tags: 22,000 sq ft / 50 ft walls / 200+ resets / 6a–11p."},
      {"kind":"what's inside","intent":"Five cards: Bouldering, Ropes & Lead, Auto-belays, Fitness Mezzanine, Yoga Studio, each a duotone crop + one-liner."},
      {"kind":"programs strip","intent":"Horizontal row: Youth, Leagues, Comps, Classes, Personal coaching as poster cards."},
      {"kind":"membership pitch (inverted band)","intent":"Near-black band, big headline + three tiers, orange on recommended, 'cancel anytime, no signup fee' upfront."},
      {"kind":"testimonial pair","intent":"Two quotes: a beginner and a 10-year climber, real first names."},
      {"kind":"location + hours","intent":"Address card + RiNo map snippet, hours table, transit/parking, final CTA."}
    ]},
    { "name": "Climb", "slug": "/climb", "sections": [
      {"kind":"page hero","intent":"'01 / CLIMB' numeral. 'Bouldering, ropes, auto-belays — and someone to show you how it all works.'"},
      {"kind":"discipline breakdown","intent":"Three blocks (Bouldering / Top-Rope & Lead / Auto-Belay), duotone photo, plain explanation, 'who it's for' tag."},
      {"kind":"weekly reset cadence","intent":"Calendar strip of which wall resets which day."},
      {"kind":"intro classes table","intent":"Editorial table: Climbing 101, Belay Lesson, Lead Class — duration, price, prereq as mono metadata."},
      {"kind":"gear + what to bring","intent":"Honest list: shoes (we rent), chalk (we sell), comfy clothes. Disarms gear anxiety."},
      {"kind":"CTA band","intent":"Inverted band: 'First climb's on us.' + button."}
    ]},
    { "name": "Membership", "slug": "/membership", "sections": [
      {"kind":"page hero","intent":"'02 / MEMBERSHIP'. 'One pass. The whole building.'"},
      {"kind":"plan comparison","intent":"Three cards Solo / Duo / Family, orange tag on popular, inclusions plainly, no asterisks."},
      {"kind":"what's included bento","intent":"Perks bento: unlimited climbing, yoga + fitness, guest passes, gear discounts, partner gyms, V-grade tiles."},
      {"kind":"day pass alternative","intent":"Punch cards + day passes, transparent pricing."},
      {"kind":"FAQ","intent":"Six questions: freeze, cancel, family add-ons, guest passes, age minimums, refunds."},
      {"kind":"final CTA","intent":"Inverted band 'Start with a free climb — decide later'."}
    ]},
    { "name": "Programs", "slug": "/programs", "sections": [
      {"kind":"page hero","intent":"'03 / PROGRAMS'. 'For 6-year-olds, 60-year-olds, and everyone projecting in between.'"},
      {"kind":"youth","intent":"Afterschool, summer camps, comp team. Photo-led, age ranges as mono tags."},
      {"kind":"adult classes & coaching","intent":"Technique clinics, strength blocks, 1:1 coaching. Schedule preview + book per offering."},
      {"kind":"leagues + comps","intent":"Seasonal league bracket layout + upcoming comps with date stamps."},
      {"kind":"yoga + fitness","intent":"Mezzanine training, mobility, yoga schedule — reassures fitness folks."},
      {"kind":"CTA","intent":"Filter-by-goal block routing to the right program."}
    ]},
    { "name": "Visit", "slug": "/visit", "sections": [
      {"kind":"hero","intent":"Address slab '2500 LARIMER ST / DENVER', RiNo context."},
      {"kind":"hours table","intent":"Weekday/weekend split, open/closed status."},
      {"kind":"getting here","intent":"Bike, light rail, car/parking, walk-from-downtown — real specifics."},
      {"kind":"first-visit checklist","intent":"Waiver, tour, gear rental, intro climb — removes uncertainty."},
      {"kind":"contact","intent":"hello@holdfast.demo, @holdfastclimbing, phone, short group/event form."},
      {"kind":"final CTA","intent":"'Book Your Free First Climb' inverted band."}
    ]}
  ]
}
```
