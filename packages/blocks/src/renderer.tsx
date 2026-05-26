import type { CSSProperties } from 'react';
import type { BlockInstance, SiteSpec } from '@simplesight/contracts';
import { tokensToCssVars } from '@simplesight/theme';
import { getBlock } from './registry';

/**
 * Render a single block instance. Defensive by design (the zero-fail floor):
 * unknown block types and prop-schema failures render nothing rather than
 * throwing, so a single bad block can never take down the page.
 */
export function BlockRenderer({ instance }: { instance: BlockInstance }) {
  const mod = getBlock(instance.type);
  if (!mod) return null;
  const parsed = mod.schema.safeParse(instance.props);
  if (!parsed.success) return null;
  const variant = mod.variants.includes(instance.variant) ? instance.variant : 'default';
  const Cmp = mod.Component;
  return <Cmp props={parsed.data} variant={variant} />;
}

/** Render one page of a SiteSpec, wrapped in the tenant's theme variables. */
export function SitePage({ spec, slug = '' }: { spec: SiteSpec; slug?: string }) {
  const page =
    spec.pages.find((p) => p.slug === slug) ??
    spec.pages.find((p) => p.slug === '') ??
    spec.pages[0];

  const themeVars = tokensToCssVars(spec.theme) as unknown as CSSProperties;
  const wrapper: CSSProperties = {
    ...themeVars,
    background: 'var(--ss-bg)',
    color: 'var(--ss-fg)',
    fontFamily: 'var(--ss-font-body)',
    minHeight: '100vh',
    margin: 0,
  };

  const blocks = page ? [...page.blocks].sort((a, b) => a.order - b.order) : [];

  return (
    <div style={wrapper}>
      {blocks.map((b) => (
        <BlockRenderer key={b.id} instance={b} />
      ))}
    </div>
  );
}
