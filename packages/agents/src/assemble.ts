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
import type { ContentBundle } from './content';

let counter = 0;
const nextId = () => `b${(counter++).toString(36)}_${Date.now().toString(36)}`;

const SERVICE_ICONS = ['star', 'leaf', 'clock', 'heart', 'shield', 'sparkle', 'tool', 'check'];

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

/** Wrap the emphasis substring in *…* so the hero gradient-clips it. */
function markEmphasis(headline: string, emphasis?: string): string {
  if (emphasis && headline.includes(emphasis)) return headline.replace(emphasis, `*${emphasis}*`);
  return headline;
}

/**
 * Build a complete, multi-page, image-rich SiteSpec from a category playbook +
 * the customer's business info. When an AI `content` bundle is supplied, blocks
 * are filled with that rich content (incl. real testimonials/stats); otherwise
 * the deterministic floor (playbook samples, honest skips) is used.
 */
export function assembleSite(
  business: BusinessInfo,
  playbook: CategoryPlaybook,
  theme: ThemeTokens,
  content?: ContentBundle,
): SiteSpec {
  const ctx = { businessName: business.name, category: business.category, tagline: business.tagline };
  const nav: NavItem[] = playbook.pages.map((p) => ({ label: p.title, href: p.slug ? `/${p.slug}` : '/' }));
  const services =
    content?.services.items.map((s) => ({ name: s.name, description: s.description })) ??
    (business.services?.length
      ? business.services.map((s) => ({ name: s.name, description: s.description ?? '' }))
      : playbook.services.map((s) => ({ name: s.name, description: s.description ?? '' })));
  const address = addressOf(business);
  const servicesSlug = playbook.pages.find((p) =>
    ['menu', 'services', 'treatments', 'pricing', 'product'].includes(p.slug),
  )?.slug;

  // With AI content we can honestly fill stats/testimonials; without, skip them.
  const skip = new Set<string>(content ? ['team'] : ['stats', 'team']);

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
          eyebrow: content?.hero.eyebrow ?? playbook.hero.eyebrow,
          headline: content ? markEmphasis(content.hero.headline, content.hero.emphasis) : playbook.hero.headline,
          subheadline: content?.hero.subheadline ?? playbook.hero.subheadline,
          imageUrl: playbook.images.hero,
          imageAlt: business.name,
          primaryCta: { label: content?.hero.primaryCta ?? 'Get in touch', href: '/contact' },
          secondaryCta: servicesSlug
            ? { label: content?.hero.secondaryCta ?? 'Our services', href: `/${servicesSlug}` }
            : undefined,
        };
      case 'services':
        return {
          headline: content?.services.headline ?? 'What we offer',
          intro: content?.services.intro,
          items: services.map((s, i) => ({
            title: s.name,
            description: s.description,
            icon: SERVICE_ICONS[i % SERVICE_ICONS.length],
          })),
        };
      case 'feature':
        return content
          ? {
              eyebrow: content.feature.eyebrow,
              headline: content.feature.headline,
              body: content.feature.body,
              bullets: content.feature.bullets,
              imageUrl: playbook.images.feature,
              imageAlt: business.name,
            }
          : {
              eyebrow: playbook.hero.eyebrow,
              headline: playbook.hero.headline,
              body: business.description,
              bullets: services.slice(0, 3).map((s) => s.name),
              imageUrl: playbook.images.feature,
              imageAlt: business.name,
            };
      case 'about':
        return {
          headline: content?.about.headline ?? `About ${business.name}`,
          body: content?.about.paragraphs ?? business.description,
          imageUrl: playbook.images.about,
          imageAlt: business.name,
        };
      case 'gallery':
        return {
          headline: 'A look around',
          images: (playbook.images.gallery ?? []).map((url, i) => ({ url, alt: `${business.name} ${i + 1}` })),
        };
      case 'faq':
        return { headline: 'Common questions', items: content?.faqs ?? playbook.faqs };
      case 'testimonials':
        return content ? { headline: 'What clients say', items: content.testimonials } : {};
      case 'stats':
        return content ? { items: content.stats } : null;
      case 'cta':
        return {
          headline: content?.cta.headline ?? 'Ready when you are',
          subtext: content?.cta.subtext ?? business.tagline,
          primaryCta: { label: content?.hero.primaryCta ?? 'Get in touch', href: '/contact' },
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
        return business.hours.length ? { headline: 'Hours', rows: business.hours } : null;
      case 'map':
        return address ? { headline: 'Find us', address } : null;
      case 'footer':
        return {
          brandName: business.name,
          tagline: business.tagline,
          socials: business.contact.socials.length ? business.contact.socials : undefined,
        };
      default:
        return {};
    }
  }

  const pages: Page[] = playbook.pages.map((pg, pageIdx) => {
    const blocks: BlockInstance[] = [];
    let order = 0;
    for (const item of pg.blocks) {
      if (skip.has(item.type)) continue;
      const mod = getBlock(item.type);
      if (!mod) continue;
      const ov = overridesFor(item);
      if (ov === null) continue;
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
      seo: {
        title: pg.slug === '' ? (content?.seo.title ?? business.name) : `${pg.title} — ${business.name}`,
        description: content?.seo.description ?? business.description,
      },
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
      defaultTitle: content?.seo.title ?? (business.tagline ? `${business.name} — ${business.tagline}` : business.name),
      defaultDescription: content?.seo.description ?? business.description,
    },
  };
}
