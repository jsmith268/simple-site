import { generateJson } from '@simplesight/engine';
import {
  type BusinessProfile,
  ComponentType,
  type CriticFinding,
  SiteIA,
} from '@simplesight/contracts';
import type { DesignBrief } from './brief';
import { allowedComponents, capabilityRules, forbiddenComponents } from './capabilities';

/* ──────────────────────────────────────────────────────────────────────────
 * Phase 3 — Information-Architecture agent (the central unlock).
 * Replaces the hand-authored per-page section narratives. Given the profile +
 * brief, it produces the full SiteIA: pages, ordered sections with rich
 * compositional narratives + catalog component selection, global chrome, and
 * embed placement. A deterministic validator gates the result.
 * ────────────────────────────────────────────────────────────────────────── */

const IA_SHAPE = `Return SiteIA JSON with EXACTLY this shape:
{
  "pages": [
    { "name": string, "slug": string ("/" for home), "role": string,
      "sections": [
        { "kind": string, "narrative": string (a SPECIFIC described composition implementing the brief's signature devices — NOT a generic block name),
          "components": string[] (catalog types this section uses), "anchorId"?: string }
      ] }
  ],
  "chrome": {
    "nav": { "items": [ { "label": string, "href": string, "children"?: [ { "label": string, "href": string } ] } ],
             "cta"?: { "label": string, "href": string } },
    "footer": { "columns": [ { "heading": string, "links": [ { "label": string, "href": string } ] } ], "showNewsletter": boolean }
  },
  "sharedComponents": string[] (catalog types generated once and reused: always include "nav","footer"),
  "embeds": { "instagram": boolean, "map": boolean, "leadForm": boolean, "booking": boolean, "reviews": boolean }
}
Catalog component types (use ONLY these): ${ComponentType.options.join(', ')}.`;

/** Generate the full information architecture for a bespoke multi-page site. */
export async function generateSiteIA(
  profile: BusinessProfile,
  brief: DesignBrief,
  model: string,
  onCost?: (cents: number) => void,
): Promise<SiteIA> {
  const embedReqs: string[] = [];
  if (profile.embeds.instagram) embedReqs.push('an Instagram-style "social-feed" on the Home page');
  if (profile.embeds.map) embedReqs.push('a "map" on the Home page AND the visit/contact page');
  if (profile.embeds.leadForm || profile.embeds.booking) embedReqs.push('a "lead-form" on Home (CTA) and a full one on the visit/contact page (anchorId "book")');
  if (profile.embeds.reviews) embedReqs.push('a "testimonials" section');

  const caps = profile.capabilities;
  const allowed = allowedComponents(caps);

  const system = `You are an expert information architect + content strategist for BESPOKE premium websites. Given a business profile and a committed design brief, produce the complete SiteIA for a MULTI-PAGE site.

${capabilityRules(caps)}
ALLOWED component types (use ONLY these; never a disabled one): ${allowed.join(', ')}.
${caps.newsletter ? '' : 'Set chrome.footer.showNewsletter = false.'}

Principles:
- Home + the requested/typical pages for this business. Every page must be RICH: 6-10 sections, varied compositions — not a stack of generic blocks.
- VARIETY IS MANDATORY: no two ADJACENT sections may share the same composition/kind. Alternate full-bleed, asymmetric split, hairline-bento, editorial column, tone-band, and media-led layouts so each page has rhythm.
- Each page must declare ONE hero moment — the single most striking composition on that page — in its first section's narrative.
- Each section's "narrative" is a precise, buildable composition that USES THE BRIEF'S SIGNATURE DEVICES and palette/voice — specific to THIS business (real section intent, concrete content, where photos/components go). This narrative is what the page generator implements, so be concrete (like an art director briefing a developer).
- "components" lists which catalog component TYPES the section uses (e.g. a pricing page section uses ["pricing-tiers"], a visit page uses ["map","lead-form","faq-accordion"]).
- Build a real "chrome.nav": group pages under dropdowns where it helps (children), include a single prominent CTA matching the primary goal. Footer columns should cover the nav + contact.
- "sharedComponents": the catalog types to generate once and reuse across pages — always "nav" and "footer", plus every embed/component used on more than one page.
- Place EVERY requested embed: ${embedReqs.length ? embedReqs.join('; ') : '(none specifically requested — add a lead-form + map if the business has a location)'}.
- Anchors: give sections stable anchorIds where the nav deep-links to them.
- Keep slugs lowercase, hyphenated, leading slash; Home is "/".`;

  const prompt = `BUSINESS PROFILE:
${JSON.stringify(profile, null, 2)}

DESIGN BRIEF (already committed — honor its direction, palette, devices, voice):
${JSON.stringify({ direction: brief.direction, palette: brief.palette, signatureDevices: brief.signatureDevices, voice: brief.voice, pages: brief.pages }, null, 2)}

Requested pages: ${profile.requestedPages.length ? profile.requestedPages.join(', ') : '(infer the typical set)'}
Requested components: ${profile.requestedComponents.length ? profile.requestedComponents.join(', ') : '(infer)'}

${IA_SHAPE}

Produce the SiteIA now as a single JSON object.`;

  return generateJson({ model, schema: SiteIA, system, prompt, maxOutputTokens: 12000, retries: 2, onCost });
}

