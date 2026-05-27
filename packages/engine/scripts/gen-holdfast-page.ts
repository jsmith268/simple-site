import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { generateText } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';

const envRaw = readFileSync(new URL('../../../.env', import.meta.url), 'utf8');
const m = envRaw.match(/ANTROPIC_KEY\s*=\s*["']?([^"'\n\r]+)["']?/);
if (!m) throw new Error('ANTROPIC_KEY not found');
const apiKey = m[1].trim();

const APP = '/Users/pranayramash/Projects/bespoke-holdfast';
const brief = readFileSync(`${APP}/brief.json`, 'utf8');
const anthropic = createAnthropic({ apiKey });

const slug = process.argv[2]; // e.g. "home", "climb", "classes", "membership", "visit"
if (!slug) throw new Error('pass a page slug arg');

async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  const delays = [20000, 40000, 60000, 60000, 60000, 60000];
  let lastErr: unknown;
  for (let attempt = 0; attempt <= delays.length; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastErr = err;
      const msg = String(err?.message ?? err);
      const status = err?.statusCode ?? err?.status;
      const transient = /529|overload|429|5\d\d|rate.?limit|timeout|ETIMEDOUT|ECONNRESET/i.test(msg) || (status && status >= 429);
      if (!transient || attempt === delays.length) throw err;
      const wait = delays[attempt];
      console.error(`[${label}] transient (attempt ${attempt + 1}): ${msg}. sleeping ${wait / 1000}s`);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  throw lastErr;
}

interface PageDef {
  file: string;
  label: string;
  narrative: string;
}

const PAGES: Record<string, PageDef> = {
  home: {
    file: 'app/page.tsx',
    label: 'app/page.tsx',
    narrative: `HOME (/). The flagship. Sections: (1) Asymmetric 8/4 hero with a duotone climbing photo, an oversized condensed headline with ONE Fraunces-italic accent clause, the route-tape orange "Free First Climb" CTA -> /visit#book, and a bordered vertical "session log" rail (today's hours, set count "200+ routes", a crowd-meter dot). (2) Route-tape marquee strip of stats. (3) "What's inside" grade-card hairline-bento metrics grid (22,000 sq ft, 50-ft walls, auto-belays, training mezzanine, yoga studio) each tagged with a fake V-grade. (4) Three-or-four feature cards linking to /climb, /programs, /membership, /visit with duotone photos. (5) Stats band (2,500+ members, founded 2019, 200+ routes/week). (6) Testimonials / member pull-quotes (3 real-sounding, named, Denver-flavored). (7) <InstagramFeed /> embed. (8) A TrialForm CTA section: short pitch + <TrialForm /> (you can pass no props or id). (9) <LocationMap /> embed. (10) Closing CTA band. Include InstagramFeed, TrialForm, AND LocationMap — all three.`,
  },
  climb: {
    file: 'app/climb/page.tsx',
    label: 'app/climb/page.tsx',
    narrative: `CLIMB (/climb). Hero, then four anchored deep-dive sections with EXACT ids: a <section id="bouldering">, <section id="ropes">, <section id="auto-belays">, <section id="training">. Each: a duotone photo, copy on the discipline, a grade-card detail row, and a relevant CTA. Add a "200+ routes reset weekly" route-setting explainer, a difficulty/grade legend (V0–V12 bouldering + 5.6–5.13 ropes) as a hairline-bento grid, a safety/orientation note, and a closing "Book a free first climb" CTA -> /visit#book. End with a <TrialForm /> or CTA band. Use the Section component for numbered sections where helpful.`,
  },
  classes: {
    file: 'app/programs/page.tsx',
    label: 'app/programs/page.tsx',
    narrative: `CLASSES & COACHING (/programs). Hero. Anchored sections with EXACT ids: <section id="intro"> (Intro to Climbing classes), <section id="youth"> (youth programs / teams), <section id="private"> (private coaching), <section id="clinics"> (skills clinics: movement, lead, lock-off strength). Include a weekly SCHEDULE/TIMETABLE (a real table or grid: days x times x class names — e.g. Intro to Bouldering Tue/Thu 6:30p, Youth Send Squad Sat 10a, Lead Climbing Clinic Wed 7p, Movement Yoga Mon/Fri 9a). Include 3–4 COACH CARDS (name, discipline, a real-sounding bio, an Unsplash portrait, a fun "go-to grade" tag). A leagues & competitions strip. FAQ-ish blurbs. Closing CTA -> /visit#book. End with CTA band.`,
  },
  membership: {
    file: 'app/membership/page.tsx',
    label: 'app/membership/page.tsx',
    narrative: `MEMBERSHIP & PRICING (/membership). Hero. REAL pricing tiers as cards (at least: Day Pass $24, Punch Pass 10-visits $190, Monthly Membership $89/mo, Annual/Founding $79/mo billed annual, Student/Youth discounted ~$69/mo, Family add-ons). Each tier: price, who it's for, bullet list of perks, a CTA. Mark one tier "Most popular" with the route-tape accent. A comparison/what's-included hairline-bento grid (gear rental, guest passes, fitness mezzanine, yoga classes, member events, route-reset priority). Founding-member / community angle. A short FAQ on freezes, cancellations, first-climb-free. Closing CTA -> /visit#book + a TrialForm or CTA band.`,
  },
  visit: {
    file: 'app/visit/page.tsx',
    label: 'app/visit/page.tsx',
    narrative: `VISIT (/visit). Hero. A "first time here?" what-to-expect / what-to-bring section. HOURS prominently (Mon–Fri 6a–11p, Sat–Sun 8a–9p) as a styled grid. <LocationMap /> embed. A <section id="book"> "Book your free first climb" section containing the full <TrialForm id="book" /> with a strong pitch. Parking/transit (RiNo Art District) note. A FAQ accordion using several <FAQItem /> components (questions: Do I need a reservation? What should I wear? Is gear included on my first climb? Can I bring kids? Do you have day passes? Where do I park?). Day-pass + waiver note. Include LocationMap, the full TrialForm (with id="book"), the FAQ accordion (multiple FAQItem), and hours.`,
  },
};

