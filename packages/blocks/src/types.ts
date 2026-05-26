import type { ComponentType, CSSProperties } from 'react';
import type { BlockType } from '@simplesight/contracts';
import type { z } from 'zod';

/** Context handed to a block's `sample()` so it can produce realistic defaults. */
export interface BlockSampleContext {
  businessName: string;
  category: string;
  tagline?: string;
}

/**
 * Every block in the library implements this contract. The pipeline's stage-5
 * gate validates generated props against `schema` before persisting, so the
 * renderer is guaranteed valid props. Blocks style themselves with inline
 * styles that read theme CSS variables (var(--ss-*)), so they render identically
 * in any host.
 */
export interface BlockModule<P = unknown> {
  type: BlockType;
  /** Zod schema for this block's props — the hard gate in the pipeline. */
  schema: z.ZodType<P>;
  /** Visual variants selectable per instance. 'default' must exist. */
  variants: string[];
  Component: ComponentType<{ props: P; variant: string }>;
  /** Realistic placeholder props — used for the deterministic baseline + previews. */
  sample: (ctx: BlockSampleContext) => P;
}

export type { CSSProperties };
