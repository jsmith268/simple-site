# SimpleSight Onboarding — Design Spec

**For: the design team, to design the onboarding screen(s) that feed website generation.**
**Date: 2026-05-27.**

## 0. What onboarding actually is (read this first)

Onboarding is **the only input** to the generator. The answers flow straight into the pipeline:

```
Onboarding answers → BusinessProfile → Design Brief (art direction) → Information Architecture
                   → bespoke code generation → build/verify → deploy
```

Two consequences drive the whole design:

1. **More signal in = higher quality out.** Every extra, specific answer makes the design more distinctive, the copy more concrete, the page structure more right. So the screen must *reward* depth — but never *require* it.
2. **It must never feel like a form slog.** A busy owner should get a real site from a paragraph and three taps. So the design principle is **progressive disclosure with smart inference**: start minimal, infer the rest, show every inferred choice back as an *editable* pill, and let power users go as deep as they want.

Both modes write to **one shared data model** (`BusinessProfile`). Fast mode fills a subset and lets the AI Discovery step infer the rest; Detailed mode exposes every field. They are not two products — they are two depths of the same flow.

---

## 1. The data model the screen must produce (`BusinessProfile`)

Everything below maps to one object. Fields marked **★ essential** are the minimum for the fast path; the rest are *enriching* (each measurably lifts quality).

| Field | Essential? | Type | Feeds |
|---|---|---|---|
| `name` | ★ | text | everything (wordmark, copy, metadata) |
| `category` | ★ | text/typeahead | design brief direction + default pages/components |
| `oneLiner` | ★ | text | hero headline, metadata |
| `primaryGoal` | ★ | text/chips | the main CTA on every page |
| `description` | ☆ strong | longtext | brief rationale, About copy, voice |
| `offerings[]` | ☆ strong | list | services/menu/pricing sections |
| `audience` | ☆ | text | voice + imagery direction |
| `voice.adjectives[]` + `voice.notNotes` | ☆ strong | multiselect + text | the entire tone of every word + banned-word list |
| `proof.stats[]`, `proof.awards[]` | ☆ | list | stat bands, credibility sections (never fabricated) |
| `requestedPages[]` | ☆ | list/chips | the sitemap (else inferred per category) |
| `requestedComponents[]` | ☆ | checkboxes | which catalog sections appear |
| `embeds{instagram,map,leadForm,booking,reviews}` | ☆ strong | toggles | the functional embeds placed by the IA |
| `locations[]` (address→geocode) | ☆ | address | the **map**, footer, local copy |
| `hours[]` | ☆ | structured | hours blocks, footer |
| `contact{email,phone,socials[]}` | ☆ | fields | footer, forms, the **Instagram feed** handle |
| `visual.moodWords[]`, `colorNotes`, `appearance(light/dark)`, `referenceUrls[]`, `avoid` | ☆ strong | mood pills + text | the **design brief**: palette, type, signature devices |
| `brandAssets[]` (logo, photos) | ☆ | uploads | real imagery instead of stock |

> The catalog `requestedComponents` options are a fixed list — present them as friendly grouped checkboxes, not raw slugs: *nav, footer, hero, feature grid, stats, pricing tiers, schedule/timetable, team cards, testimonials, FAQ accordion, gallery, social feed (Instagram), map, lead/contact form, CTA band, marquee, newsletter, logo cloud, steps, prose.*

---

## 2. The Fast Path — "a site in two minutes"

**Goal:** a great site from the least possible input. Two entry options on one screen:

**Option A — Describe it (recommended default).** A single big box:
> *"Tell us about your business — paste a paragraph, or your existing website / social link."*

That text (or a crawl of the URL) goes to the **Discovery agent**, which produces a complete `BusinessProfile` — inferring category, voice, the primary goal, and the *typical pages/components/embeds for that kind of business*. (This is a live capability today.)

**Option B — Tap the essentials.** Four quick inputs:
1. Business name (text)
2. What kind of business? (category typeahead)
3. Where are you? (address — enables the map; optional)
4. What's the #1 thing visitors should do? (chips: *Book / Buy / Visit / Call / Inquire / Subscribe* → becomes the CTA)

Then one button: **Generate my site.** Everything else is inferred with category-aware defaults.

**Reassurance copy:** *"We'll choose the design, pages, and content for you — you can refine anything after you see the preview."*

**Critical fast-path UX:** after generation, show the **inferred choices as editable pills** (direction, palette, pages, components, embeds) so the owner can nudge without ever having filled a form. This is the bridge from fast → detailed.

---

## 3. The Detailed Path — granular, higher quality

Same data model, every field exposed, grouped into short steps. Each group is **collapsible and skippable** ("Skip — we'll choose"), and each shows *why it matters*. Suggested grouping:

**Step 1 · Identity & positioning** — name, tagline, one-liner, category, description.
*Drives:* the brief's rationale + all hero/about copy. *Example placeholder for one-liner:* "A candlelit natural wine bar in the Mission."

**Step 2 · What you offer** — repeatable offering rows (name + optional blurb).
*Drives:* services/menu/pricing/feature sections. *More rows = richer middle of the site.*

**Step 3 · Audience & voice** — audience (text); voice **adjective multiselect** (bold, warm, editorial, playful, clinical, irreverent, refined…) + a "never sound like this / banned words" field.
*Drives:* literally every sentence's tone. *This is one of the highest-leverage inputs.*

