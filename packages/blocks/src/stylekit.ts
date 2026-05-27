import type { CSSProperties } from 'react';

/**
 * Shared style tokens for blocks. Everything resolves to a theme CSS variable so
 * a single tenant theme drives the whole site. Blocks compose these instead of
 * hand-writing var() strings, keeping the look coherent across the library.
 */
export const t = {
  bg: 'var(--ss-bg)',
  fg: 'var(--ss-fg)',
  primary: 'var(--ss-primary)',
  primaryFg: 'var(--ss-primary-fg)',
  accent: 'var(--ss-accent)',
  muted: 'var(--ss-muted)',
  mutedFg: 'var(--ss-muted-fg)',
  border: 'var(--ss-border)',
  card: 'var(--ss-card)',
  cardFg: 'var(--ss-card-fg)',
  fontHeading: 'var(--ss-font-heading)',
  fontBody: 'var(--ss-font-body)',
  weightHeading: 'var(--ss-weight-heading)',
  weightBody: 'var(--ss-weight-body)',
  radiusSm: 'var(--ss-radius-sm)',
  radiusMd: 'var(--ss-radius-md)',
  radiusLg: 'var(--ss-radius-lg)',
  sectionPy: 'var(--ss-section-py)',
  contentMax: 'var(--ss-content-max)',
  textSm: 'var(--ss-text-sm)',
  text: 'var(--ss-text-base)',
  textLg: 'var(--ss-text-lg)',
  textXl: 'var(--ss-text-xl)',
  text2xl: 'var(--ss-text-2xl)',
  text3xl: 'var(--ss-text-3xl)',
  text4xl: 'var(--ss-text-4xl)',
  text5xl: 'var(--ss-text-5xl)',
  text6xl: 'var(--ss-text-6xl)',
  shadowSm: 'var(--ss-shadow-sm)',
  shadowMd: 'var(--ss-shadow-md)',
  shadowLg: 'var(--ss-shadow-lg)',
} as const;

export type SectionTone = 'default' | 'muted' | 'inverted';

/**
 * Background/foreground for a section tone. Alternating tones down a page give
 * visual rhythm instead of one flat white column. `inverted` is a dark band.
 */
export function toneStyle(tone: SectionTone = 'default'): CSSProperties {
  switch (tone) {
    case 'muted':
      return { background: t.muted, color: t.fg };
    case 'inverted':
      return { background: t.primary, color: t.primaryFg };
    default:
      return { background: t.bg, color: t.fg };
  }
}

/** A centered content container respecting the theme's max width. */
export function container(extra?: CSSProperties): CSSProperties {
  return {
    width: '100%',
    maxWidth: t.contentMax,
    marginInline: 'auto',
    paddingInline: 'clamp(20px, 5vw, 48px)',
    ...extra,
  };
}

/** Standard vertical section padding. Pass a tone for alternating backgrounds. */
export function section(toneOrExtra?: SectionTone | CSSProperties, extra?: CSSProperties): CSSProperties {
  const isTone = typeof toneOrExtra === 'string';
  const toneCss = isTone ? toneStyle(toneOrExtra) : {};
  const extraCss = isTone ? extra : (toneOrExtra ?? {});
  return {
    paddingBlock: t.sectionPy,
    ...toneCss,
    ...extraCss,
  };
}

/** Soft card surface with border + shadow for depth. */
export function card(extra?: CSSProperties): CSSProperties {
  return {
    background: t.card,
    color: t.cardFg,
    border: `1px solid ${t.border}`,
    borderRadius: t.radiusLg,
    boxShadow: t.shadowSm,
    ...extra,
  };
}

/** Display-tier heading for hero headlines (larger than section headings). */
export function display(extra?: CSSProperties): CSSProperties {
  return {
    fontFamily: t.fontHeading,
    fontWeight: t.weightHeading as unknown as number,
    fontSize: 'clamp(2.6rem, 6.2vw, var(--ss-text-6xl))',
    lineHeight: 0.96,
    letterSpacing: '-0.035em',
    textWrap: 'balance' as CSSProperties['textWrap'],
    margin: 0,
    ...extra,
  };
}

/**
 * Eyebrow/kicker base style. Pair with className="ss-eyebrow" (renderer global
 * CSS makes it mono + tracked). Color defaults to the brand primary.
 */
export function eyebrow(extra?: CSSProperties): CSSProperties {
  return {
    color: t.primary,
    fontWeight: 600,
    margin: 0,
    ...extra,
  };
}

/** Small status/badge pill (e.g. hero "Now booking" / live dot). */
export function chip(extra?: CSSProperties): CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 14px',
    borderRadius: 999,
    border: `1px solid ${t.border}`,
    background: t.card,
    color: t.mutedFg,
    fontFamily: t.fontBody,
    fontSize: t.textSm,
    fontWeight: 500,
    ...extra,
  };
}

export function heading(level: 1 | 2 | 3 = 2, extra?: CSSProperties): CSSProperties {
  const size = level === 1 ? t.text4xl : level === 2 ? t.text2xl : t.textXl;
  return {
    fontFamily: t.fontHeading,
    fontWeight: t.weightHeading as unknown as number,
    fontSize: size,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
    margin: 0,
    color: t.fg,
    ...extra,
  };
}

export function body(extra?: CSSProperties): CSSProperties {
  return {
    fontFamily: t.fontBody,
    fontWeight: t.weightBody as unknown as number,
    fontSize: t.text,
    lineHeight: 1.6,
    color: t.mutedFg,
    margin: 0,
    ...extra,
  };
}

export function button(kind: 'primary' | 'outline' = 'primary'): CSSProperties {
  const base: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '12px 22px',
    borderRadius: t.radiusMd,
    fontFamily: t.fontBody,
    fontWeight: 600,
    fontSize: t.text,
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'opacity .15s ease, background .15s ease',
  };
  if (kind === 'primary') {
    return { ...base, background: t.primary, color: t.primaryFg, border: `1px solid ${t.primary}` };
  }
  return { ...base, background: 'transparent', color: t.fg, border: `1px solid ${t.border}` };
}
