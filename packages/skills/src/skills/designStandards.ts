import type { Skill } from '../types';

export const designStandards: Skill = {
  name: 'designStandards',
  kind: 'design',
  appliesTo: ['*'],
  summary: 'OKLCH color, tinted neutrals, banned default fonts, 4pt spacing, real hierarchy.',
  body: `# Design Standards

Build sites that look intentionally designed for THIS business — not a template, not the AI house style.

## Color — use OKLCH, not HSL
- Express every color as \`oklch(L C H)\`. Lightness 0–100%, chroma ~0–0.4, hue 0–360.
- Build shade scales by holding chroma+hue and varying lightness. **Drop chroma as you near white or black** so extremes don't go garish.
- The brand hue is a decision about THIS business. Do not reflexively reach for blue (~250) or warm orange (~60) — those are the AI defaults.

## Tinted neutrals — pure gray is dead
- Give every neutral a small chroma (0.005–0.015) hued toward the brand color. It reads as cohesion, not as color.
- Never tint everything warm-orange or cool-blue by habit. Match the SPECIFIC brand.
- Never use pure black (#000) or pure gray (\`oklch(50% 0 0)\`) for large areas.

## 60-30-10 by visual weight
60% neutral surfaces/whitespace, 30% secondary text/borders, 10% accent for CTAs and focus. The accent works because it is rare — don't spray it.

## Contrast (WCAG)
Body text ≥ 4.5:1, large text/UI ≥ 3:1. Placeholder text also needs 4.5:1. No gray text on colored backgrounds — darken the background hue instead. No thin light text floating on photos; use an overlay scrim.

## Typography
- **Banned default fonts**: Inter, Roboto, Open Sans, Lato, Montserrat. Pick a face whose physical character fits the brand voice.
- Pair at most two families, and only for genuine contrast (serif + sans). One family in multiple weights usually beats two.
- 5-size scale with real contrast (≥3:1 headline-to-body). Fewer sizes, more separation.
- Fluid \`clamp()\` for display headings; fixed \`rem\` for body. Body ≥ 16px. Measure ~65ch.

## Spacing & hierarchy
- 4pt scale: 4, 8, 12, 16, 24, 32, 48, 64, 96. No off-scale values. Use \`gap\`, not margins.
- Hierarchy from 2–3 dimensions at once (size + weight + space), never size alone.
- Cards only when content is genuinely distinct. Never nest cards. Shadows stay subtle — if you clearly see it, it's too strong.`,
};
