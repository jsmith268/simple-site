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

const anthropic = createAnthropic({ apiKey });

const FILES = [
  'app/globals.css',
  'app/layout.tsx',
  'app/components/SiteNav.tsx',
  'app/components/SiteFooter.tsx',
  'app/components/InstagramFeed.tsx',
  'app/components/LocationMap.tsx',
  'app/components/TrialForm.tsx',
  'app/components/Section.tsx',
  'app/components/FAQItem.tsx',
];

const allExist = FILES.every((f) => existsSync(`${APP}/${f}`) && readFileSync(`${APP}/${f}`, 'utf8').trim().length > 30);
if (allExist) {
  console.log('FOUNDATION already complete, skipping');
  process.exit(0);
}

const system = `You are an award-winning front-end designer/developer building the SHARED FOUNDATION (global CSS, layout, and reusable components) for a BESPOKE, premium multi-page website for an indoor climbing gym in Next.js 16 (App Router) + Tailwind v4. Implement the committed Design Brief faithfully. Bold, athletic, energetic — never a template, never generic.

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
<code>`;

const prompt = `The committed Design Brief (implement faithfully):\n${brief}\n\nBusiness facts for copy:\n- Holdfast Climbing + Movement, indoor climbing gym, RiNo Art District, 2500 Larimer St, Denver CO 80205. Founded 2019, 2,500+ members.\n- 22,000 sq ft: bouldering, 50-ft rope & lead walls, auto-belays, fitness training mezzanine, yoga/movement studio. 200+ routes reset weekly.\n- Classes, youth programs, leagues, competitions, memberships, day passes.\n- Hours Mon–Fri 6a–11p, Sat–Sun 8a–9p. Email hello@holdfast.demo. Instagram @holdfastclimbing.\n- Goal: book a free first climb, convert to memberships.\n- Voice: bold, energetic, encouraging, community-first, a little irreverent — never bro-y or intimidating.\n\nWrite all NINE complete files now. Specific, gorgeous, buildable.`;

const { text } = await withRetry(
  () =>
    generateText({
      model: anthropic('claude-opus-4-7'),
      system,
      prompt,
      maxOutputTokens: 32000,
    }),
  'foundation',
);

writeFileSync(`${APP}/foundation-output.txt`, text);

function extract(label: string): string | null {
  const esc = label.replace(/[/.]/g, '\\$&');
  const re = new RegExp(`=== FILE: ${esc} ===\\n([\\s\\S]*?)(?=\\n=== FILE:|$)`);
  const mm = text.match(re);
  if (!mm) return null;
  return mm[1].replace(/^```[a-z]*\n?/i, '').replace(/\n?```\s*$/i, '').trim() + '\n';
}

let written = 0;
for (const f of FILES) {
  const body = extract(f);
  if (!body) {
    console.error('MISSING in output:', f);
    continue;
  }
  const full = `${APP}/${f}`;
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, body);
  written++;
  console.log('wrote', f, body.length, 'chars');
}
console.log(`FOUNDATION DONE: ${written}/${FILES.length} files`);
if (written < FILES.length) process.exit(2);
