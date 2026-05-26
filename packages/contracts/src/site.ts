import { z } from 'zod';
import { ThemeTokens } from './theme';

/**
 * The catalog of block types the renderer knows how to draw. The actual prop
 * schema for each lives in @simplesight/blocks (the registry); contracts only
 * needs the identifier union so SiteSpec can reference blocks by type.
 */
export const BlockType = z.enum([
  'nav',
  'hero',
  'about',
  'services',
  'feature',
  'gallery',
  'testimonials',
  'stats',
  'team',
  'pricing',
  'faq',
  'cta',
  'contact',
  'hours',
  'map',
  'footer',
]);
export type BlockType = z.infer<typeof BlockType>;

/**
 * A single placed block on a page. `props` is validated against the block's own
 * Zod schema at the stage-5 hard gate, so the renderer never receives invalid props.
 */
export const BlockInstance = z.object({
  id: z.string(),
  type: BlockType,
  /** Visual variant within the block type (e.g. hero "split" vs "centered"). */
  variant: z.string().default('default'),
  props: z.record(z.unknown()),
  order: z.number().int(),
});
export type BlockInstance = z.infer<typeof BlockInstance>;

export const Page = z.object({
  slug: z.string(), // '' = home
  title: z.string(),
  seo: z
    .object({
      title: z.string(),
      description: z.string(),
    })
    .optional(),
  blocks: z.array(BlockInstance),
  order: z.number().int(),
});
export type Page = z.infer<typeof Page>;

export const NavItem = z.object({ label: z.string(), href: z.string() });
export type NavItem = z.infer<typeof NavItem>;

export const Brand = z.object({
  name: z.string(),
  tagline: z.string().optional(),
  logoUrl: z.string().url().optional(),
  voice: z.string().optional(), // short description of tone of voice
});
export type Brand = z.infer<typeof Brand>;

/**
 * The complete, render-ready definition of a website. This is the artifact the
 * pipeline produces and the renderer consumes. Everything here is plain data.
 */
export const SiteSpec = z.object({
  brand: Brand,
  theme: ThemeTokens,
  nav: z.array(NavItem),
  pages: z.array(Page).min(1),
  seo: z
    .object({
      defaultTitle: z.string(),
      defaultDescription: z.string(),
    })
    .optional(),
});
export type SiteSpec = z.infer<typeof SiteSpec>;
