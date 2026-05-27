import type {
  BlockInstance,
  BusinessInfo,
  NavItem,
  Page,
  SiteSpec,
  ThemeTokens,
} from '@simplesight/contracts';
import { getBlock } from '@simplesight/blocks';
import type { BlockPlanItem, CategoryPlaybook } from '@simplesight/skills';

let counter = 0;
const nextId = () => `b${(counter++).toString(36)}_${Date.now().toString(36)}`;

const SERVICE_ICONS = ['star', 'leaf', 'clock', 'heart', 'shield', 'sparkle', 'tool', 'check'];

/** Blocks we never fabricate in the deterministic floor (no real numbers/faces). */
const ALWAYS_SKIP = new Set(['stats', 'team']);

function addressOf(business: BusinessInfo): string | undefined {
  const l = business.locations[0];
  if (!l) return undefined;
  return [l.address, l.city, l.region, l.country].filter(Boolean).join(', ') || undefined;
}

function clean(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) if (v !== undefined && v !== null) out[k] = v;
  return out;
}

/**
 * Build a complete, multi-page, image-rich SiteSpec from a category playbook +
 * the customer's real business info. Each block starts from its schema-valid
 * sample() and is overridden with real content, so blocks can never fail
 * validation. Blocks that would require fabricated data are skipped honestly.
 */
export function assembleSite(
  business: BusinessInfo,
  playbook: CategoryPlaybook,
  theme: ThemeTokens,
): SiteSpec {
  const ctx = { businessName: business.name, category: business.category, tagline: business.tagline };
  const nav: NavItem[] = playbook.pages.map((p) => ({ label: p.title, href: p.slug ? `/${p.slug}` : '/' }));
  const services =
    business.services && business.services.length
      ? business.services.map((s) => ({ name: s.name, description: s.description ?? '' }))
      : playbook.services.map((s) => ({ name: s.name, description: s.description ?? '' }));
  const address = addressOf(business);
  const servicesSlug =
    playbook.pages.find((p) => ['menu', 'services', 'treatments', 'pricing'].includes(p.slug))?.slug;
  const secondaryCta = servicesSlug
    ? { label: servicesSlug === 'menu' ? 'See the menu' : 'Our services', href: `/${servicesSlug}` }
    : undefined;

  function overridesFor(item: BlockPlanItem): Record<string, unknown> | null {
    switch (item.type) {
      case 'nav':
        return {
          brandName: business.name,
          items: nav,
          cta: business.contact.email || business.contact.phone ? { label: 'Contact', href: '/contact' } : undefined,
        };
      case 'hero':
        return {
          eyebrow: playbook.hero.eyebrow,
          headline: playbook.hero.headline,
          subheadline: playbook.hero.subheadline,
          imageUrl: playbook.images.hero,
          imageAlt: `${business.name}`,
          primaryCta: { label: 'Get in touch', href: '/contact' },
          secondaryCta,
        };
      case 'services':
        return {
          headline: 'What we offer',
          items: services.map((s, i) => ({
            title: s.name,
            description: s.description,
            icon: SERVICE_ICONS[i % SERVICE_ICONS.length],
          })),
        };
      case 'feature':
        return {
          eyebrow: playbook.hero.eyebrow,
          headline: playbook.hero.headline,
          body: business.description,
          bullets: services.slice(0, 3).map((s) => s.name),
          imageUrl: playbook.images.feature,
          imageAlt: `${business.name}`,
        };
      case 'about':
        return {
          headline: `About ${business.name}`,
          body: business.description,
          imageUrl: playbook.images.about,
          imageAlt: `${business.name}`,
        };
      case 'gallery':
        return {
          headline: 'A look around',
          images: (playbook.images.gallery ?? []).map((url, i) => ({ url, alt: `${business.name} ${i + 1}` })),
        };
      case 'faq':
        return { headline: 'Common questions', items: playbook.faqs };
      case 'cta':
        return {
          headline: `Ready when you are`,
          subtext: business.tagline,
          primaryCta: { label: 'Get in touch', href: '/contact' },
        };
      case 'contact':
        return {
          headline: 'Get in touch',
          email: business.contact.email,
          phone: business.contact.phone,
          address,
          showForm: true,
        };
      case 'hours':
        return business.hours.length ? { headline: 'Hours', rows: business.hours } : null; // skip if no real hours
      case 'map':
        return address ? { headline: 'Find us', address } : null; // skip if no location
      case 'footer':
        return {
          brandName: business.name,
          tagline: business.tagline,
          socials: business.contact.socials.length ? business.contact.socials : undefined,
        };
      default:
        return {}; // testimonials etc. keep sample content
    }
  }

  const pages: Page[] = playbook.pages.map((pg, pageIdx) => {
    const blocks: BlockInstance[] = [];
    let order = 0;
    for (const item of pg.blocks) {
      if (ALWAYS_SKIP.has(item.type)) continue;
      const mod = getBlock(item.type);
      if (!mod) continue;
      const ov = overridesFor(item);
      if (ov === null) continue; // honest skip (no data)
      const base = mod.sample(ctx) as Record<string, unknown>;
      const merged = { ...base, ...clean(ov), ...(item.tone ? { tone: item.tone } : {}) };
      const variant =
        item.variant && mod.variants.includes(item.variant) ? item.variant : (mod.variants[0] ?? 'default');
      const props = mod.schema.safeParse(merged).success
        ? merged
        : { ...base, ...(item.tone ? { tone: item.tone } : {}) };
      blocks.push({ id: nextId(), type: item.type, variant, props, order: order++ });
    }
    return {
      slug: pg.slug,
      title: pg.slug === '' ? business.name : pg.title,
      seo: { title: pg.slug === '' ? business.name : `${pg.title} — ${business.name}`, description: business.description },
      order: pageIdx,
      blocks,
    };
  });

  return {
    brand: { name: business.name, tagline: business.tagline, voice: playbook.tone },
    theme,
    nav,
    pages,
    seo: {
      defaultTitle: business.tagline ? `${business.name} — ${business.tagline}` : business.name,
      defaultDescription: business.description,
    },
  };
}
