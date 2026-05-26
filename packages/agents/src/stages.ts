import {
  BusinessInfo,
  type Critic,
  type CriticVerdict,
  type IntakeStyle,
  SiteSpec,
  ThemeTokens,
} from '@simplesight/contracts';
import { buildLlmCritic, defineAgent } from '@simplesight/engine';
import { contrastRatio, pickPreset } from '@simplesight/theme';

// ── Stage 1: Discovery — clean/enrich the business profile ──────────────────

export const discoveryAgent = defineAgent<BusinessInfo, BusinessInfo>({
  name: 'discovery',
  schema: BusinessInfo,
  system: () =>
    'You are a brand strategist. Clean up and lightly enrich this business profile for building an informational website. Keep all facts; improve clarity of description and service blurbs. Do not invent contact details.',
  prompt: (b) => `Business profile JSON:\n${JSON.stringify(b, null, 2)}`,
  offline: (b) => b,
});

export const discoveryCritic = buildLlmCritic<BusinessInfo>({
  name: 'discovery_critic',
  scoreFloor: 0.5,
  system: () => 'You assess whether a business profile is complete enough to build an informational site.',
  prompt: (b) => `Profile:\n${JSON.stringify(b)}\nReturn verdict/score/reasons/suggestions.`,
});

// ── Stage 2: Theme — design tokens (offline: a curated preset) ──────────────

export const themeAgent = defineAgent<{ business: BusinessInfo; style?: IntakeStyle }, ThemeTokens>({
  name: 'theme',
  schema: ThemeTokens,
  system: () =>
    'You are a brand designer. Produce a complete, accessible ThemeTokens object (WCAG AA contrast between background and foreground). Match the requested mood and the nature of the business.',
  prompt: ({ business, style }) =>
    `Business: ${business.name} (${business.category}). Mood: ${style?.mood ?? 'classic'}. Color preference: ${style?.colorPreference ?? 'none'}.`,
  offline: ({ style }) => pickPreset(style?.mood),
});

/** Deterministic WCAG gate — runs in every mode, not just live. */
export const themeCritic: Critic<ThemeTokens> = {
  name: 'theme_critic',
  scoreFloor: 0.5,
  async review(theme): Promise<CriticVerdict> {
    const ratio = contrastRatio(theme.palette.background, theme.palette.foreground);
    const pass = ratio >= 4.5;
    return {
      verdict: pass ? 'pass' : 'reject',
      score: pass ? 1 : 0,
      reasons: pass ? [] : [`background/foreground contrast ${ratio.toFixed(2)} is below WCAG AA (4.5)`],
      suggestions: pass ? [] : ['Darken the foreground or lighten the background.'],
      axes: { contrast: ratio },
      findings: [],
      floorViolations: pass ? [] : ['wcag_contrast'],
    };
  },
};

// ── Stage 4: Copy — polish block copy (offline: keep baseline copy) ─────────

export const copyAgent = defineAgent<SiteSpec, SiteSpec>({
  name: 'copy_editor',
  schema: SiteSpec,
  temperature: 0.6,
  system: () =>
    'You are a sharp B2B copy editor. Improve the wording of this site\'s block content: clear, human, specific. No em-dashes. No filler ("elevate", "unlock", "seamless"). Keep the structure and all keys identical; only improve text values.',
  prompt: (site) => `Site spec JSON:\n${JSON.stringify(site)}`,
  offline: (site) => site,
});

// ── Stage 5: SEO — titles, descriptions, per-page metadata (deterministic) ──

export const seoAgent = defineAgent<{ site: SiteSpec; business: BusinessInfo }, SiteSpec>({
  name: 'seo',
  schema: SiteSpec,
  system: () => 'You are an SEO editor. Add concise titles (30–60 chars) and meta descriptions (120–160 chars).',
  prompt: ({ site }) => `Site spec JSON:\n${JSON.stringify(site)}`,
  offline: ({ site, business }) => withSeo(site, business),
});

function clamp(s: string, max: number): string {
  return s.length <= max ? s : `${s.slice(0, max - 1).trimEnd()}…`;
}

function withSeo(site: SiteSpec, business: BusinessInfo): SiteSpec {
  const baseTitle = business.tagline ? `${business.name} — ${business.tagline}` : business.name;
  return {
    ...site,
    seo: {
      defaultTitle: clamp(baseTitle, 60),
      defaultDescription: clamp(business.description, 160),
    },
    pages: site.pages.map((p) => ({
      ...p,
      seo: {
        title: clamp(p.slug ? `${p.title} — ${business.name}` : baseTitle, 60),
        description: clamp(business.description, 160),
      },
    })),
  };
}
