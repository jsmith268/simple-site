import type { SiteSpec } from '@simplesight/contracts';
import { hasDatabase } from '@simplesight/env';
import { desc, eq } from 'drizzle-orm';
import { db } from '../client';
import { siteVersions } from '../schema/core';
import * as store from '../offline-store';

const MAX_VERSIONS = 20;

function sig(spec: unknown): string {
  try {
    return JSON.stringify(spec);
  } catch {
    return '';
  }
}

export interface VersionSummary {
  id: string;
  label: string;
  createdAt: string;
  brandName: string;
  pageCount: number;
}

/**
 * Snapshot the live SiteSpec. Called from saveSiteSpec on every write. Skips a
 * snapshot identical to the most recent one (no-op re-saves don't pile up) and
 * prunes to the most recent MAX_VERSIONS. Best-effort: never throws.
 */
export async function snapshotSiteVersion(
  projectId: string,
  spec: SiteSpec,
  label?: string,
): Promise<void> {
  const signature = sig(spec);

  if (!hasDatabase()) {
    const rows = store
      .findMany('site_versions', (r) => r.projectId === projectId)
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    if (rows[0] && sig(rows[0].spec) === signature) return;
    store.insert('site_versions', { projectId, label: label ?? null, spec });
    const all = store
      .findMany('site_versions', (r) => r.projectId === projectId)
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    if (all.length > MAX_VERSIONS) {
      const keep = new Set(all.slice(0, MAX_VERSIONS).map((r) => r.id as string));
      store.writeColl(
        'site_versions',
        store
          .readColl('site_versions')
          .filter((r) => r.projectId !== projectId || keep.has(r.id as string)),
      );
    }
    return;
  }

  const latest = await db
    .select({ spec: siteVersions.spec })
    .from(siteVersions)
    .where(eq(siteVersions.projectId, projectId))
    .orderBy(desc(siteVersions.createdAt))
    .limit(1);
  if (latest[0] && sig(latest[0].spec) === signature) return;
  await db.insert(siteVersions).values({ projectId, label: label ?? null, spec });
  const ids = await db
    .select({ id: siteVersions.id })
    .from(siteVersions)
    .where(eq(siteVersions.projectId, projectId))
    .orderBy(desc(siteVersions.createdAt));
  for (const row of ids.slice(MAX_VERSIONS)) {
    await db.delete(siteVersions).where(eq(siteVersions.id, row.id));
  }
}

/** All versions for a project, newest first, numbered oldest→newest as "Version N". */
export async function listSiteVersions(projectId: string): Promise<VersionSummary[]> {
  let rows: { id: string; label: string | null; createdAt: string; spec: unknown }[];
  if (!hasDatabase()) {
    rows = store
      .findMany('site_versions', (r) => r.projectId === projectId)
      .map((r) => ({
        id: r.id as string,
        label: (r.label as string | null) ?? null,
        createdAt: String(r.createdAt),
        spec: r.spec,
      }));
  } else {
    const dbRows = await db
      .select({
        id: siteVersions.id,
        label: siteVersions.label,
        createdAt: siteVersions.createdAt,
        spec: siteVersions.spec,
      })
      .from(siteVersions)
      .where(eq(siteVersions.projectId, projectId));
    rows = dbRows.map((r) => ({
      id: r.id,
      label: r.label,
      createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
      spec: r.spec,
    }));
  }
  const asc = [...rows].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const numbered = new Map(asc.map((r, i) => [r.id, i + 1]));
  return asc
    .map((r) => {
      const spec = (r.spec ?? {}) as Partial<SiteSpec>;
      return {
        id: r.id,
        label: r.label ?? `Version ${numbered.get(r.id)}`,
        createdAt: new Date(r.createdAt).toISOString(),
        brandName: spec.brand?.name ?? 'Untitled',
        pageCount: spec.pages?.length ?? 0,
      };
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Full snapshot (with spec) by id, scoped to a project. */
export async function getSiteVersion(
  projectId: string,
  versionId: string,
): Promise<{ id: string; spec: SiteSpec } | null> {
  if (!hasDatabase()) {
    const row = store.findOne(
      'site_versions',
      (r) => r.id === versionId && r.projectId === projectId,
    );
    return row ? { id: row.id as string, spec: row.spec as SiteSpec } : null;
  }
  const rows = await db
    .select({ id: siteVersions.id, spec: siteVersions.spec })
    .from(siteVersions)
    .where(eq(siteVersions.id, versionId))
    .limit(1);
  const row = rows[0];
  return row ? { id: row.id, spec: row.spec as SiteSpec } : null;
}
