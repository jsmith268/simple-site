import type { Skill } from '../types';

export const informationArchitecture: Skill = {
  name: 'informationArchitecture',
  kind: 'ia',
  appliesTo: ['ia', 'discovery'],
  summary: 'Plan multi-page sites around what a local customer actually needs to decide.',
  body: `# Information Architecture

Plan the site around the customer's decision, not around filling sections. A local visitor wants to answer: is this for me, can I trust them, and how do I reach them.

## Page set (3–5 pages)
- **Home** — the whole pitch in one scroll: nav → hero (overlay) → services → a feature/proof block → stats (if real numbers exist) → testimonials → optional gallery → cta → footer.
- **About** — credibility: nav → about story → team (if there are named people) → testimonials → cta → footer.
- **Services / Menu / Pricing** — the offer in detail: nav → services or pricing → feature → faq → cta → footer.
- **Gallery** — only where work is visual (bakery, salon, retail, home services): nav → gallery → cta → footer.
- **Contact** — the conversion page: nav → contact (split) → hours → map → footer.

## Rules
- \`nav\` and \`footer\` appear on EVERY page. Nav links the real pages only.
- Every page ends on a \`cta\` before the footer — give the visitor one clear next step.
- One \`hero\` per site, on Home, variant 'overlay'. Other pages open on their content block.
- Don't invent sections with nothing to say. No team page without real people; no stats without real numbers; no gallery without real photos. A missing-data section reads as filler.
- Order by trust-building: what they do → proof it works → who they are → how to reach them.

## Rhythm
Alternate section tone ('default' → 'muted' → 'inverted') so adjacent sections separate visually and the eye gets a beat. Don't run three identical-tone bands in a row. Reserve 'inverted' for moments that deserve emphasis (a CTA, a stats band), not for every other section.

## Content wiring
Point a block at playbook content with the \`content\` key ('hero', 'services', 'faqs', 'gallery') so it renders category-specific copy instead of lorem.`,
};
