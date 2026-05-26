import type { BlockType } from '@simplesight/contracts';
import type { BlockModule } from './types';

import { about } from './blocks/about';
import { contact } from './blocks/contact';
import { cta } from './blocks/cta';
import { faq } from './blocks/faq';
import { feature } from './blocks/feature';
import { footer } from './blocks/footer';
import { gallery } from './blocks/gallery';
import { hero } from './blocks/hero';
import { hours } from './blocks/hours';
import { map } from './blocks/map';
import { nav } from './blocks/nav';
import { pricing } from './blocks/pricing';
import { services } from './blocks/services';
import { stats } from './blocks/stats';
import { team } from './blocks/team';
import { testimonials } from './blocks/testimonials';

/** The complete block library, keyed by block type. */
export const registry: Record<BlockType, BlockModule<any>> = {
  nav,
  hero,
  about,
  services,
  feature,
  gallery,
  testimonials,
  stats,
  team,
  pricing,
  faq,
  cta,
  contact,
  hours,
  map,
  footer,
};

export function getBlock(type: BlockType): BlockModule<any> | undefined {
  return registry[type];
}

export const blockTypes = Object.keys(registry) as BlockType[];
