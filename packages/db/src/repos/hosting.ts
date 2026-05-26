import { hasDatabase } from '@simplesight/env';
import { eq } from 'drizzle-orm';
import { db } from '../client';
import { projects, sites } from '../schema/core';
import { connectionSteps, domains } from '../schema/provisioning';
import * as store from '../offline-store';

const offline = () => !hasDatabase();

async function siteIdForProject(projectId: string): Promise<string | undefined> {
  if (offline()) {
    return store.findOne('sites', (s) => s.projectId === projectId)?.id;
  }
  const rows = await db.select({ id: sites.id }).from(sites).where(eq(sites.projectId, projectId)).limit(1);
  return rows[0]?.id;
}

export interface DomainInput {
  domain: string;
  type: 'subdomain' | 'custom';
  verified: boolean;
  verification?: unknown;
}

export async function saveDomain(projectId: string, d: DomainInput): Promise<void> {
  const siteId = await siteIdForProject(projectId);
  if (!siteId) return;
  if (offline()) {
    store.upsert('domains', (r) => r.siteId === siteId && r.domain === d.domain, {
      siteId,
      domain: d.domain,
      type: d.type,
      verified: d.verified,
      verification: d.verification,
      attachedAt: new Date().toISOString(),
    });
    return;
  }
  await db.insert(domains).values({
    siteId,
    domain: d.domain,
    type: d.type,
    verified: d.verified,
    verification: d.verification as object,
    attachedAt: new Date(),
  });
}

export async function listDomains(projectId: string): Promise<DomainInput[]> {
  const siteId = await siteIdForProject(projectId);
  if (!siteId) return [];
  if (offline()) {
    return store.findMany('domains', (r) => r.siteId === siteId) as DomainInput[];
  }
  const rows = await db.select().from(domains).where(eq(domains.siteId, siteId));
  return rows.map((r) => ({
    domain: r.domain,
    type: r.type as DomainInput['type'],
    verified: r.verified,
    verification: r.verification,
  }));
}

export async function recordConnectionStep(
  projectId: string,
  stepName: string,
  status: string,
  metadata?: unknown,
): Promise<void> {
  const siteId = await siteIdForProject(projectId);
  if (!siteId) return;
  if (offline()) {
    store.insert('connection_steps', { siteId, stepName, status, attemptNumber: 1, metadata });
    return;
  }
  await db.insert(connectionSteps).values({ siteId, stepName, status, metadata: metadata as object });
}

export async function listConnectionSteps(projectId: string): Promise<Record<string, unknown>[]> {
  const siteId = await siteIdForProject(projectId);
  if (!siteId) return [];
  if (offline()) {
    return store.findMany('connection_steps', (r) => r.siteId === siteId);
  }
  const rows = await db.select().from(connectionSteps).where(eq(connectionSteps.siteId, siteId));
  return rows as unknown as Record<string, unknown>[];
}

/** Mark a site live on a domain and flip the project to 'live'. */
export async function markLive(projectId: string, liveDomain: string): Promise<void> {
  const siteId = await siteIdForProject(projectId);
  if (offline()) {
    if (siteId) store.update('sites', (s) => s.id === siteId, { liveDomain });
    store.update('projects', (p) => p.id === projectId, { status: 'live' });
    return;
  }
  if (siteId) await db.update(sites).set({ liveDomain }).where(eq(sites.id, siteId));
  await db.update(projects).set({ status: 'live' }).where(eq(projects.id, projectId));
}

/** Unpublish a site (used on refund). */
export async function unpublishSite(projectId: string): Promise<void> {
  const siteId = await siteIdForProject(projectId);
  if (offline()) {
    if (siteId) store.update('sites', (s) => s.id === siteId, { status: 'draft' });
    return;
  }
  if (siteId) await db.update(sites).set({ status: 'draft' }).where(eq(sites.id, siteId));
}
