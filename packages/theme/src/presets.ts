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
  sage: {
    palette: {
      background: '#f6faf7',
      foreground: '#1c2b24',
      primary: '#2f6f57',
      primaryForeground: '#ffffff',
      accent: '#7fb89c',
      muted: '#e8f1ec',
      mutedForeground: '#4a5d54',
      border: '#d6e5dd',
      card: '#ffffff',
      cardForeground: '#1c2b24',
    },
    typography: {
      headingFamily: "'Fraunces', Georgia, serif",
      bodyFamily: "'Nunito Sans', system-ui, sans-serif",
      baseSizePx: 17,
      scaleRatio: 1.24,
      headingWeight: 600,
      bodyWeight: 400,
    },
    spacing: { unitPx: 8, sectionPaddingY: 96, contentMaxWidthPx: 1100 },
    radius: { smPx: 8, mdPx: 14, lgPx: 22 },
    density: 'airy',
    mood: 'warm',
  },
  navy: {
    palette: {
      background: '#ffffff',
      foreground: '#0f1d33',
      primary: '#13294b',
      primaryForeground: '#ffffff',
      accent: '#b6892f',
      muted: '#eef2f7',
      mutedForeground: '#475569',
      border: '#dde4ee',
      card: '#ffffff',
      cardForeground: '#0f1d33',
    },
    typography: {
      headingFamily: "'Libre Baskerville', Georgia, serif",
      bodyFamily: "'Source Sans 3', system-ui, sans-serif",
      baseSizePx: 17,
      scaleRatio: 1.25,
      headingWeight: 700,
      bodyWeight: 400,
    },
    spacing: { unitPx: 8, sectionPaddingY: 88, contentMaxWidthPx: 1120 },
    radius: { smPx: 4, mdPx: 8, lgPx: 14 },
    density: 'comfortable',
    mood: 'classic',
  },
  clay: {
    palette: {
      background: '#fbf6f1',
      foreground: '#2c211a',
      primary: '#a9572f',
      primaryForeground: '#ffffff',
      accent: '#d99a6c',
      muted: '#f3e7dc',
      mutedForeground: '#6b574a',
      border: '#e8d8c9',
      card: '#ffffff',
      cardForeground: '#2c211a',
    },
    typography: {
      headingFamily: "'Poppins', system-ui, sans-serif",
      bodyFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
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
  stone: {
    palette: {
      background: '#fbfaf8',
      foreground: '#2a2724',
      primary: '#211d18',
      primaryForeground: '#ffffff',
      accent: '#a9823f',
      muted: '#f0ece5',
      mutedForeground: '#6b6258',
      border: '#e4ddd2',
      card: '#ffffff',
      cardForeground: '#2a2724',
    },
    typography: {
      headingFamily: "'Fraunces', Georgia, serif",
      bodyFamily: "'Source Sans 3', system-ui, sans-serif",
      baseSizePx: 17,
      scaleRatio: 1.27,
      headingWeight: 600,
      bodyWeight: 400,
    },
    spacing: { unitPx: 8, sectionPaddingY: 100, contentMaxWidthPx: 1200 },
    radius: { smPx: 2, mdPx: 6, lgPx: 12 },
    density: 'comfortable',
    mood: 'classic',
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

/** Resolve a preset by family key (what a playbook's paletteFamily holds). */
export function presetByFamily(family: string): ThemeTokens {
  return (presets[family] as ThemeTokens) ?? defaultTheme;
}

const CATEGORY_PALETTE: { kws: string[]; family: keyof typeof presets }[] = [
  { kws: ['bak', 'pastry', 'cake', 'cafe', 'coffee', 'restaurant', 'food', 'bistro', 'eatery', 'bar', 'brew'], family: 'warmth' },
  { kws: ['salon', 'spa', 'hair', 'beauty', 'nail', 'barber', 'shop', 'boutique', 'retail', 'craft', 'florist'], family: 'clay' },
  { kws: ['yoga', 'pilates', 'meditation', 'wellness studio'], family: 'sage' },
  { kws: ['dental', 'dentist', 'ortho', 'clinic', 'medical', 'doctor', 'health', 'wellness', 'therap', 'chiro', 'vet'], family: 'sage' },
  { kws: ['real estate', 'realty', 'realtor', 'property', 'properties', 'homes', 'broker'], family: 'stone' },
  { kws: ['law', 'legal', 'attorney', 'account', 'financ', 'consult', 'advis', 'insurance'], family: 'navy' },
  { kws: ['gym', 'fitness', 'train', 'crossfit', 'martial', 'dance'], family: 'ink' },
];

/** Category-aware preset selection (falls back to mood, then slate). */
export function pickPresetForCategory(category?: string, mood?: string): ThemeTokens {
  const c = (category ?? '').toLowerCase();
  for (const { kws, family } of CATEGORY_PALETTE) {
    if (kws.some((k) => c.includes(k))) return presets[family] as ThemeTokens;
  }
  return pickPreset(mood);
}
