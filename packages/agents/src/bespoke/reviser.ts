import { resilientGenerateText } from '@simplesight/engine';
import type { BusinessProfile, CriticFinding, GeneratedFile, PagePlan, SiteIA } from '@simplesight/contracts';
import type { DesignBrief } from './brief';
import type { ResolvedDesign } from './validate';
import { sharedImportMap } from './catalog';
import { capabilityRules } from './capabilities';
import { parseSingleFile } from './parse';
import { pageFilePath } from './page';
import { COPY_TARGET, voiceRules } from './voice';

export interface ReviseArgs {
  profile: BusinessProfile;
  brief: DesignBrief;
  design: ResolvedDesign;
  ia: SiteIA;
  page: PagePlan;
  currentContents: string;
  findings: CriticFinding[]; // design + content findings for THIS page
  /** Fresh, verified, on-brand photos to swap in when imagery was flagged off-brief. */
  newImages?: { url: string; alt: string; role: string }[];
  model: string;
}

export interface ReviseResult {
  file: GeneratedFile;
  costCents: number;
}

/**
 * Reviser agent — a PRODUCER (separate from the critics) that rewrites ONE page
 * to resolve the reviewer's design + content findings. Preserves what works,
 * changes only what the findings require. The corrected file is re-verified by
 * the critics afterward (convergence loop in converge.ts).
 */
export async function revisePage(args: ReviseArgs): Promise<ReviseResult> {
  const { profile, brief, design, ia, page, currentContents, findings, model } = args;
  const filePath = pageFilePath(page.slug);
  const shared = sharedImportMap(ia);
  const importLines = shared.map((c) => `- ${c.name} (${c.importPath}) props ${c.props}`).join('\n');

  const findingList = findings
    .map((f, i) => `${i + 1}. [${f.severity}] ${f.area}: ${f.message}${f.fix ? `\n   FIX: ${f.fix}` : ''}`)
    .join('\n');

  const system = `You are an award-winning front-end developer AND copy editor REVISING one existing Next.js 16 (App Router) + Tailwind v4 page of a bespoke site to fix specific reviewer findings.

Your job: resolve EVERY finding given while preserving everything that already works. Make the smallest changes that fully fix each finding (and obvious adjacent instances of the same problem). Do NOT redesign from scratch; keep the structure, components, and good copy intact.

${capabilityRules(profile.capabilities)}

Hard rules (unchanged from generation):
- Output the ONE complete corrected file. It is a SERVER COMPONENT: no 'use client', no hooks, no event handlers. Interactivity stays in imported client components.
- Imports allowed: the prebuilt components below (match their prop types EXACTLY) + Section + 'next/link'. NO next/image, no next/font, no other libraries.
- Inline SVG for icons. Escape JSX apostrophes/quotes. Write punctuation as REAL characters (– — · " ') — never literal \\u2013 / \\u00b7 escapes. Use correct, natural English idiom.
- Imagery: use the provided photos prominently with a consistent treatment; never invent photo IDs.
- Never delete a whole section to make a finding go away; fix it in place.

COPY — every visible word must read as a senior in-house copywriter wrote it, never an LLM:
${voiceRules()}

${COPY_TARGET}

Prebuilt components:
${importLines || '(none)'}

Design context — direction: ${brief.direction}; palette bg ${design.palette.background}/fg ${design.palette.foreground}/primary ${brief.palette.primary}/accent ${brief.palette.accent}; fonts via --font-display/-accent/-body/-mono; voice: ${brief.voice}.

Return EXACTLY one delimited file block and nothing else, in the format:
=== FILE: <path> ===
<code>`;

  const imageryBlock = args.newImages?.length
    ? `\nIMAGERY WAS FLAGGED OFF-BRIEF (too clinical/cold/stocky). REPLACE the photo src values on this page with these verified, on-brand URLs (use them in order; write specific alt text; keep the same treatment/CSS):\n${args.newImages.map((i) => `- [${i.role}] ${i.url} — ${i.alt}`).join('\n')}\n`
    : '';

  const prompt = `PAGE: "${page.name}" (${page.slug}) — file ${filePath}

REVIEWER FINDINGS to fix on this page:
${findingList}
${imageryBlock}
CURRENT FILE (${filePath}):
\`\`\`tsx
${args.currentContents}
\`\`\`

Return the corrected complete file as:
=== FILE: ${filePath} ===
<code>

Fix every finding; keep the rest.`;

  const r = await resilientGenerateText({ model, system, prompt, maxOutputTokens: 32000, cacheSystem: true });
  return { file: parseSingleFile(r.text, filePath), costCents: r.costCents };
}
