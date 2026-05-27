import { type ComponentType, SiteCapabilities } from '@simplesight/contracts';

/* Capability gates: an operator-controlled allowlist over what a generated site
 * may contain. Newsletter / e-commerce / booking default OFF and can be enabled
 * later. Enforced in the IA prompt + gate and the foundation/page prompts. */

export const DEFAULT_CAPABILITIES: SiteCapabilities = SiteCapabilities.parse({});

/** Merge operator overrides onto the defaults (operator/plan governs, not the pitch). */
export function resolveCapabilities(overrides?: Partial<SiteCapabilities>): SiteCapabilities {
  return SiteCapabilities.parse({ ...DEFAULT_CAPABILITIES, ...(overrides ?? {}) });
}

/** Catalog component types forbidden by the current capabilities. */
export function forbiddenComponents(caps: SiteCapabilities = DEFAULT_CAPABILITIES): ComponentType[] {
  const out: ComponentType[] = [];
  if (!caps.newsletter) out.push('newsletter');
  if (!caps.socialFeed) out.push('social-feed');
  if (!caps.map) out.push('map');
  if (!caps.pricingDisplay) out.push('pricing-tiers');
  // e-commerce/booking are enforced via copy rules (no dedicated catalog component).
  return out;
}

/** The component types a site MAY use, given its capabilities. */
export function allowedComponents(caps: SiteCapabilities = DEFAULT_CAPABILITIES): ComponentType[] {
  const forbidden = new Set(forbiddenComponents(caps));
  return (
    [
      'nav', 'footer', 'hero', 'feature-grid', 'stat-bento', 'pricing-tiers', 'schedule', 'team-cards',
      'testimonials', 'faq-accordion', 'gallery', 'social-feed', 'map', 'lead-form', 'cta-band', 'marquee',
      'newsletter', 'logo-cloud', 'steps', 'content-prose',
    ] as ComponentType[]
  ).filter((t) => !forbidden.has(t));
}

/** Hard-constraint rules block injected into IA + foundation + page prompts. */
export function capabilityRules(caps: SiteCapabilities = DEFAULT_CAPABILITIES): string {
  const lines: string[] = [
    'CAPABILITY GATES — this is an INFORMATIONAL website. Honor these HARD constraints:',
    caps.newsletter
      ? '- Newsletter: allowed.'
      : '- Newsletter: DISABLED — do NOT include any newsletter signup, "Subscribe", or marketing email-capture UI anywhere (header, footer, or sections). A contact/inquiry lead form is fine.',
    caps.ecommerce
      ? '- E-commerce: allowed.'
      : '- E-commerce: DISABLED — NO online store, cart, checkout, "Buy now", "Add to cart", "Shop online", prices-as-purchase, or any transaction flow. Products/menu items may be shown for INFORMATION only; calls-to-action must be "Visit", "Order in person", "Inquire", "Contact", or "Get directions" — never a purchase.',
    caps.booking
      ? '- Booking: allowed.'
      : '- Booking/reservations: DISABLED — no reservation/booking engine or calendar; use a contact/inquiry form instead.',
    caps.pricingDisplay ? '- Pricing: prices MAY be displayed for information (no purchase).' : '- Pricing: do NOT display prices.',
    caps.blog ? '- Blog: allowed.' : '- Blog: no blog/articles/news section.',
  ];
  return lines.join('\n');
}
