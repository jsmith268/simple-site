import { z } from 'zod';

/* ──────────────────────────────────────────────────────────────────────────
 * Bespoke generation contracts — the data backbone for the replication pipeline
 * (onboarding → brief → IA → codegen → critic → deploy). DesignBrief itself
 * lives in @simplesight/agents (it's the art-direction artifact); everything
 * else that crosses package boundaries is defined here.
 * ────────────────────────────────────────────────────────────────────────── */

/** The reusable component *types* the catalog knows how to generate. The IA
 *  agent selects from these; the Foundation generator authors bespoke
 *  implementations of the ones a site uses. */
export const ComponentType = z.enum([
  'nav',
  'footer',
  'hero',
  'feature-grid',
  'stat-bento',
  'pricing-tiers',
  'schedule',
  'team-cards',
  'testimonials',
  'faq-accordion',
  'gallery',
  'social-feed', // Instagram-style embed
  'map', // location embed
  'lead-form', // contact / booking capture
  'cta-band',
  'marquee',
  'newsletter',
  'logo-cloud',
  'steps',
  'content-prose',
]);
export type ComponentType = z.infer<typeof ComponentType>;

/** Components that require client interactivity ('use client'). */
export const INTERACTIVE_COMPONENTS: ComponentType[] = ['nav', 'lead-form', 'faq-accordion', 'gallery', 'newsletter'];

export const EmbedFlags = z.object({
  instagram: z.boolean().default(false),
  map: z.boolean().default(false),
  leadForm: z.boolean().default(false),
  booking: z.boolean().default(false),
  reviews: z.boolean().default(false),
});
export type EmbedFlags = z.infer<typeof EmbedFlags>;

/* ── BusinessProfile — normalized onboarding ─────────────────────────────── */

export const GeoLocation = z.object({
  label: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  country: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});
export type GeoLocation = z.infer<typeof GeoLocation>;

export const BusinessProfile = z.object({
  name: z.string(),
  tagline: z.string().optional(),
  oneLiner: z.string(), // the elevator pitch
  category: z.string(), // e.g. "climbing gym", "wine bar"
  description: z.string(), // what they do, longer
  offerings: z.array(z.object({ name: z.string(), description: z.string().optional() })).default([]),
  audience: z.string().optional(),
  voice: z.object({
    adjectives: z.array(z.string()).default([]),
    notNotes: z.string().optional(), // "never bro-y", banned words
    notes: z.string().optional(),
  }),
  proof: z.object({
    stats: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
    awards: z.array(z.string()).default([]),
  }),
  primaryGoal: z.string(), // the #1 conversion → drives the main CTA
  /** Requested page names (Home is implied). */
  requestedPages: z.array(z.string()).default([]),
  /** Requested catalog components. */
  requestedComponents: z.array(ComponentType).default([]),
  embeds: EmbedFlags,
  locations: z.array(GeoLocation).default([]),
  hours: z.array(z.object({ days: z.string(), open: z.string(), close: z.string() })).default([]),
  contact: z.object({
    email: z.string().optional(),
    phone: z.string().optional(),
    socials: z.array(z.object({ platform: z.string(), handle: z.string().optional(), url: z.string() })).default([]),
  }),
  visual: z.object({
    moodWords: z.array(z.string()).default([]),
    colorNotes: z.string().optional(),
    appearance: z.enum(['light', 'dark', 'either']).default('either'),
    referenceUrls: z.array(z.string()).default([]),
    avoid: z.string().optional(),
  }),
  /** Customer-supplied brand assets (logo, photos). */
  brandAssets: z.array(z.object({ url: z.string(), kind: z.enum(['logo', 'photo']), alt: z.string().optional() })).default([]),
});
export type BusinessProfile = z.infer<typeof BusinessProfile>;

/* ── SiteIA — the information architecture (the central unlock) ──────────── */

export const IANavItem: z.ZodType<{
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}> = z.object({
  label: z.string(),
  href: z.string(),
  children: z.array(z.object({ label: z.string(), href: z.string() })).optional(),
});
export type IANavItem = z.infer<typeof IANavItem>;

export const SectionPlan = z.object({
  kind: z.string(), // semantic section name e.g. "hero", "pricing"
  narrative: z.string(), // the described composition the page generator implements
  components: z.array(ComponentType).default([]), // catalog components this section uses
  anchorId: z.string().optional(), // for nav deep-links
});
export type SectionPlan = z.infer<typeof SectionPlan>;

