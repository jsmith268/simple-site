import { resilientGenerateText } from '@simplesight/engine';
import type { AssetManifest, BusinessProfile, GeneratedFile, SiteIA } from '@simplesight/contracts';
import type { DesignBrief } from './brief';
import type { ResolvedDesign } from './validate';
import { COMPONENT_SPECS, componentNameFor, foundationComponents } from './catalog';
import { capabilityRules } from './capabilities';
import { parseDelimitedFiles } from './parse';

export interface FoundationArgs {
  profile: BusinessProfile;
  brief: DesignBrief;
  design: ResolvedDesign;
  ia: SiteIA;
  assets: AssetManifest;
  model: string;
}

export interface FoundationResult {
  files: GeneratedFile[];
  costCents: number;
  ms: number;
  missing: string[];
}

/**
 * Generalized Foundation generator: emits globals.css, layout.tsx, a Section
 * helper, SiteNav + SiteFooter (from the IA chrome), and any shared widget/embed
 * components the IA uses — all styled from the committed design. One Opus call.
 */
export async function generateFoundation(args: FoundationArgs): Promise<FoundationResult> {
  const { profile, brief, design, ia, assets, model } = args;
  const comps = foundationComponents(ia); // includes nav, footer

  // Build the ordered list of files + their specs.
  const files: { path: string; spec: string }[] = [];
  files.push({
    path: 'app/globals.css',
    spec: `globals.css — FIRST line exactly \`@import "tailwindcss";\`. Then :root vars: --bg ${design.palette.background}; --fg ${design.palette.foreground}; --primary ${brief.palette.primary}; --accent ${brief.palette.accent}; --muted ${brief.palette.muted}; --font-display: ${design.fontVars.display}; --font-accent: ${design.fontVars.accent}; --font-body: ${design.fontVars.body}; --font-mono: ${design.fontVars.mono}. Implement utility classes for the brief's signature devices (${brief.signatureDevices.join('; ')}) — e.g. grain overlay (SVG fractalNoise ~0.04), scroll-reveal keyframes (.reveal fade+rise, staggered, play on load), gradient-text, oversized section .numeral, .duotone img filter, any marquee keyframes, hairline-bento helper. Add @media (prefers-reduced-motion: reduce) disabling motion. Set body { background:var(--bg); color:var(--fg); font-family:var(--font-body); }.`,
  });
  files.push({
    path: 'app/layout.tsx',
    spec: `layout.tsx (server component, NO 'use client') — import './globals.css'; import SiteNav from '@/components/SiteNav'; import SiteFooter from '@/components/SiteFooter'. <html lang="en"><head> MUST include exactly: <link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" /><link rel="stylesheet" href="${design.googleFontsHref}" /></head><body><SiteNav />{children}<SiteFooter /></body></html>. export const metadata = { title, description } for ${profile.name}. children typed { children: React.ReactNode }.`,
  });
  files.push({
    path: 'app/components/Section.tsx',
    spec: `Section.tsx (server component) — reusable wrapper. Props { id?: string; numeral?: string; eyebrow?: string; title?: React.ReactNode; tone?: 'default'|'muted'|'inverted'; children: React.ReactNode; className?: string }. Renders the oversized .numeral device + mono eyebrow + display-font title + children, with tall section padding and the tone band background.`,
  });
  for (const t of comps) {
    if (t === 'nav') {
      files.push({
        path: 'app/components/SiteNav.tsx',
        spec: `SiteNav.tsx ('use client') — sticky header. Logo: inline-SVG mark + the wordmark "${profile.name}". Desktop nav from THIS structure (render dropdowns for items with children, on hover/click): ${JSON.stringify(ia.chrome.nav.items)}. ${ia.chrome.nav.cta ? `A prominent CTA button "${ia.chrome.nav.cta.label}" → ${ia.chrome.nav.cta.href} in the --primary style.` : ''} Working mobile hamburger (useState) opening a panel with all links + expanded dropdown children. Use Link from 'next/link' for internal links.`,
      });
    } else if (t === 'footer') {
      files.push({
        path: 'app/components/SiteFooter.tsx',
        spec: `SiteFooter.tsx (server component, no hooks) — rich footer. Columns: ${JSON.stringify(ia.chrome.footer.columns)}. Contact: ${profile.contact.email ?? ''} ${profile.contact.phone ?? ''}. Socials: ${JSON.stringify(profile.contact.socials)} (inline-SVG icons). Hours: ${JSON.stringify(profile.hours)}. Address: ${profile.locations[0]?.address ?? ''}. ${ia.chrome.footer.showNewsletter ? 'Include a newsletter email input (plain form, no JS).' : ''} A short brand tagline in the voice.`,
      });
    } else {
      const s = COMPONENT_SPECS[t];
      if (s) files.push({ path: `app/components/${componentNameFor(t)}.tsx`, spec: s.spec });
    }
  }

  const labels = files.map((f) => `=== FILE: ${f.path} ===`).join('\n<code>\n') + '\n<code>';
  const fileSpecs = files.map((f, i) => `${i + 1}) ${f.path}\n   ${f.spec}`).join('\n\n');

  const system = `You are an award-winning front-end designer/developer building the SHARED FOUNDATION (global CSS, layout, and reusable components) for a BESPOKE, premium multi-page website in Next.js 16 (App Router) + Tailwind v4. Implement the committed Design Brief faithfully — distinctive, never a template, never generic.

${capabilityRules(profile.capabilities)}

NON-NEGOTIABLE buildability constraints:
- Tailwind v4 utilities + the palette/font CSS variables. No external libraries. No next/image (use plain <img>). No next/font (fonts load via the <link> in layout).
- Inline SVG for ALL icons/marks. No emoji.
- Components using useState/onClick/onSubmit/onChange MUST start with 'use client' as the literal first line; non-interactive components MUST NOT.
- Every component is a proper default export: export default function Name(props) { ... }. Type all props with interfaces and event handlers (React.FormEvent/ChangeEvent).
- Style with Tailwind utilities + the CSS vars: bg-[var(--bg)] text-[var(--fg)] text-[var(--primary)] etc.; fonts via style={{ fontFamily: 'var(--font-display)' }} or font-[family-name:var(--font-display)].
- Escape apostrophes/quotes in JSX text (&apos; or curly strings) so the build never fails on react/no-unescaped-entities. Write punctuation as REAL characters (– — · " ') — NEVER literal \\u2013 / \\u00b7 escapes in JSX text (they render literally).
- Use ONLY the verified image URLs provided (never invent photo IDs). Use real photos PROMINENTLY (don't replace them with CSS/SVG); apply ONE consistent brand treatment (subtle duotone via CSS filter + faint grain) so the set looks cohesive and non-stocky.

DESIGN to implement:
- Direction: ${brief.direction}
- Palette: bg ${design.palette.background}, fg ${design.palette.foreground}, primary ${brief.palette.primary}, accent ${brief.palette.accent}, muted ${brief.palette.muted}.
- Fonts (already chosen, wired via the Google Fonts <link>): display=${design.fonts.display.name}, accent=${design.fonts.accent.name} (italic), body=${design.fonts.body.name}, mono=${design.fonts.mono.name}.
- Signature devices: ${brief.signatureDevices.join(' · ')}
- Voice: ${brief.voice}

Files to produce (EXACT specs):

${fileSpecs}

Return ALL ${files.length} files in EXACTLY this delimited format, nothing else (no markdown fences, no commentary). Labels in this order:
${labels}`;

  const feedImages = assets.images.filter((i) => i.role === 'feed' || i.role === 'gallery').slice(0, 10);
  const prompt = `Business facts for copy:
- ${profile.name} — ${profile.oneLiner}
- ${profile.description}
- Contact: ${profile.contact.email ?? ''} ${profile.contact.phone ?? ''}; socials ${JSON.stringify(profile.contact.socials)}
- Hours: ${JSON.stringify(profile.hours)}; address: ${profile.locations[0]?.address ?? ''}
- Voice: ${profile.voice.adjectives.join(', ')}${profile.voice.notNotes ? ` — ${profile.voice.notNotes}` : ''}

Verified images you MAY use (use these exact URLs; pick appropriate ones per component):
${assets.images.map((i) => `- [${i.role}] ${i.url} — ${i.alt}`).join('\n') || '- (none; use CSS/SVG treatments)'}
${feedImages.length ? `\nFor SocialFeed/Gallery tiles, prefer the [feed]/[gallery] images above.` : ''}

Write all ${files.length} complete files now. Specific, gorgeous, buildable.`;

  const r = await resilientGenerateText({ model, system, prompt, maxOutputTokens: 32000 });
  const parsed = parseDelimitedFiles(r.text);
  const got = new Set(parsed.map((f) => f.path));
  const missing = files.map((f) => f.path).filter((p) => !got.has(p));
  return { files: parsed, costCents: r.costCents, ms: r.ms, missing };
}
