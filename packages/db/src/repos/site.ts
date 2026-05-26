import type {
  Brand,
  NavItem,
  Page,
  SiteSpec,
  ThemeTokens,
  BlockType,
} from '@simplesight/contracts';
import { hasDatabase } from '@simplesight/env';
import { asc, eq } from 'drizzle-orm';
import { db } from '../client';
import { pageBlocks, pages, projects, sites } from '../schema/index';
import * as store from '../offline-store';

/**
 * Assemble a render-ready SiteSpec from the persisted project/site/page/block
 * rows. Returns null if the username has no site yet. Used by the renderer.
 */
export async function getSiteSpecByUsername(username: string): Promise<SiteSpec | null> {
  if (!hasDatabase()) {
    const proj = store.findOne('projects', (p) => p.username === username);
    if (!proj) return null;
    const site = store.findOne('sites', (s) => s.projectId === proj.id);
    if (!site || !site.brand || !site.theme) return null;
    const pageRows = store
      .findMany('pages', (p) => p.siteId === site.id)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const pageSpecs: Page[] = pageRows.map((p) => ({
      slug: p.slug,
      title: p.title,
      seo: (p.seo as Page['seo']) ?? undefined,
      order: p.order ?? 0,
      blocks: store
        .findMany('page_blocks', (b) => b.pageId === p.id)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((b) => ({
          id: b.id,
          type: b.blockType as BlockType,
          variant: b.variant ?? 'default',
          props: (b.props as Record<string, unknown>) ?? {},
          order: b.order ?? 0,
        })),
    }));
    return {
      brand: site.brand as Brand,
      theme: site.theme as ThemeTokens,
      nav: (site.nav as NavItem[]) ?? [],
      pages: pageSpecs,
      seo: (site.seo as SiteSpec['seo']) ?? undefined,
    };
  }
  const projRows = await db.select().from(projects).where(eq(projects.username, username)).limit(1);
  const proj = projRows[0];
  if (!proj) return null;

  const siteRows = await db.select().from(sites).where(eq(sites.projectId, proj.id)).limit(1);
  const site = siteRows[0];
  if (!site || !site.brand || !site.theme) return null;

  const pageRows = await db
    .select()
    .from(pages)
    .where(eq(pages.siteId, site.id))
    .orderBy(asc(pages.order));

  const pageSpecs: Page[] = [];
  for (const p of pageRows) {
    const blockRows = await db
      .select()
      .from(pageBlocks)
      .where(eq(pageBlocks.pageId, p.id))
      .orderBy(asc(pageBlocks.order));
    pageSpecs.push({
      slug: p.slug,
      title: p.title,
      seo: (p.seo as Page['seo']) ?? undefined,
      order: p.order,
      blocks: blockRows.map((b) => ({
        id: b.id,
        type: b.blockType as BlockType,
        variant: b.variant,
        props: (b.props as Record<string, unknown>) ?? {},
        order: b.order,
      })),
    });
  }

  return {
    brand: site.brand as Brand,
    theme: site.theme as ThemeTokens,
    nav: (site.nav as NavItem[]) ?? [],
    pages: pageSpecs.length ? pageSpecs : [],
    seo: (site.seo as SiteSpec['seo']) ?? undefined,
  };
}
