import type { ThemeTokens } from '@simplesight/contracts';

export { presets, defaultTheme, pickPreset, pickPresetForCategory, presetByFamily } from './presets';

/**
 * Convert design tokens into a flat map of CSS custom properties. The renderer
 * spreads these onto a wrapper element's `style`, and every block reads them via
 * `var(--ss-*)`. This is how one renderer draws infinitely many distinct looks.
 */
export function tokensToCssVars(t: ThemeTokens): Record<string, string> {
  const vars: Record<string, string> = {
    '--ss-bg': t.palette.background,
    '--ss-fg': t.palette.foreground,
    '--ss-primary': t.palette.primary,
    '--ss-primary-fg': t.palette.primaryForeground,
    '--ss-accent': t.palette.accent,
    '--ss-muted': t.palette.muted,
    '--ss-muted-fg': t.palette.mutedForeground,
    '--ss-border': t.palette.border,
    '--ss-card': t.palette.card,
    '--ss-card-fg': t.palette.cardForeground,
    // Raw copies that tone overrides never touch (used as section backgrounds
    // so an inverted section can remap --ss-* without recoloring its own bg).
    '--ss-primary-raw': t.palette.primary,
    '--ss-primary-fg-raw': t.palette.primaryForeground,
    '--ss-muted-raw': t.palette.muted,

    '--ss-font-heading': t.typography.headingFamily,
    '--ss-font-body': t.typography.bodyFamily,
    '--ss-text-base': `${t.typography.baseSizePx}px`,
    '--ss-weight-heading': String(t.typography.headingWeight),
    '--ss-weight-body': String(t.typography.bodyWeight),

    '--ss-unit': `${t.spacing.unitPx}px`,
    '--ss-section-py': `${t.spacing.sectionPaddingY}px`,
    '--ss-content-max': `${t.spacing.contentMaxWidthPx}px`,

    '--ss-radius-sm': `${t.radius.smPx}px`,
    '--ss-radius-md': `${t.radius.mdPx}px`,
    '--ss-radius-lg': `${t.radius.lgPx}px`,

    // Soft shadows for card depth (tuned to feel premium, not heavy).
    '--ss-shadow-sm': '0 1px 2px rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.06)',
    '--ss-shadow-md': '0 4px 12px rgba(15,23,42,0.06), 0 2px 4px rgba(15,23,42,0.05)',
    '--ss-shadow-lg': '0 12px 32px rgba(15,23,42,0.10), 0 4px 8px rgba(15,23,42,0.06)',
  };

  // Modular type scale derived from base size + ratio.
  const { baseSizePx, scaleRatio } = t.typography;
  vars['--ss-text-sm'] = `${(baseSizePx / scaleRatio).toFixed(2)}px`;
  vars['--ss-text-lg'] = `${(baseSizePx * scaleRatio).toFixed(2)}px`;
  vars['--ss-text-xl'] = `${(baseSizePx * scaleRatio ** 2).toFixed(2)}px`;
  vars['--ss-text-2xl'] = `${(baseSizePx * scaleRatio ** 3).toFixed(2)}px`;
  vars['--ss-text-3xl'] = `${(baseSizePx * scaleRatio ** 4).toFixed(2)}px`;
  vars['--ss-text-4xl'] = `${(baseSizePx * scaleRatio ** 5).toFixed(2)}px`;
  // Display tier for hero headlines — visibly larger than section headings.
  vars['--ss-text-5xl'] = `${(baseSizePx * scaleRatio ** 6).toFixed(2)}px`;
  vars['--ss-text-6xl'] = `${(baseSizePx * scaleRatio ** 7).toFixed(2)}px`;

  // Signature gradients (premium look). Fall back to a primary→accent wash.
  vars['--ss-grad-hero'] =
    t.gradient?.hero ?? `radial-gradient(ellipse 80% 60% at 70% 30%, ${t.palette.primary}14, transparent 70%)`;
  vars['--ss-grad-signature'] =
    t.gradient?.signature ?? `linear-gradient(105deg in oklch, ${t.palette.accent}, ${t.palette.primary})`;

  return vars;
}

/** Relative luminance of a hex color (WCAG). Used by the Theme-Critic. */
export function luminance(hex: string): number {
  const h = hex.replace('#', '');
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;
  const r = Number.parseInt(full.slice(0, 2), 16) / 255;
  const g = Number.parseInt(full.slice(2, 4), 16) / 255;
  const b = Number.parseInt(full.slice(4, 6), 16) / 255;
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** WCAG contrast ratio between two hex colors (1–21). */
export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}
