import type { SiteSpec } from '@simplesight/contracts';
import { getBlock } from '@simplesight/blocks';

export interface VerifyResult {
  spec: SiteSpec;
  dropped: { pageSlug: string; blockId: string; type: string; reason: string }[];
}

/**
 * The hard render gate (pipeline stage 9). Validates every block's props against
 * its registered Zod schema and drops anything invalid or unknown. After this,
 * the renderer is guaranteed to receive only valid, drawable blocks — a bad
 * block can never reach the customer's site.
 */
export function renderVerify(spec: SiteSpec): VerifyResult {
  const dropped: VerifyResult['dropped'] = [];
  const pages = spec.pages.map((page) => ({
    ...page,
    blocks: page.blocks.filter((b) => {
      const mod = getBlock(b.type);
      if (!mod) {
        dropped.push({ pageSlug: page.slug, blockId: b.id, type: b.type, reason: 'unknown block type' });
        return false;
      }
      const parsed = mod.schema.safeParse(b.props);
      if (!parsed.success) {
        dropped.push({ pageSlug: page.slug, blockId: b.id, type: b.type, reason: 'props failed schema' });
        return false;
      }
      return true;
    }),
  }));
  return { spec: { ...spec, pages }, dropped };
}