export const PagePlan = z.object({
  name: z.string(),
  slug: z.string(), // '/', '/climb', …
  role: z.string(), // why this page exists
  sections: z.array(SectionPlan).min(1),
});
export type PagePlan = z.infer<typeof PagePlan>;

export const SiteIA = z.object({
  pages: z.array(PagePlan).min(1),
  chrome: z.object({
    nav: z.object({
      items: z.array(IANavItem),
      cta: z.object({ label: z.string(), href: z.string() }).optional(),
    }),
    footer: z.object({
      columns: z.array(z.object({ heading: z.string(), links: z.array(z.object({ label: z.string(), href: z.string() })) })).default([]),
      showNewsletter: z.boolean().default(false),
    }),
  }),
  /** Catalog components generated once and shared across pages. */
  sharedComponents: z.array(ComponentType).default([]),
  embeds: EmbedFlags,
});
export type SiteIA = z.infer<typeof SiteIA>;

/* ── AssetManifest — verified imagery the generators may use ─────────────── */

export const ManifestImage = z.object({
  id: z.string(),
  role: z.string(), // 'hero', 'gallery', 'coach-portrait', 'feed', …
  url: z.string(),
  alt: z.string(),
  width: z.number().optional(),
  height: z.number().optional(),
  status: z.number().default(200), // last verified HTTP status
  source: z.enum(['unsplash', 'picsum', 'upload', 'generated']),
});
export type ManifestImage = z.infer<typeof ManifestImage>;

export const AssetManifest = z.object({
  images: z.array(ManifestImage).default([]),
});
export type AssetManifest = z.infer<typeof AssetManifest>;

/* ── Codegen / build / critic runtime types ──────────────────────────────── */

export const GeneratedFile = z.object({
  path: z.string(), // relative to app root, e.g. 'app/page.tsx'
  contents: z.string(),
  kind: z.enum(['tsx', 'css', 'config', 'other']).default('tsx'),
  client: z.boolean().default(false), // has 'use client'
});
export type GeneratedFile = z.infer<typeof GeneratedFile>;

export const BuildReport = z.object({
  ok: z.boolean(),
  attempts: z.number().default(1),
  errors: z.array(z.string()).default([]),
  durationMs: z.number().default(0),
  filesFixed: z.array(z.string()).default([]),
});
export type BuildReport = z.infer<typeof BuildReport>;

export const CriticFinding = z.object({
  severity: z.enum(['info', 'warn', 'block']),
  area: z.string(), // 'hierarchy', 'color', 'spacing', 'a11y', 'copy', 'signature-device'…
  message: z.string(),
  fix: z.string().optional(),
});
export type CriticFinding = z.infer<typeof CriticFinding>;

export const CriticReport = z.object({
  score: z.number().min(0).max(100),
  verdict: z.enum(['pass', 'revise', 'reject']),
  dimensions: z.record(z.number()).default({}), // per-axis 0-100
  findings: z.array(CriticFinding).default([]),
  summary: z.string().default(''),
});
export type CriticReport = z.infer<typeof CriticReport>;

/* ── BuildRun — the orchestrated, checkpointed run record ─────────────────── */

export const BuildStageName = z.enum([
  'profile',
  'brief',
  'ia',
  'assets',
  'scaffold',
  'foundation',
  'pages',
  'code_critic',
  'visual_critic',
  'deploy',
]);
export type BuildStageName = z.infer<typeof BuildStageName>;

export const BuildStage = z.object({
  name: BuildStageName,
  status: z.enum(['pending', 'running', 'completed', 'failed', 'skipped']),
  ms: z.number().default(0),
  costCents: z.number().default(0),
  attempts: z.number().default(0),
  note: z.string().optional(),
  artifactRef: z.string().optional(), // key into artifact store
});
export type BuildStage = z.infer<typeof BuildStage>;

export const BuildRun = z.object({
  id: z.string(),
  projectId: z.string(),
  slug: z.string(), // deploy slug / app dir name
  model: z.string(),
  status: z.enum(['running', 'succeeded', 'held_for_human', 'failed']),
  stages: z.array(BuildStage).default([]),
  costCents: z.number().default(0),
  costCeilingCents: z.number().optional(),
  escalation: z.string().optional(),
  previewUrl: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type BuildRun = z.infer<typeof BuildRun>;
