import { resilientGenerateText } from '@simplesight/engine';
import type { AssetManifest, BusinessProfile, GeneratedFile, PagePlan, SiteIA } from '@simplesight/contracts';
import type { DesignBrief } from './brief';
import type { ResolvedDesign } from './validate';
import { sharedImportMap } from './catalog';
import { parseSingleFile } from './parse';

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
- Style with Tailwind v4 utilities + palette/font CSS vars (bg-[var(--bg)], text-[var(--primary)], font via style={{fontFamily:'var(--font-display)'}}); use the globals.css helper classes (.reveal, .grain, .numeral, .duotone, etc.).
- Author the non-shared sections (hero, feature grids, stats, pricing, testimonials, schedule, cta bands, etc.) INLINE as rich composition implementing the brief's signature devices.
- Use ONLY the verified image URLs provided (never invent photo IDs). Always alt text + loading="lazy" on non-hero images.
- RICH page: implement every section below as a distinct, well-composed block. Real, specific copy in the brand voice — concrete names, numbers, places. ZERO filler.

DESIGN:
- Direction: ${brief.direction}
- Palette: bg ${design.palette.background}, fg ${design.palette.foreground}, primary ${brief.palette.primary}, accent ${brief.palette.accent}, muted ${brief.palette.muted}.
- Fonts via vars: --font-display ${design.fonts.display.name}, --font-accent ${design.fonts.accent.name} (italic accent clause), --font-body ${design.fonts.body.name}, --font-mono ${design.fonts.mono.name}.
- Signature devices: ${brief.signatureDevices.join(' · ')}
- Voice: ${brief.voice}

Return EXACTLY one delimited file block, nothing else:
=== FILE: ${filePath} ===
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

Write the ONE complete file now. Gorgeous, specific, rich, buildable.`;

  const r = await resilientGenerateText({ model, system, prompt, maxOutputTokens: 32000 });
  return { file: parseSingleFile(r.text, filePath), costCents: r.costCents, ms: r.ms };
}
