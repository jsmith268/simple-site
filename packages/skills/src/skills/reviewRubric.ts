import type { Skill } from '../types';

export const reviewRubric: Skill = {
  name: 'reviewRubric',
  kind: 'review',
  appliesTo: ['*'],
  summary: 'Block/warn/info severity rubric with a composite-score gate before publish.',
  body: `# Review Rubric

Score every draft against these checks. Each finding gets a severity. **block** fails the draft and forces a revise. **warn** passes but is logged. **info** is a portal suggestion.

## Block — must fix to ship
- **AI tells:** any banned verb (elevate, unlock, empower, leverage, streamline, harness, seamlessly, robust, comprehensive…), triadic list, false parallelism, filler opener ("In today's…"), or "AI-powered" boilerplate.
- **Contrast fail:** body text below 4.5:1 or text on a photo with no scrim.
- **Banned default font:** Inter / Roboto / Open Sans / Lato / Montserrat as a brand face.
- **Fabricated facts:** invented stats, fake reviews, made-up awards, prices with no basis. Never put a number on screen the business didn't provide.
- **Structural gap:** a page missing nav or footer; a hero missing or duplicated; an empty-data section (team with no people, gallery with no photos).
- **Broken CTA:** a page with no next step, or a CTA pointing nowhere.

## Warn — log, don't block
- Em-dash used as primary punctuation more than once per 300 words.
- Three adjacent sections sharing the same tone (flat rhythm).
- Off-scale spacing values (not on the 4pt scale).
- Generic stock tells (handshake-on-white, headset call center) where a real subject was available.
- Subhead that mostly restates the headline.

## Info — suggestion
- A section that could carry a real number but doesn't.
- Pure-gray neutrals that could be tinted toward the brand hue.
- Alt text that describes generically rather than specifically.

## Composite-score gate
Start at 100. Subtract 25 per block, 8 per warn, 2 per info. **A draft ships only with zero block findings AND a composite ≥ 80.** Below that, return the prioritized findings (blocks first) with a one-line fix each and revise. Max 2 retries before escalating to needs_human.`,
};
