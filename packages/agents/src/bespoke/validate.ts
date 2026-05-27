import type { DesignBrief } from './brief';
import {
  buildGoogleFontsHref,
  type FontEntry,
  fontByName,
  findFontIn,
} from './fonts';

/** Relative luminance + WCAG contrast (hex), inlined to avoid a theme dep. */
function luminance(hex: string): number {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const ch = (i: number) => Number.parseInt(full.slice(i, i + 2) || '0', 16) / 255;
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(ch(0)) + 0.7152 * lin(ch(2)) + 0.0722 * lin(ch(4));
}
export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

export interface ResolvedFonts {
  display: FontEntry;
  accent: FontEntry; // italic serif for the one accent clause per headline
  body: FontEntry;
  mono: FontEntry;
}

export interface ResolvedDesign {
  fonts: ResolvedFonts;
  /** CSS family strings keyed for --font-* vars. */
  fontVars: { display: string; accent: string; body: string; mono: string };
  googleFontsHref: string;
  /** Palette, possibly with foreground nudged to clear AA against the background. */
  palette: DesignBrief['palette'];
  warnings: string[];
}

const DEFAULTS = {
  display: 'Space Grotesk',
  accent: 'Fraunces',
  body: 'Inter Tight',
  mono: 'JetBrains Mono',
};

/**
 * Resolve a brief's free-text font picks to real whitelist fonts, build the
 * Google Fonts href, and validate/repair the palette for WCAG AA. Returns the
 * concrete design tokens the generators consume — no more guessing.
 */
export function validateDesignBrief(brief: DesignBrief): ResolvedDesign {
  const warnings: string[] = [];
  const text = `${brief.fonts.display} ${brief.fonts.body} ${brief.fonts.pairingNote}`;

  const pick = (
    found: FontEntry | undefined,
    fallbackName: string,
    role: string,
  ): FontEntry => {
    if (found) return found;
    warnings.push(`font: no whitelisted ${role} face found in brief ("${brief.fonts[role === 'body' ? 'body' : 'display']}"); using ${fallbackName}`);
    return fontByName(fallbackName) as FontEntry;
  };

  const display = pick(
    findFontIn(text, ['display-serif', 'display-grotesk', 'display-condensed']),
    DEFAULTS.display,
    'display',
  );
  const accent = pick(
    FONT_ITALIC(findFontIn(text, ['display-serif', 'serif-text'])),
    DEFAULTS.accent,
    'accent',
  );
  let body = findFontIn(text, ['sans', 'serif-text']) ?? (fontByName(DEFAULTS.body) as FontEntry);
  // Don't let body == display (keeps a real pairing).
  if (body.name === display.name) {
    body = fontByName(DEFAULTS.body) as FontEntry;
    if (body.name === display.name) body = fontByName('Manrope') as FontEntry;
  }
  const mono = findFontIn(text, ['mono']) ?? (fontByName(DEFAULTS.mono) as FontEntry);

  const fonts: ResolvedFonts = { display, accent, body, mono };
  const googleFontsHref = buildGoogleFontsHref([display, accent, body, mono]);

  // Palette WCAG: body text (foreground on background) must clear AA (4.5:1).
  const palette = { ...brief.palette };
  const ratio = contrastRatio(palette.background, palette.foreground);
  if (ratio < 4.5) {
    const toWhite = contrastRatio(palette.background, '#F7F5F0');
    const toBlack = contrastRatio(palette.background, '#14110F');
    const repaired = toBlack >= toWhite ? '#14110F' : '#F7F5F0';
    warnings.push(`palette: foreground/background contrast ${ratio.toFixed(2)} < 4.5 AA; nudged foreground ${palette.foreground} → ${repaired}`);
    palette.foreground = repaired;
  }

  return {
    fonts,
    fontVars: { display: display.family, accent: accent.family, body: body.family, mono: mono.family },
    googleFontsHref,
    palette,
    warnings,
  };
}

/** Prefer an italic-capable face for the accent role; else undefined to fall back. */
function FONT_ITALIC(f: FontEntry | undefined): FontEntry | undefined {
  return f && f.italic ? f : undefined;
}
