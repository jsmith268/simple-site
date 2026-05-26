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
} as const;

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

/** Standard vertical section padding. */
export function section(extra?: CSSProperties): CSSProperties {
  return {
    paddingBlock: t.sectionPy,
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
