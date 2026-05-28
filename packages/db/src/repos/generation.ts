import type {
  BuildVariant,
  GenerationState,
  RegenFeedback,
  RevisionChecklist,
  RevisionItem,
} from '@simplesight/contracts';
import { GENERATION_LIMITS } from '@simplesight/contracts';
import { hasDatabase } from '@simplesight/env';
import { and, asc, eq } from 'drizzle-orm';
import { db } from '../client';
import { buildVariants, generationState, revisionChecklists, revisionItems } from '../schema/generation';
import * as store from '../offline-store';

const offline = () => !hasDatabase();
const nowIso = () => new Date().toISOString();

/* ── Build variants ────────────────────────────────────────────────────── */

export type VariantInput = Omit<BuildVariant, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'costCents'> & {
  id?: string;
  status?: BuildVariant['status'];
  costCents?: number;
};

export async function createVariant(input: VariantInput): Promise<BuildVariant> {
  const base = {
    projectId: input.projectId,
    round: input.round,
    slot: input.slot,
    studioLabel: input.studioLabel,
    model: input.model,
    status: input.status ?? 'queued',
    previewUrl: input.previewUrl,
    thumbnailUrl: input.thumbnailUrl,
    runId: input.runId,
    buildDir: input.buildDir,
    designScore: input.designScore,
    contentScore: input.contentScore,
    summary: input.summary,
    costCents: input.costCents ?? 0,
    error: input.error,
  };
  if (offline()) {
    const row = store.insert('build_variants', { id: input.id ?? store.newId(), ...base, updatedAt: nowIso() });
    return row as unknown as BuildVariant;
  }
  const ins = await db.insert(buildVariants).values(base).returning();
  return rowToVariant(ins[0]!);
}

export async function updateVariant(id: string, patch: Partial<BuildVariant>): Promise<void> {
  if (offline()) {
    store.update('build_variants', (r) => r.id === id, { ...patch, updatedAt: nowIso() });
    return;
  }
  await db
    .update(buildVariants)
    .set({ ...patch, updatedAt: new Date() } as Record<string, unknown>)
    .where(eq(buildVariants.id, id));
}

/** Store/read a renderable SiteSpec for a variant (block-mode/offline previews). */
export async function saveVariantSpec(variantId: string, spec: unknown): Promise<void> {
  if (offline()) {
    store.update('build_variants', (r) => r.id === variantId, { spec });
    return;
  }
  await db.update(buildVariants).set({ spec } as Record<string, unknown>).where(eq(buildVariants.id, variantId));
}

export async function getVariantSpec(variantId: string): Promise<unknown | undefined> {
  if (offline()) {
    return store.findOne('build_variants', (r) => r.id === variantId)?.spec;
  }
  const rows = await db.select({ spec: buildVariants.spec }).from(buildVariants).where(eq(buildVariants.id, variantId)).limit(1);
  return rows[0]?.spec ?? undefined;
}

export async function getVariant(id: string): Promise<BuildVariant | undefined> {
  if (offline()) {
    const r = store.findOne('build_variants', (x) => x.id === id);
    return r ? (r as unknown as BuildVariant) : undefined;
  }
  const rows = await db.select().from(buildVariants).where(eq(buildVariants.id, id)).limit(1);
  return rows[0] ? rowToVariant(rows[0]) : undefined;
}

export async function listVariants(projectId: string): Promise<BuildVariant[]> {
  if (offline()) {
    return store
      .findMany('build_variants', (r) => r.projectId === projectId)
      .sort((a, b) => (a.round ?? 0) - (b.round ?? 0) || (a.slot < b.slot ? -1 : 1)) as unknown as BuildVariant[];
  }
  const rows = await db.select().from(buildVariants).where(eq(buildVariants.projectId, projectId)).orderBy(asc(buildVariants.round));
  return rows.map(rowToVariant);
}

export async function variantsForRound(projectId: string, round: number): Promise<BuildVariant[]> {
  const all = await listVariants(projectId);
  return all.filter((v) => v.round === round).sort((a, b) => (a.slot < b.slot ? -1 : 1));
}