const def = PAGES[slug];
if (!def) throw new Error('unknown slug ' + slug);

if (existsSync(`${APP}/${def.file}`) && readFileSync(`${APP}/${def.file}`, 'utf8').trim().length > 100) {
  console.log(`PAGE ${def.file} already exists, skipping`);
  process.exit(0);
}

const system = `You are an award-winning front-end designer/developer building ONE bespoke, premium PAGE of a multi-page website for an indoor climbing gym in Next.js 16 (App Router) + Tailwind v4. Implement the committed Design Brief faithfully. Bold, athletic, energetic, community-first, a little irreverent — never bro-y, never a template, never generic AI filler.

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
<code>`;

const prompt = `The committed Design Brief (implement faithfully):\n${brief}\n\nBusiness facts:\n- Holdfast Climbing + Movement, RiNo Art District, 2500 Larimer St, Denver CO 80205. Founded 2019, 2,500+ members.\n- 22,000 sq ft: bouldering, 50-ft rope & lead walls, auto-belays, fitness training mezzanine, yoga/movement studio. 200+ routes reset weekly.\n- Hours Mon–Fri 6a–11p, Sat–Sun 8a–9p. hello@holdfast.demo. Instagram @holdfastclimbing.\n- Goal: book a free first climb, convert to memberships.\n\nThis page's narrative:\n${def.narrative}\n\nWrite the ONE complete file now. Make it gorgeous, specific, rich, and buildable.`;

const { text } = await withRetry(
  () =>
    generateText({
      model: anthropic('claude-opus-4-7'),
      system,
      prompt,
      maxOutputTokens: 32000,
    }),
  `page:${slug}`,
);

writeFileSync(`${APP}/page-${slug}-output.txt`, text);

const esc = def.label.replace(/[/.]/g, '\\$&');
const re = new RegExp(`=== FILE: ${esc} ===\\n([\\s\\S]*?)(?=\\n=== FILE:|$)`);
const mm = text.match(re);
let body: string;
if (mm) {
  body = mm[1];
} else {
  // fallback: strip any stray fences and use whole text
  body = text;
}
body = body.replace(/^```[a-z]*\n?/i, '').replace(/\n?```\s*$/i, '').trim() + '\n';

const full = `${APP}/${def.file}`;
mkdirSync(dirname(full), { recursive: true });
writeFileSync(full, body);
console.log(`PAGE WRITTEN ${def.file} (${body.length} chars)`);
