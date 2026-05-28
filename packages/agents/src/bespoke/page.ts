import { resilientGenerateText } from '@simplesight/engine';
import type { AssetManifest, BusinessProfile, GeneratedFile, PagePlan, SiteIA } from '@simplesight/contracts';
import type { DesignBrief } from './brief';
import type { ResolvedDesign } from './validate';
import { sharedImportMap } from './catalog';
import { capabilityRules } from './capabilities';
import { parseSingleFile } from './parse';
import { COPY_TARGET, voiceRules } from './voice';

export interface PageArgs {
  profile: BusinessProfile;
  brief: DesignBrief;
  design: ResolvedDesign;
  ia: SiteIA;
  page: PagePlan;
  assets: AssetManifest;
  model: string;
}

export interface PageResult {
  file: GeneratedFile;
  costCents: number;
  ms: number;
}

export function pageFilePath(slug: string): string {
  return slug === '/' ? 'app/page.tsx' : `app${slug.replace(/\/$/, '')}/page.tsx`;
}

/** Generate ONE bespoke page from its IA PagePlan, importing the shared components. */
export async function generatePage(args: PageArgs): Promise<PageResult> {
  const { profile, brief, design, ia, page, assets, model } = args;
  const filePath = pageFilePath(page.slug);
  const shared = sharedImportMap(ia);

  const importLines = shared
    .map((c) => `- import ${c.name} from '${c.importPath}';  // <${c.name} /> props ${c.props}`)
    .join('\n');

  const sectionNarrative = page.sections
    .map((s, i) => `${i + 1}. [${s.kind}${s.anchorId ? ` #${s.anchorId}` : ''}]${s.components.length ? ` (uses: ${s.components.join(', ')})` : ''}\n   ${s.narrative}`)
    .join('\n');

  const system = `You are an award-winning front-end designer/developer building ONE bespoke, premium PAGE of a multi-page website in Next.js 16 (App Router) + Tailwind v4. Implement the committed Design Brief faithfully — never a template, never generic AI filler.

${capabilityRules(profile.capabilities)}

This page is a SERVER COMPONENT (no 'use client', no hooks, no event handlers). All interactivity lives in the prebuilt client components you import (they already exist — do NOT redefine them).

Prebuilt components you MAY import (only the ones this page needs):
${importLines || '- (none — this page is pure composition)'}
- import Section from '@/components/Section';  // <Section id? numeral? eyebrow? title? tone?>{children}</Section>
- import Link from 'next/link';

The '@/' alias maps to the app/ directory.

NON-NEGOTIABLE buildability constraints:
- EXACTLY one file. export default function Page() { return (<main>…</main>) }. You MAY also export const metadata.
- Only the imports listed above (those you use) + 'next/link'. NO other libraries. NO next/image (use plain <img>). NO next/font. NO React hooks. NO 'use client'.
- When passing props to an imported component, match its prop types EXACTLY as shown above — never pass a string where an array/object is typed (a type mismatch fails the build).
- Inline SVG for icons. No emoji. Escape JSX apostrophes/quotes (&apos;/curly strings).
- Write punctuation as REAL characters (– — · " " ' ') in copy — NEVER literal escape sequences like \\u2013 or \\u00b7 in JSX text (they render literally on the page). Use correct English idiom (e.g. "roasted in Portland", not "roasted on Portland").
- Style with Tailwind v4 utilities + palette/font CSS vars (bg-[var(--bg)], text-[var(--primary)], font via style={{fontFamily:'var(--font-display)'}}); use the globals.css helper classes (.reveal, .grain, .numeral, .duotone, etc.).
- Author the non-shared sections (hero, feature grids, stats, pricing, testimonials, schedule, cta bands, etc.) INLINE as rich composition implementing the brief's signature devices.
- IMAGERY (important — past builds were marked down for too little real photography): USE the verified image URLs PROMINENTLY — a real photo in the hero and in most major sections. Do NOT substitute CSS gradients/SVG where a real photograph belongs. Apply ONE consistent brand treatment to every photo (e.g. a subtle duotone via CSS filter: grayscale()/contrast()/sepia() toward the palette, + a faint grain overlay) so disparate stock reads as one cohesive, premium, non-stocky set. Use ONLY the provided URLs (never invent photo IDs); always alt text + loading="lazy" on non-hero images; crop tight/off-center for editorial feel.
- RICH page: implement every section below as a distinct, well-composed block. Real, specific copy in the brand voice — concrete names, numbers, places. ZERO filler.

DESIGN:
- Direction: ${brief.direction}
- Palette: bg ${design.palette.background}, fg ${design.palette.foreground}, primary ${brief.palette.primary}, accent ${brief.palette.accent}, muted ${brief.palette.muted}.
- Fonts via vars: --font-display ${design.fonts.display.name}, --font-accent ${design.fonts.accent.name} (italic accent clause), --font-body ${design.fonts.body.name}, --font-mono ${design.fonts.mono.name}.
- Signature devices: ${brief.signatureDevices.join(' · ')}
- Voice: ${brief.voice}

COPY — the visible words must read as written by a senior in-house copywriter, never an LLM. Apply this rigorously:
${voiceRules()}

${COPY_TARGET}

Return EXACTLY one delimited file block and nothing else, in this format (the exact path is given in the task below):
=== FILE: <path> ===
<code>`;

  const prompt = `Business facts:
- ${profile.name} — ${profile.oneLiner}. ${profile.description}
- Offerings: ${profile.offerings.map((o) => o.name).join(', ') || '—'}
- Proof: ${profile.proof.stats.map((s) => `${s.value} ${s.label}`).join(', ') || '—'}
- Primary goal: ${profile.primaryGoal}
- Contact: ${profile.contact.email ?? ''} ${profile.contact.phone ?? ''}; address ${profile.locations[0]?.address ?? ''}; hours ${JSON.stringify(profile.hours)}

PAGE: "${page.name}" (${page.slug}) — ${page.role}

Section-by-section narrative to implement (in order):
${sectionNarrative}

Verified images you MAY use (exact URLs):
${assets.images.map((i) => `- [${i.role}] ${i.url} — ${i.alt}`).join('\n') || '- (none; use CSS/SVG treatments)'}

OUTPUT FILE PATH: ${filePath}
Return exactly one delimited block:
=== FILE: ${filePath} ===
<the complete file>

Write the ONE complete file now. Gorgeous, specific, rich, buildable.`;

  const r = await resilientGenerateText({ model, system, prompt, maxOutputTokens: 32000, cacheSystem: true });
  return { file: parseSingleFile(r.text, filePath), costCents: r.costCents, ms: r.ms };
}
