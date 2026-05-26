import type {
  BlockInstance,
  BlockType,
  BusinessInfo,
  NavItem,
  SiteSpec,
  ThemeTokens,
} from '@simplesight/contracts';
import { defaultTheme } from '@simplesight/theme';
import { getBlock } from './registry';
import type { BlockSampleContext } from './types';

let counter = 0;
const nextId = () => `b${(counter++).toString(36)}_${Date.now().toString(36)}`;

/**
 * Build a deterministic, always-valid single-page site from business info. This
 * is pipeline stage 0 (the baseline floor) and the renderer's offline demo: it
 * guarantees a complete, professional site exists before any agent runs. Later
 * stages enhance these blocks; they never start from nothing.
 */
export function buildBaseline(business: BusinessInfo, theme: ThemeTokens = defaultTheme): SiteSpec {
  const ctx: BlockSampleContext = {
    businessName: business.name,
    category: business.category,
    tagline: business.tagline,
  };

  // Block ordering for a clean informational home page. Only blocks present in
  // the registry are emitted; each is filled from its own sample(), then key
  // blocks are overridden with real business data.
  const plan: { type: BlockType; variant?: string; override?: Record<string, unknown> }[] = [
    {
      type: 'nav',
      override: {
        brandName: business.name,
        items: navItems(business),
        cta: business.contact.email ? { label: 'Contact', href: '#contact' } : undefined,
      },
    },
    { type: 'hero' },
    {
      type: 'services',
      variant: 'grid',
      override: business.services.length
        ? {
            headline: 'What we do',
            items: business.services.map((s) => ({
              title: s.name,
              description: s.description ?? '',
            })),
          }
        : undefined,
    },
    { type: 'feature' },
    {
      type: 'about',
      override: business.description ? { headline: `About ${business.name}`, body: business.description } : undefined,
    },
    { type: 'stats' },
    { type: 'testimonials', variant: 'grid' },
    ...(business.hours.length
      ? [{ type: 'hours' as BlockType, override: { headline: 'Hours', rows: business.hours } }]
      : []),
    { type: 'faq' },
    { type: 'cta' },
    {
      type: 'contact',
      override: {
        headline: 'Get in touch',
        email: business.contact.email,
        phone: business.contact.phone,
        address: addressLine(business),
        showForm: true,
      },
    },
    {
      type: 'footer',
      override: {
        brandName: business.name,
        tagline: business.tagline,
        socials: business.contact.socials,
      },
    },
  ];

  const blocks: BlockInstance[] = [];
  let order = 0;
  for (const item of plan) {
    const mod = getBlock(item.type);
    if (!mod) continue;
    const variant = item.variant && mod.variants.includes(item.variant) ? item.variant : 'default';
    const sampleProps = mod.sample(ctx) as Record<string, unknown>;
    const props = { ...sampleProps, ...cleanUndefined(item.override ?? {}) };
    // Guarantee validity: if the override broke the schema, fall back to sample.
    const safe = mod.schema.safeParse(props).success ? props : sampleProps;
    blocks.push({ id: nextId(), type: item.type, variant, props: safe, order: order++ });
  }

  return {
    brand: { name: business.name, tagline: business.tagline, voice: business.audience },
    theme,
    nav: navItems(business),
    pages: [{ slug: '', title: business.name, order: 0, blocks }],
    seo: {
      defaultTitle: business.tagline ? `${business.name} — ${business.tagline}` : business.name,
      defaultDescription: business.description,
    },
  };
}

function navItems(business: BusinessInfo): NavItem[] {
  const items: NavItem[] = [
    { label: 'Home', href: '#top' },
    { label: 'Services', href: '#services' },
    { label: 'About', href: '#about' },
  ];
  if (business.contact.email || business.contact.phone) {
    items.push({ label: 'Contact', href: '#contact' });
  }
  return items;
}

function addressLine(business: BusinessInfo): string | undefined {
  const loc = business.locations[0];
  if (!loc) return undefined;
  return [loc.address, loc.city, loc.region, loc.country].filter(Boolean).join(', ') || undefined;
}

function cleanUndefined(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) if (v !== undefined) out[k] = v;
  return out;
}
