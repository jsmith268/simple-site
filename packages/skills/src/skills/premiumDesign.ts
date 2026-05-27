import type { Skill } from '../types';

/**
 * Distilled from the operator's own premium sites (referral-booster, ai-partner,
 * skills-directory, angel-one) — the concrete techniques that separate
 * "exceptional" from "decent". Applied to every producer.
 */
export const premiumDesign: Skill = {
  name: 'premium-design',
  kind: 'design',
  appliesTo: ['*'],
  summary: 'Concrete premium techniques: signature gradients, fluid display type, mono eyebrows, grain, hairline bento, motion.',
  body: `Apply these techniques — they are what make a site read as professionally designed, not templated.

TYPOGRAPHY (biggest signal)
- Oversized fluid display: font-size clamp(2.6rem, 6vw, ~6.5rem); line-height 0.92–0.98; letter-spacing -0.035em. Bigger size = tighter tracking + tighter leading.
- Use a real variable display font (Fraunces/Newsreader/Manrope/Space Grotesk) with the opsz axis pushed up at display size. Never default to Inter/Roboto/Open Sans as the display face.
- One accent emphasis per headline: either an italic accent clause or a gradient-clipped word — never the whole headline.
- Eyebrow/kicker above headings: mono, UPPERCASE, letter-spacing 0.18–0.28em, small, muted, optionally with a 40px hairline rule.

COLOR & TEXTURE
- Signature gradient interpolated in OKLCH (use the "in oklch" keyword) so midpoints don't go muddy gray. Multi-stop or multi-radial "mesh" for heroes.
- Layered hero: a radial base wash + ONE blurred accent orb + a hairline — restraint reads more premium than a field of blobs.
- Add a faint SVG fractalNoise grain overlay (opacity ~0.03) to kill the flat-digital look.
- Tinted neutrals, not pure gray/black. 60/30/10 weight. WCAG AA minimum.

COMPOSITION & DEPTH
- Hairline bento: grid with gap:1px on a border-colored background, each cell on the page background → crisp dividers, no border math. Great for stats/metrics.
- Asymmetric grids (e.g. 2fr/1fr hero with a bordered stat rail) beat centered-everything.
- Two-layer shadows (tight contact + soft ambient) and a colored glow on primary CTA hover. Restrained hairline-bordered cards with a hover lift beat heavy glassmorphism.
- Tone-band sections (light / muted / inverted) for page rhythm instead of dividers.

MOTION (subtle, accessible)
- Reveal sections on scroll (fade + 20px rise), staggered, eased cubic-bezier(0.22,1,0.36,1). Always honor prefers-reduced-motion.

Avoid the amateur tells: emoji icons, clip-art, rainbow palettes, centered-everything, default fonts, walls of text, fabricated stats, heavy drop shadows.`,
};