**Step 4 · Proof** — stats (label + value), awards.
*Drives:* credibility sections. *We never invent numbers — empty is fine.*

**Step 5 · Goal & CTA** — primary goal (chips + free text), optional secondary goal.

**Step 6 · Pages & structure** — pick/confirm pages (chips with category-smart suggestions); optional one-line "what matters most on this page" per page.
*Drives:* the sitemap + per-page emphasis.

**Step 7 · Sections & features** — grouped checkboxes from the component catalog (see §1). Pre-checked by category.
*Drives:* which sections the IA places.

**Step 8 · Embeds** — toggles: Instagram feed, Map, Contact/Lead form, Booking, Reviews. (Map needs an address; IG needs a handle.)

**Step 9 · Location, hours, contact** — address (autocomplete→geocode), hours grid, email/phone/socials.

**Step 10 · Visual & brand** — mood-word pills; colors you love / must avoid; light vs dark; reference URLs ("sites whose *feel* you like — we take inspiration, never copy"); **logo + photo uploads**.
*Drives:* the design brief's palette, type, and signature devices, and real imagery instead of stock. *The single biggest lever on "does it look bespoke."*

> Design note: every Detailed step should pre-fill from any Fast-path/Discovery inference, so "go deeper" is *editing*, not *restarting*.

---

## 4. How depth maps to quality (the lever to communicate)

| If the owner gives… | …the output gains |
|---|---|
| Just name + category + goal | A correct, on-brand site with inferred everything (good, generic-leaning) |
| + voice adjectives + banned words | Copy that sounds like *them*, not "AI" |
| + offerings + proof | Real, specific middle-of-site sections (no filler) |
| + mood words + colors + appearance | A distinctive, committed art direction (not the safe average) |
| + reference URLs | Sharper aesthetic targeting |
| + uploaded photos/logo | Real brand imagery instead of stock — the biggest "is this real?" signal |
| + per-page emphasis + component picks | Page structure that matches how *they* sell |

**Design implication:** show a subtle **"detail → quality" meter** that fills as they add signal, framing extra input as *upgrading their site*, not *more work*.

---

## 5. Worked example — how Holdfast (the climbing gym) was actually made

The freeform pitch that produced the live 5-page Holdfast site contained, implicitly, most of the Detailed fields:

> *"Holdfast Climbing + Movement — an indoor climbing gym in RiNo, Denver. 22,000 sq ft of bouldering, 50-ft rope walls, auto-belays, training, yoga. Classes, youth programs, leagues, memberships, day passes. 200+ routes reset weekly. Founded 2019, 2,500+ members. Voice: bold, energetic, community-first, a little irreverent — never bro-y. Goal: book a free first climb + convert to memberships. … @holdfastclimbing. Mood: bold, athletic, energetic."*

That maps to: `category`=climbing gym; `offerings`=bouldering/ropes/classes/memberships; `proof`=200+ routes, 2,500+ members, founded 2019; `voice.adjectives`=[bold, energetic, irreverent], `notNotes`="never bro-y"; `primaryGoal`=book a free first climb; `embeds`=instagram+map+leadForm; `visual.moodWords`=[bold, athletic, energetic].

→ The brief committed to *"Chalk & Concrete Brutalism,"* the IA produced 5 pages with a mega-menu, and the site shipped. **What the visual critic later flagged** (a stock alpine hero instead of a gym interior) is exactly what **Step 10 (upload photos / imagery direction)** would have prevented — concrete proof that the imagery fields earn their place.

---

## 6. Layout & UX guidance (the actual screen)

- **One adaptive flow, two depths.** Default to Fast; a persistent "Add more detail" expands the Detailed steps inline. Avoid a hard Quick/Detailed fork if possible — let depth be a dial.
- **Progressive disclosure**: collapsible steps, every optional group has **"Skip — we'll choose."**
- **Smart defaults everywhere**, pre-filled by category and by any Discovery inference.
- **Chips & multiselects over free text** wherever the value space is known (goal, voice, mood, components, embeds).
- **Inline examples/placeholders** in every field (use real ones, like the one-liner example above).
- **Show & let them edit the AI's choices**: after Discovery/generation, render the inferred brief (direction + palette swatches + fonts), pages, and components as **editable pills/cards** — this is the trust-builder and the fast→detailed bridge.
- **Asset upload**: prominent, optional, with "use professional stock if you don't have photos yet."
- **Reference URLs**: clearly framed as *inspiration, not copying.*
- **Autosave + resumable**; **mobile-first** (many owners onboard on a phone).
- **A live "detail → quality" meter** (see §4).
- **Geocode the address** inline (it powers the map embed).
- End state: **"Generate preview"** → progress → preview at `username.simplesight.co` with one-tap refinement.

---

## 7. Open questions for the design team

1. Fast path: single "describe it" box vs. the 4-tap essentials vs. offering both — which is the primary entry?
2. How to present ~20 catalog components without overwhelm (we suggest 4–5 grouped clusters, pre-checked by category)?
3. Where does **account creation / payment** sit relative to onboarding (before generate? after preview, before publish?) — affects the flow.
4. How much of the inferred brief to expose post-generation (full palette/type editor vs. a few high-level pills)?
5. Required minimum for the fast path — we recommend just name + category + goal (+ optional address), everything else inferred.

*Backing data model + the live question set live in `packages/contracts/src/bespoke.ts` (`BusinessProfile`) and `packages/agents/src/bespoke/profile.ts` (`ONBOARDING_QUESTIONS`).*
