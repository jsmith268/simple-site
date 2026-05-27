import type { Skill } from '../types';

export const imageryDirection: Skill = {
  name: 'imageryDirection',
  kind: 'imagery',
  appliesTo: ['imager', 'section_builder'],
  summary: 'Source real category-fit photos; treat them so they cohere with the brand.',
  body: `# Imagery Direction

Photography carries half the credibility of a small-business site. Generic stock or AI-render kills it.

## Sourcing
- Pull from BOTH the Unsplash and Pexels APIs (more + better candidates). Unsplash: \`/search/photos?query=…&orientation=landscape|portrait|squarish&order_by=relevant&content_filter=high\`. Pexels: \`/v1/search?query=…&orientation=landscape|portrait|square&size=large\`. Both support orientation + relevancy ordering — request the orientation the slot needs (hero=landscape, portraits=portrait, feed tiles=square).
- ART DIRECTION FIRST: build the query from the committed brief's imagery direction + mood, not just the bare category — that is the filter that yields cohesive, on-brand results.
- AUTHENTICITY BIAS: add modifiers like "candid", "documentary", "natural light", "real" and prefer unposed, in-situ frames. Avoid the "most-downloaded"/popular look and overtly staged "corporate" shots — those are what read as generic stock.
- Match the SUBJECT to the trade: a bakery shows bread and proofing, a dentist a clean operatory, a plumber hands-on work — not a person smiling at a laptop.
- Prefer photos with real depth, real hands, real product. Avoid the obvious stock tells: forced laughter, headset call-center shots, isolated handshake-on-white, fake "team" lineups.
- Hero needs a horizontal frame with room for an overlay headline. Keep the busy detail off to one side so text stays legible.
- Galleries want variety: wide establishing shot, a close detail, a person at work, the finished result. Don't ship four near-identical frames.

## Treatment for brand cohesion
- The single most effective de-stocking move: apply ONE consistent programmatic treatment to EVERY photo so disparate sources read as one commissioned shoot. Concretely in CSS: \`filter: grayscale(1) contrast(1.05) sepia(.2)\` graded toward the palette, or a duotone via a wrapper + \`mix-blend-mode\` (multiply/screen) pseudo-elements, or an SVG \`feColorMatrix\` for precise two-tone. Add a faint film grain (SVG fractalNoise at ~0.04 opacity, optionally \`mix-blend-mode: overlay\`).
- Unify mismatched photos with a consistent treatment: a subtle duotone or color grade toward the brand hue, light film grain, or a gradient fade into the section background.
- Hero overlays: dark scrim (or brand-hued gradient) so text clears 4.5:1 contrast. Never float thin light text on raw photo.
- Keep treatment consistent across a page — same grade, same grain — so the set reads as one shoot, not a scrape.
- Respect the subject's natural color when it IS the product (food, flowers, finished work). Grade the surroundings, not the croissant.

## Accessibility & performance
- Every image needs meaningful alt text describing what it shows, not "image" or the filename.
- Lead/hero image loads with priority; below-fold images lazy-load. Always set width/height to avoid layout shift.
- No copyrighted logos or recognizable faces you don't have rights to.`,
};
