import type { Asset, BusinessInfo, IntakeStyle } from '@simplesight/contracts';
import { hasDatabase } from '@simplesight/env';
import { and, eq, ne } from 'drizzle-orm';
import { db } from '../client';
import { assets, intakes, projects } from '../schema/core';
import * as store from '../offline-store';

const USERNAME_RE = /^[a-z0-9](?:[a-z0-9-]{1,30}[a-z0-9])$/;

/** Reserve username.simplesight.co for a project. Validates format + uniqueness. */
export async function reserveUsername(
  projectId: string,
  username: string,
): Promise<{ ok: boolean; error?: string }> {
  const u = username.trim().toLowerCase();
  if (!USERNAME_RE.test(u)) {
    return { ok: false, error: 'Use 3–32 lowercase letters, numbers, or hyphens.' };
  }
  if (!hasDatabase()) {
    const taken = store.findOne('projects', (r) => r.username === u && r.id !== projectId);
    if (taken) return { ok: false, error: 'That name is taken.' };
    store.update('projects', (r) => r.id === projectId, { username: u });
    return { ok: true };
  }
  const taken = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.username, u), ne(projects.id, projectId)))
    .limit(1);
  if (taken.length) return { ok: false, error: 'That name is taken.' };
  await db.update(projects).set({ username: u }).where(eq(projects.id, projectId));
  return { ok: true };
}

export interface IntakeSections {
  style?: IntakeStyle;
  business?: BusinessInfo;
  referenceUrls?: string[];
  crawledContext?: Record<string, unknown>;
}

export async function saveIntake(projectId: string, sections: IntakeSections): Promise<void> {
  if (!hasDatabase()) {
    store.upsert('intakes', (r) => r.projectId === projectId, {
      projectId,
      ...sections,
      updatedAt: new Date().toISOString(),
    });
    return;
  }
  const patch: Record<string, unknown> = { updatedAt: new Date() };
  if (sections.style) patch.style = sections.style;
  if (sections.business) patch.business = sections.business;
  if (sections.referenceUrls) patch.referenceUrls = sections.referenceUrls;
  if (sections.crawledContext) patch.crawledContext = sections.crawledContext;
  await db
    .insert(intakes)
    .values({ projectId, ...patch })
    .onConflictDoUpdate({ target: intakes.projectId, set: patch });
}

export async function getIntake(projectId: string): Promise<IntakeSections | undefined> {
  if (!hasDatabase()) {
    const r = store.findOne('intakes', (x) => x.projectId === projectId);
    return r as IntakeSections | undefined;
  }
  const rows = await db.select().from(intakes).where(eq(intakes.projectId, projectId)).limit(1);
  const r = rows[0];
  if (!r) return undefined;
  return {
    style: (r.style as IntakeStyle) ?? undefined,
    business: (r.business as BusinessInfo) ?? undefined,
    referenceUrls: (r.referenceUrls as string[]) ?? undefined,
    crawledContext: (r.crawledContext as Record<string, unknown>) ?? undefined,
  };
}

/** Mark intake complete and queue the project for the build pipeline. */
export async function completeIntake(projectId: string): Promise<void> {
  if (!hasDatabase()) {
    store.update('intakes', (r) => r.projectId === projectId, { completedAt: new Date().toISOString() });
    store.update('projects', (r) => r.id === projectId, { status: 'queued' });
    return;
  }
  await db.update(intakes).set({ completedAt: new Date() }).where(eq(intakes.projectId, projectId));
  await db.update(projects).set({ status: 'queued' }).where(eq(projects.id, projectId));
}

export async function addAsset(projectId: string, asset: Omit<Asset, 'id'>): Promise<Asset> {
  if (!hasDatabase()) {
    const row = store.insert('assets', { projectId, ...asset });
    return { id: row.id, ...asset };
  }
  const inserted = await db
    .insert(assets)
    .values({
      projectId,
      url: asset.url,
      kind: asset.kind,
      alt: asset.alt,
      width: asset.width,
      height: asset.height,
      dominantColor: asset.dominantColor,
      source: asset.source,
    })
    .returning({ id: assets.id });
  return { id: inserted[0]?.id as string, ...asset };
}

export async function listAssets(projectId: string): Promise<Asset[]> {
  if (!hasDatabase()) {
    return store.findMany('assets', (r) => r.projectId === projectId) as Asset[];
  }
  const rows = await db.select().from(assets).where(eq(assets.projectId, projectId));
  return rows.map((a) => ({
    id: a.id,
    url: a.url,
    kind: a.kind as Asset['kind'],
    alt: a.alt ?? undefined,
    width: a.width ?? undefined,
    height: a.height ?? undefined,
    dominantColor: a.dominantColor ?? undefined,
    source: a.source as Asset['source'],
  }));
}
