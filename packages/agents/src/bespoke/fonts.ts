/**
 * The vetted Google-Fonts whitelist. The brief agent may ONLY choose fonts from
 * here, and the brief validator snaps any off-list font to the nearest on-list
 * one — so a generated site never specs an unavailable face (the Bigshot
 * One / Söhne problem that forced a manual substitution on the Holdfast build).
 */
export type FontCategory = 'display-serif' | 'display-grotesk' | 'display-condensed' | 'sans' | 'serif-text' | 'mono';

export interface FontEntry {
  /** Display name as written in a brief, e.g. "Space Grotesk". */
  name: string;
  category: FontCategory;
  /** CSS font-family value incl. a sensible generic fallback. */
  family: string;
  /** The `family=...` query fragment for a Google Fonts css2 URL (valid as-is). */
  gf: string;
  /** True if it carries an italic axis suitable for an accent clause. */
  italic?: boolean;
}

export const FONT_WHITELIST: FontEntry[] = [
  // Display — serif / editorial
  { name: 'Fraunces', category: 'display-serif', family: "'Fraunces', serif", gf: 'Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700', italic: true },
  { name: 'Newsreader', category: 'display-serif', family: "'Newsreader', serif", gf: 'Newsreader:ital,opsz,wght@0,6..72,300..700;1,6..72,300..700', italic: true },
  { name: 'Playfair Display', category: 'display-serif', family: "'Playfair Display', serif", gf: 'Playfair+Display:ital,wght@0,400..900;1,400..700', italic: true },
  { name: 'Instrument Serif', category: 'display-serif', family: "'Instrument Serif', serif", gf: 'Instrument+Serif:ital@0;1', italic: true },
  { name: 'DM Serif Display', category: 'display-serif', family: "'DM Serif Display', serif", gf: 'DM+Serif+Display:ital@0;1', italic: true },
  // Display — grotesk / geometric
  { name: 'Space Grotesk', category: 'display-grotesk', family: "'Space Grotesk', sans-serif", gf: 'Space+Grotesk:wght@400;500;600;700' },
  { name: 'Bricolage Grotesque', category: 'display-grotesk', family: "'Bricolage Grotesque', sans-serif", gf: 'Bricolage+Grotesque:opsz,wght@10..48,300..800' },
  { name: 'Syne', category: 'display-grotesk', family: "'Syne', sans-serif", gf: 'Syne:wght@400;600;700;800' },
  { name: 'Sora', category: 'display-grotesk', family: "'Sora', sans-serif", gf: 'Sora:wght@300;400;500;600;700' },
  { name: 'Unbounded', category: 'display-grotesk', family: "'Unbounded', sans-serif", gf: 'Unbounded:wght@400;600;700;800' },
  { name: 'Clash Grotesk', category: 'display-grotesk', family: "'Space Grotesk', sans-serif", gf: 'Space+Grotesk:wght@400;500;600;700' }, // alias → Space Grotesk
  // Display — condensed / athletic
  { name: 'Anton', category: 'display-condensed', family: "'Anton', sans-serif", gf: 'Anton' },
  { name: 'Oswald', category: 'display-condensed', family: "'Oswald', sans-serif", gf: 'Oswald:wght@300;400;500;600;700' },
  { name: 'Bebas Neue', category: 'display-condensed', family: "'Bebas Neue', sans-serif", gf: 'Bebas+Neue' },
  { name: 'Big Shoulders Display', category: 'display-condensed', family: "'Big Shoulders Display', sans-serif", gf: 'Big+Shoulders+Display:wght@400;600;700;800' },
  { name: 'Archivo', category: 'display-condensed', family: "'Archivo', sans-serif", gf: 'Archivo:wght@400;500;600;700;800' },
  // Body — sans
  { name: 'Inter Tight', category: 'sans', family: "'Inter Tight', sans-serif", gf: 'Inter+Tight:wght@400;500;600;700' },
  { name: 'Manrope', category: 'sans', family: "'Manrope', sans-serif", gf: 'Manrope:wght@400;500;600;700;800' },
  { name: 'Hanken Grotesk', category: 'sans', family: "'Hanken Grotesk', sans-serif", gf: 'Hanken+Grotesk:wght@400;500;600;700' },
  { name: 'Figtree', category: 'sans', family: "'Figtree', sans-serif", gf: 'Figtree:wght@400;500;600;700' },
  { name: 'IBM Plex Sans', category: 'sans', family: "'IBM Plex Sans', sans-serif", gf: 'IBM+Plex+Sans:wght@400;500;600;700' },
  { name: 'Work Sans', category: 'sans', family: "'Work Sans', sans-serif", gf: 'Work+Sans:wght@400;500;600;700' },
  { name: 'Public Sans', category: 'sans', family: "'Public Sans', sans-serif", gf: 'Public+Sans:wght@400;500;600;700' },
  // Body — serif text
  { name: 'Spectral', category: 'serif-text', family: "'Spectral', serif", gf: 'Spectral:ital,wght@0,300;0,400;0,600;1,400', italic: true },
  { name: 'Lora', category: 'serif-text', family: "'Lora', serif", gf: 'Lora:ital,wght@0,400..700;1,400..600', italic: true },
  { name: 'Source Serif 4', category: 'serif-text', family: "'Source Serif 4', serif", gf: 'Source+Serif+4:ital,opsz,wght@0,8..60,400..600;1,8..60,400..600', italic: true },
  // Mono
  { name: 'JetBrains Mono', category: 'mono', family: "'JetBrains Mono', ui-monospace, monospace", gf: 'JetBrains+Mono:wght@400;500;700' },
  { name: 'IBM Plex Mono', category: 'mono', family: "'IBM Plex Mono', ui-monospace, monospace", gf: 'IBM+Plex+Mono:wght@400;500;600' },
  { name: 'Space Mono', category: 'mono', family: "'Space Mono', ui-monospace, monospace", gf: 'Space+Mono:wght@400;700' },
  { name: 'DM Mono', category: 'mono', family: "'DM Mono', ui-monospace, monospace", gf: 'DM+Mono:wght@400;500' },
];