function rowToVariant(r: typeof buildVariants.$inferSelect): BuildVariant {
  return {
    id: r.id,
    projectId: r.projectId,
    round: r.round,
    slot: r.slot as BuildVariant['slot'],
    studioLabel: r.studioLabel,
    model: r.model,
    status: r.status as BuildVariant['status'],
    previewUrl: r.previewUrl ?? undefined,
    thumbnailUrl: r.thumbnailUrl ?? undefined,
    runId: r.runId ?? undefined,
    buildDir: r.buildDir ?? undefined,
    designScore: r.designScore ?? undefined,
    contentScore: r.contentScore ?? undefined,
    summary: r.summary ?? undefined,
    costCents: r.costCents ?? 0,
    error: r.error ?? undefined,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

/* ── Generation state ──────────────────────────────────────────────────── */

function defaultState(projectId: string): GenerationState {
  return {
    projectId,
    status: 'idle',
    currentRound: 0,
    maxRounds: GENERATION_LIMITS.maxRounds,
    selectedVariantId: undefined,
    revisionCount: 0,
    maxRevisions: GENERATION_LIMITS.maxRevisions,
    updatedAt: nowIso(),
  };
}

export async function getGenerationState(projectId: string): Promise<GenerationState> {
  if (offline()) {
    const r = store.findOne('generation_state', (x) => x.projectId === projectId);
    return r ? ({ ...defaultState(projectId), ...(r as object) } as GenerationState) : defaultState(projectId);
  }
  const rows = await db.select().from(generationState).where(eq(generationState.projectId, projectId)).limit(1);
  const r = rows[0];
  if (!r) return defaultState(projectId);
  return {
    projectId: r.projectId,
    status: r.status as GenerationState['status'],
    currentRound: r.currentRound,
    maxRounds: r.maxRounds,
    selectedVariantId: r.selectedVariantId ?? undefined,
    revisionCount: r.revisionCount,
    maxRevisions: r.maxRevisions,
    updatedAt: r.updatedAt.toISOString(),
  };
}

export async function setGenerationState(
  projectId: string,
  patch: Partial<Omit<GenerationState, 'projectId'>> & { feedback?: RegenFeedback },
): Promise<void> {
  const { feedback, ...rest } = patch;
  if (offline()) {
    const existing = store.findOne('generation_state', (x) => x.projectId === projectId);
    const history = (existing?.feedback as RegenFeedback[] | undefined) ?? [];
    store.upsert('generation_state', (x) => x.projectId === projectId, {
      ...defaultState(projectId),
      ...(existing ?? {}),
      ...rest,
      ...(feedback ? { feedback: [...history, feedback] } : {}),
      updatedAt: nowIso(),
    });
    return;
  }
  const rows = await db.select().from(generationState).where(eq(generationState.projectId, projectId)).limit(1);
  const history = ((rows[0]?.feedback as RegenFeedback[] | null) ?? []) as RegenFeedback[];
  const values = {
    projectId,
    ...rest,
    ...(feedback ? { feedback: [...history, feedback] } : {}),
    updatedAt: new Date(),
  } as Record<string, unknown>;
  if (rows[0]) {
    await db.update(generationState).set(values).where(eq(generationState.projectId, projectId));
  } else {
    await db.insert(generationState).values({ ...defaultState(projectId), ...values } as never);
  }
}

/* ── Revision items + checklist ────────────────────────────────────────── */

export type RevisionItemInput = Omit<RevisionItem, 'id' | 'createdAt'> & { id?: string };

export async function addRevisionItem(input: RevisionItemInput): Promise<RevisionItem> {
  const base = {
    projectId: input.projectId,
    variantId: input.variantId,
    revision: input.revision ?? 0,
    pageSlug: input.pageSlug,
    pageName: input.pageName,
    viewport: input.viewport ?? 'desktop',
    comment: input.comment,
    category: input.category,
    status: input.status ?? 'open',
  };
  if (offline()) {
    return store.insert('revision_items', { id: input.id ?? store.newId(), ...base }) as unknown as RevisionItem;
  }
  const ins = await db.insert(revisionItems).values(base).returning();
  return rowToItem(ins[0]!);
}

export async function listRevisionItems(
  projectId: string,
  opts?: { variantId?: string; revision?: number; status?: RevisionItem['status'] },
): Promise<RevisionItem[]> {
  if (offline()) {
    return store.findMany('revision_items', (r) => {
      if (r.projectId !== projectId) return false;
      if (opts?.variantId && r.variantId !== opts.variantId) return false;
      if (opts?.revision != null && r.revision !== opts.revision) return false;
      if (opts?.status && r.status !== opts.status) return false;
      return true;
    }) as unknown as RevisionItem[];
  }
  const rows = await db.select().from(revisionItems).where(eq(revisionItems.projectId, projectId)).orderBy(asc(revisionItems.createdAt));
  return rows
    .map(rowToItem)
    .filter(
      (r) =>
        (!opts?.variantId || r.variantId === opts.variantId) &&
        (opts?.revision == null || r.revision === opts.revision) &&
        (!opts?.status || r.status === opts.status),
    );
}

export async function updateRevisionItem(id: string, patch: Partial<RevisionItem>): Promise<void> {
  if (offline()) {
    store.update('revision_items', (r) => r.id === id, patch);
    return;
  }
  await db.update(revisionItems).set(patch as Record<string, unknown>).where(eq(revisionItems.id, id));
}

export async function deleteRevisionItem(id: string): Promise<void> {
  if (offline()) {
    const rows = store.readColl('revision_items').filter((r) => r.id !== id);
    store.writeColl('revision_items', rows);
    return;
  }
  await db.delete(revisionItems).where(eq(revisionItems.id, id));
}

function rowToItem(r: typeof revisionItems.$inferSelect): RevisionItem {
  return {
    id: r.id,
    projectId: r.projectId,
    variantId: r.variantId,
    revision: r.revision,
    pageSlug: r.pageSlug,
    pageName: r.pageName ?? undefined,
    viewport: r.viewport as RevisionItem['viewport'],
    comment: r.comment,
    category: r.category ?? undefined,
    status: r.status as RevisionItem['status'],
    createdAt: r.createdAt.toISOString(),
  };
}

export async function saveChecklist(input: Omit<RevisionChecklist, 'id' | 'createdAt'> & { id?: string }): Promise<RevisionChecklist> {
  const base = {
    projectId: input.projectId,
    variantId: input.variantId,
    revision: input.revision,
    items: input.items,
    summary: input.summary,
    status: input.status ?? 'draft',
  };
  if (offline()) {
    const row = store.upsert(
      'revision_checklists',
      (r) => r.projectId === input.projectId && r.variantId === input.variantId && r.revision === input.revision,
      { id: input.id ?? store.newId(), ...base, createdAt: nowIso() },
    );
    return row as unknown as RevisionChecklist;
  }
  const ins = await db.insert(revisionChecklists).values(base as never).returning();
  return rowToChecklist(ins[0]!);
}

export async function latestChecklist(projectId: string, variantId: string): Promise<RevisionChecklist | undefined> {
  if (offline()) {
    const rows = store
      .findMany('revision_checklists', (r) => r.projectId === projectId && r.variantId === variantId)
      .sort((a, b) => (b.revision ?? 0) - (a.revision ?? 0));
    return rows[0] as unknown as RevisionChecklist | undefined;
  }
  const rows = await db.select().from(revisionChecklists).where(and(eq(revisionChecklists.projectId, projectId), eq(revisionChecklists.variantId, variantId)));
  const sorted = rows.map(rowToChecklist).sort((a, b) => b.revision - a.revision);
  return sorted[0];
}

function rowToChecklist(r: typeof revisionChecklists.$inferSelect): RevisionChecklist {
  return {
    id: r.id,
    projectId: r.projectId,
    variantId: r.variantId,
    revision: r.revision,
    items: (r.items as RevisionItem[]) ?? [],
    summary: r.summary ?? '',
    status: r.status as RevisionChecklist['status'],
    createdAt: r.createdAt.toISOString(),
  };
}
