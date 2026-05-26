import type { ThemeTokens } from '@simplesight/contracts';

/**
 * Named starting-point themes. The deterministic baseline (pipeline stage 0)
 * picks one of these so a site always has a valid, professional theme; the
 * Theme-Designer agent then refines it from the customer's intake.
 */
export const presets: Record<string, ThemeTokens> = {
  slate: {
    palette: {
      background: '#ffffff',
      foreground: '#0f172a',
      primary: '#1e293b',
      primaryForeground: '#ffffff',
      accent: '#2563eb',
      muted: '#f1f5f9',
      mutedForeground: '#475569',
      border: '#e2e8f0',
      card: '#ffffff',
      cardForeground: '#0f172a',
    },
    typography: {
      headingFamily: "'Georgia', 'Times New Roman', serif",
      bodyFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
      baseSizePx: 17,
      scaleRatio: 1.25,
      headingWeight: 700,
      bodyWeight: 400,
    },
    spacing: { unitPx: 8, sectionPaddingY: 88, contentMaxWidthPx: 1120 },
    radius: { smPx: 6, mdPx: 10, lgPx: 18 },
    density: 'comfortable',
    mood: 'classic',
  },
  warmth: {
    palette: {
      background: '#fffaf5',
      foreground: '#2b2018',
      primary: '#b4541e',
      primaryForeground: '#ffffff',
      accent: '#e08e45',
      muted: '#f6ece2',
      mutedForeground: '#6b5a4c',
      border: '#ecdccb',
      card: '#ffffff',
      cardForeground: '#2b2018',
    },
    typography: {
      headingFamily: "'Poppins', system-ui, sans-serif",
      bodyFamily: "system-ui, -apple-system, sans-serif",
      baseSizePx: 17,
      scaleRatio: 1.22,
      headingWeight: 600,
      bodyWeight: 400,
    },
    spacing: { unitPx: 8, sectionPaddingY: 96, contentMaxWidthPx: 1080 },
    radius: { smPx: 8, mdPx: 14, lgPx: 24 },
    density: 'airy',
    mood: 'warm',
  },
  ink: {
    palette: {
      background: '#0b0b0f',
      foreground: '#f5f5f7',
      primary: '#ffffff',
      primaryForeground: '#0b0b0f',
      accent: '#7c5cff',
      muted: '#16161c',
      mutedForeground: '#a1a1aa',
      border: '#26262e',
      card: '#131319',
      cardForeground: '#f5f5f7',
    },
    typography: {
      headingFamily: "'Inter', system-ui, sans-serif",
      bodyFamily: "'Inter', system-ui, sans-serif",
      baseSizePx: 16,
      scaleRatio: 1.28,
      headingWeight: 700,
      bodyWeight: 400,
    },
    spacing: { unitPx: 8, sectionPaddingY: 104, contentMaxWidthPx: 1100 },
    radius: { smPx: 6, mdPx: 12, lgPx: 20 },
    density: 'comfortable',
    mood: 'modern',
  },
};

export const defaultTheme: ThemeTokens = presets.slate as ThemeTokens;

/** Pick a sensible preset for a business category / requested mood. */
export function pickPreset(mood?: string): ThemeTokens {
  if (mood && presets[mood]) return presets[mood] as ThemeTokens;
  switch (mood) {
    case 'warm':
    case 'playful':
      return presets.warmth as ThemeTokens;
    case 'bold':
    case 'modern':
      return presets.ink as ThemeTokens;
    default:
      return presets.slate as ThemeTokens;
  }
}
