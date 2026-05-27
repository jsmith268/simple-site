import { readFileSync, writeFileSync } from 'node:fs';
import { generateText } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { getSkill } from '@simplesight/skills';

const envRaw = readFileSync(new URL('../../../.env', import.meta.url), 'utf8');
const m = envRaw.match(/ANTROPIC_KEY\s*=\s*["']?([^"'\n\r]+)["']?/);
if (!m) throw new Error('ANTROPIC_KEY not found');
const apiKey = m[1].trim();

const brief = readFileSync(new URL('./brief.json', import.meta.url), 'utf8');

function skillBody(name: string): string {
  const s = getSkill(name);
  return s ? `## ${s.name}\n${s.body}` : '';
}
const skills = [
  skillBody('premium-design'),
  skillBody('designStandards'),
  skillBody('marketingVoice'),
].join('\n\n');

const system = `You are an award-winning front-end designer and developer building ONE bespoke, premium HOME page for a natural wine bar in Next.js 16 + Tailwind v4. You must implement the committed Design Brief faithfully and write real, specific copy in the brand voice. The result must be visually striking and unmistakably bespoke — never a template.

Apply this expertise:
${skills}

You are producing THREE files for a standalone Next 16 (App Router) + Tailwind v4 app. STRICT, NON-NEGOTIABLE buildability constraints:

app/page.tsx:
- EXACTLY one file. \`export default function Page() { return (<main>…</main>) }\`.
- NO imports of any kind. NO 'use client'. NO external libraries. NO next/image. NO next/font. NO React hooks (server component, static).
- Use plain <img> tags with REAL Unsplash wine-bar photo URLs in the form https://images.unsplash.com/photo-<id>?auto=format&fit=crop&w=1600&q=80 — pick moody candlelit wine/bar photos. Always include alt text and loading="lazy" on non-hero images.
- Inline SVG for ALL icons/marks/marginalia (grape, cork, flame, hairline). No emoji.
- A RICH, multi-section home page implementing the brief's Home sections: sticky nav, a striking candlelit hero (signature devices + palette), tonight's pours strip (hairline-bento bottle grid), the-place-in-plain-words two-column editorial, weekly tasting teaser (inverted band), small plates / rotating kitchen, press + regulars pull quotes, visit footer. Use oversized Fraunces-italic section numerals ('01 — pour', etc.).
- Real, specific copy in the brief voice. Specific producers/villages, plain-English tasting notes, concrete hours. NO AI-tell filler. Ship none of the 24 AI tells.
- Style with Tailwind v4 utility classes AND palette CSS variables (e.g. bg-[var(--bg)], text-[var(--fg)], border-[var(--muted)], text-[var(--accent)]). Apply scroll-reveal/grain/gradient classes from globals.css.

app/globals.css:
- First line: @import "tailwindcss";
- :root { --bg / --fg / --primary / --accent / --muted : the brief hexes }
- Custom utility/helper classes: candle-glow gradient (oklch interpolated), fractal-noise grain overlay (~0.04 opacity, via SVG data URI background or a .grain class), gradient-text, hairline-bento helpers, oversized numeral class, scroll-reveal keyframes (fade + 20px rise), candle-flicker keyframe.
- A @media (prefers-reduced-motion: reduce) block that disables animations.
- NOTE: page.tsx is a static server component with no JS, so scroll-reveal must degrade gracefully — use CSS animations that play on load (not requiring IntersectionObserver). Reveals should animate in via animation on load with staggered delays; ensure content is visible if animations are off.

app/layout.tsx:
- html/body, import './globals.css', and a Google Fonts <link> for Fraunces (display, with opsz+ital axes), Inter Tight (body), JetBrains Mono (kicker). Set body font-family via inline style or className. A metadata export (title/description) is OPTIONAL — keep it simple and buildable.

Return the THREE files in EXACTLY this delimited format, with nothing else outside the blocks (no markdown fences, no commentary):
=== FILE: app/page.tsx ===
<code>
=== FILE: app/globals.css ===
<code>
=== FILE: app/layout.tsx ===
<code>`;

const prompt = `The committed Design Brief (implement it faithfully):\n${brief}\n\nBusiness facts to use in copy:\n- Vespera, candlelit natural wine bar & bottle shop, Mission, San Francisco. Open since 2021.\n- ~120 rotating bottles; wines by the glass; bottle shop at retail; weekly Thursday tastings (8 seats, 7pm); small plates from a rotating local kitchen.\n- Named one of SF's best new wine bars.\n- Open Tue–Sun evenings. Email hello@vespera.demo. Instagram @vespera.\n- Goal: get people to visit and reserve tastings.\n\nWrite the THREE complete files now. Make it gorgeous, specific, and buildable.`;

const a = createAnthropic({ apiKey });
const { text } = await generateText({
  model: a('claude-opus-4-7'),
  system,
  prompt,
  maxOutputTokens: 32000,
});

writeFileSync(new URL('./page-output.txt', import.meta.url), text);

function extract(label: string): string {
  const re = new RegExp(`=== FILE: ${label.replace(/[/.]/g, '\\$&')} ===\\n([\\s\\S]*?)(?=\\n=== FILE:|$)`);
  const mm = text.match(re);
  if (!mm) throw new Error(`Could not extract ${label}`);
  return mm[1].replace(/^```[a-z]*\n?/i, '').replace(/\n?```\s*$/i, '').trim() + '\n';
}

const APP = '/Users/pranayramash/Projects/bespoke-vespera/app';
writeFileSync(`${APP}/page.tsx`, extract('app/page.tsx'));
writeFileSync(`${APP}/globals.css`, extract('app/globals.css'));
writeFileSync(`${APP}/layout.tsx`, extract('app/layout.tsx'));
console.log('FILES WRITTEN');
console.log('page.tsx chars:', extract('app/page.tsx').length);
console.log('globals.css chars:', extract('app/globals.css').length);
console.log('layout.tsx chars:', extract('app/layout.tsx').length);