const canon = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

/** Find a whitelist font whose name appears anywhere in a free-text string. */
export function findFontIn(text: string, categories?: FontCategory[]): FontEntry | undefined {
  const hay = canon(text);
  // Longest names first so "Playfair Display" wins over a hypothetical "Play".
  const pool = [...FONT_WHITELIST].sort((a, b) => b.name.length - a.name.length);
  return pool.find((f) => (!categories || categories.includes(f.category)) && hay.includes(canon(f.name)));
}

export function fontByName(name: string): FontEntry | undefined {
  const want = canon(name);
  return FONT_WHITELIST.find((f) => canon(f.name) === want);
}

/** The names + categories, formatted for injection into the brief agent's prompt. */
export function fontWhitelistForPrompt(): string {
  const byCat = (c: FontCategory) => FONT_WHITELIST.filter((f) => f.category === c && f.name !== 'Clash Grotesk').map((f) => f.name).join(', ');
  return [
    `DISPLAY (serif/editorial): ${byCat('display-serif')}`,
    `DISPLAY (grotesk): ${byCat('display-grotesk')}`,
    `DISPLAY (condensed/athletic): ${byCat('display-condensed')}`,
    `BODY (sans): ${byCat('sans')}`,
    `BODY (serif text): ${byCat('serif-text')}`,
    `MONO: ${byCat('mono')}`,
  ].join('\n');
}

/** Build a single Google Fonts css2 <link> href for a set of fonts (deduped). */
export function buildGoogleFontsHref(fonts: FontEntry[]): string {
  const seen = new Set<string>();
  const families = fonts
    .filter((f) => f && !seen.has(f.gf) && seen.add(f.gf))
    .map((f) => `family=${f.gf}`)
    .join('&');
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}