/** All component types referenced anywhere in the IA. */
export function componentsUsed(ia: SiteIA): ComponentType[] {
  const set = new Set<ComponentType>(ia.sharedComponents);
  for (const p of ia.pages) for (const s of p.sections) for (const c of s.components) set.add(c);
  return [...set];
}

/**
 * Deterministic IA gate. Catches the failure modes a human would catch:
 * not multi-page, no Home, requested embeds not placed, nav doesn't cover
 * pages, thin pages. Returns blocking + advisory findings.
 */
export function validateSiteIA(ia: SiteIA, profile: BusinessProfile): { ok: boolean; findings: CriticFinding[] } {
  const findings: CriticFinding[] = [];
  const used = componentsUsed(ia);

  // Capability gates — disabled features must not appear.
  const forbidden = new Set(forbiddenComponents(profile.capabilities));
  for (const t of used) {
    if (forbidden.has(t)) findings.push({ severity: 'block', area: 'capability', message: `Disabled feature "${t}" is present.`, fix: `Remove all "${t}" usage (capability is off).` });
  }
  if (!profile.capabilities.newsletter && ia.chrome.footer.showNewsletter) {
    findings.push({ severity: 'block', area: 'capability', message: 'Footer newsletter present but newsletter is disabled.', fix: 'Set footer.showNewsletter=false.' });
  }

  if (ia.pages.length < 2) findings.push({ severity: 'block', area: 'structure', message: 'Site is not multi-page (need ≥2 pages).' });
  if (!ia.pages.some((p) => p.slug === '/')) findings.push({ severity: 'block', area: 'structure', message: 'No Home page (slug "/").' });

  for (const p of ia.pages) {
    if (p.sections.length < 3) findings.push({ severity: 'warn', area: 'depth', message: `Page "${p.name}" is thin (${p.sections.length} sections).` });
  }

  const want: [boolean, ComponentType, string][] = [
    [profile.embeds.instagram, 'social-feed', 'Instagram social-feed requested but not placed.'],
    [profile.embeds.map, 'map', 'Map requested but not placed.'],
    [profile.embeds.leadForm || profile.embeds.booking, 'lead-form', 'Lead/booking form requested but not placed.'],
  ];
  for (const [requested, type, msg] of want) {
    if (requested && !used.includes(type)) findings.push({ severity: 'block', area: 'embeds', message: msg, fix: `Add a "${type}" component to a relevant section.` });
  }

  // Nav should reference every page slug (directly or via a child link).
  const navHrefs = new Set<string>();
  for (const item of ia.chrome.nav.items) {
    navHrefs.add(item.href.split('#')[0] ?? '');
    for (const c of item.children ?? []) navHrefs.add(c.href.split('#')[0] ?? '');
  }
  for (const p of ia.pages) {
    if (p.slug !== '/' && !navHrefs.has(p.slug)) findings.push({ severity: 'warn', area: 'nav', message: `Page "${p.slug}" is not reachable from the nav.` });
  }

  if (!ia.sharedComponents.includes('nav') || !ia.sharedComponents.includes('footer')) {
    findings.push({ severity: 'warn', area: 'chrome', message: 'sharedComponents should include nav + footer.' });
  }

  return { ok: !findings.some((f) => f.severity === 'block'), findings };
}
