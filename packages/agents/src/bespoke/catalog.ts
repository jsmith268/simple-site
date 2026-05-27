import { type ComponentType, type SiteIA } from '@simplesight/contracts';
import { componentsUsed } from './ia';

/* ──────────────────────────────────────────────────────────────────────────
 * Component catalog. Maps each catalog ComponentType to a React component name
 * and a build spec. SHAREABLE types become standalone files generated once by
 * the Foundation agent and imported by pages; the rest are authored inline by
 * the Page agent as page composition.
 * ────────────────────────────────────────────────────────────────────────── */

const NAMES: Record<ComponentType, string> = {
  nav: 'SiteNav',
  footer: 'SiteFooter',
  hero: 'Hero',
  'feature-grid': 'FeatureGrid',
  'stat-bento': 'StatBento',
  'pricing-tiers': 'PricingTiers',
  schedule: 'Schedule',
  'team-cards': 'TeamCards',
  testimonials: 'Testimonials',
  'faq-accordion': 'FaqAccordion',
  gallery: 'Gallery',
  'social-feed': 'SocialFeed',
  map: 'LocationMap',
  'lead-form': 'LeadForm',
  'cta-band': 'CtaBand',
  marquee: 'Marquee',
  newsletter: 'NewsletterSignup',
  'logo-cloud': 'LogoCloud',
  steps: 'Steps',
  'content-prose': 'Prose',
};

export function componentNameFor(t: ComponentType): string {
  return NAMES[t];
}
export function componentFileFor(t: ComponentType): string {
  return `app/components/${NAMES[t]}.tsx`;
}

/** Components generated ONCE as shared, importable files (interactive widgets + embeds). */
export const SHAREABLE_COMPONENTS: ComponentType[] = [
  'social-feed',
  'map',
  'lead-form',
  'faq-accordion',
  'gallery',
  'newsletter',
];

/** Per-shareable build spec injected into the Foundation prompt. */
export const COMPONENT_SPECS: Partial<Record<ComponentType, { interactive: boolean; spec: string }>> = {
  'social-feed': {
    interactive: false,
    spec: `SocialFeed — Instagram-style feed. Header row: avatar + @handle + follower count + a "Follow on Instagram" button linking to the profile. Responsive grid of 6–8 aspect-square photo tiles, each with a CSS-hover overlay showing a heart inline-SVG + like count + short caption. Props: { handle: string; profileUrl: string; items: { img: string; alt: string; likes: string; caption: string }[] }.`,
  },
  map: {
    interactive: false,
    spec: `LocationMap — a styled card containing an <iframe src="https://www.google.com/maps?q=<urlencoded address>&output=embed" loading="lazy" title=...> ~360–420px tall, plus an address block, hours, and a "Get Directions" link to https://www.google.com/maps?q=<address>. Props: { address: string; hours?: { days: string; open: string; close: string }[] }.`,
  },
  'lead-form': {
    interactive: true,
    spec: `LeadForm ('use client') — a functional lead/booking form. useState for fields + a submitted flag. Sensible fields for the business (name, email, phone, a relevant <select>, optional date, message) with HTML required validation. onSubmit → e.preventDefault() → submitted=true → render a success-state card with a reset link. No backend. Accept optional prop { id?: string } so a page can anchor to it. Type event handlers (React.FormEvent / React.ChangeEvent).`,
  },
  'faq-accordion': {
    interactive: true,
    spec: `FaqAccordion + FaqItem ('use client') — accessible accordion. FaqItem props { question: string; answer: React.ReactNode; defaultOpen?: boolean }; useState toggle, rotating inline-SVG chevron, smooth height/opacity. FaqAccordion props { items: { question: string; answer: string }[] }.`,
  },
  gallery: {
    interactive: true,
    spec: `Gallery ('use client') — a responsive image grid/masonry with a lightbox (useState selected index, click to open, esc/overlay to close, prev/next). Props: { images: { src: string; alt: string }[] }.`,
  },
  newsletter: {
    interactive: false,
    spec: `NewsletterSignup — an email capture (type=email + button) styled to the palette. Can be a plain form (no JS needed). Props: { heading?: string; blurb?: string }.`,
  },
};

/** Which components the Foundation agent must generate as shared files for this IA. */
export function foundationComponents(ia: SiteIA): ComponentType[] {
  const used = componentsUsed(ia);
  const shareableUsed = used.filter((t) => SHAREABLE_COMPONENTS.includes(t));
  const set = new Set<ComponentType>(['nav', 'footer', ...ia.sharedComponents.filter((t) => SHAREABLE_COMPONENTS.includes(t)), ...shareableUsed]);
  return [...set];
}

/** The component→import map a page generator advertises to Opus (only shared ones). */
export function sharedImportMap(ia: SiteIA): { type: ComponentType; name: string; importPath: string; props: string }[] {
  return foundationComponents(ia)
    .filter((t) => t !== 'nav' && t !== 'footer') // nav/footer live in layout
    .map((t) => ({
      type: t,
      name: componentNameFor(t),
      importPath: `@/components/${componentNameFor(t)}`,
      props:
        t === 'lead-form'
          ? '{ id?: string }'
          : t === 'faq-accordion'
            ? '{ items: {question,answer}[] }'
            : t === 'social-feed'
              ? '{ handle, profileUrl, items[] }'
              : t === 'map'
                ? '{ address, hours? }'
                : t === 'gallery'
                  ? '{ images: {src,alt}[] }'
                  : '{}',
    }));
}
