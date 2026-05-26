import type { SiteSpec } from '@simplesight/contracts';
import { hasDatabase } from '@simplesight/env';
import { eq } from 'drizzle-orm';
import { db } from '../client';
import { pageBlocks, pages, projects, sites } from '../schema/core';
import {
  agentInvocationDetails,
  artifacts,
  criticVerdicts,
  pipelineCampaigns,
  pipelineRuns,
  supervisorDecisions,
  workflowSteps,
} from '../schema/orchestration';
import * as store from '../offline-store';

const offline = () => !hasDatabase();

// ── Campaign / run lifecycle ────────────────────────────────────────────────

export async function openCampaign(projectId: string, kind: string): Promise<string> {
  if (offline()) {
    return store.insert('pipeline_campaigns', { projectId, kind, status: 'in_progress', currentAttempt: 1 }).id;
  }
  const r = await db
    .insert(pipelineCampaigns)
    .values({ projectId, kind, status: 'in_progress' })
    .returning({ id: pipelineCampaigns.id });
  return r[0]?.id as string;
}

export async function openRun(
  campaignId: string,
  projectId: string,
  attemptNumber: number,
  triggerReason = 'initial',
): Promise<string> {
  if (offline()) {
    return store.insert('pipeline_runs', {
      campaignId,
      projectId,
      attemptNumber,
      triggerReason,
      status: 'running',
      startedAt: new Date().toISOString(),
      costCents: 0,
    }).id;
  }
  const r = await db
    .insert(pipelineRuns)
    .values({ campaignId, projectId, attemptNumber, triggerReason, status: 'running' })
    .returning({ id: pipelineRuns.id });
  return r[0]?.id as string;
}

export async function finishRun(runId: string, status: string, costCents: number): Promise<void> {
  if (offline()) {
    store.update('pipeline_runs', (r) => r.id === runId, {
      status,
      costCents,
      finishedAt: new Date().toISOString(),
    });
    return;
  }
  await db
    .update(pipelineRuns)
    .set({ status, costCents, finishedAt: new Date() })
    .where(eq(pipelineRuns.id, runId));
}

// ── Step checkpointing (idempotent; powers crash-resume) ────────────────────

export interface StepRecord {
  runId: string;
  stepName: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'skipped';
  attemptNumber: number;
  idempotencyKey: string;
  artifactId?: string;
  criticVerdictId?: string;
  errorMessage?: string;
}

export async function recordStep(rec: StepRecord): Promise<void> {
  if (offline()) {
    const existing = store.findOne('workflow_steps', (s) => s.idempotencyKey === rec.idempotencyKey);
    if (existing) {
      store.update('workflow_steps', (s) => s.idempotencyKey === rec.idempotencyKey, {
        status: rec.status,
        artifactId: rec.artifactId,
        criticVerdictId: rec.criticVerdictId,
        errorMessage: rec.errorMessage,
        endedAt: rec.status === 'completed' || rec.status === 'failed' ? new Date().toISOString() : undefined,
      });
    } else {
      store.insert('workflow_steps', { ...rec, startedAt: new Date().toISOString() });
    }
    return;
  }
  await db
    .insert(workflowSteps)
    .values({
      runId: rec.runId,
      stepName: rec.stepName,
      status: rec.status,
      attemptNumber: rec.attemptNumber,
      idempotencyKey: rec.idempotencyKey,
      artifactId: rec.artifactId,
      criticVerdictId: rec.criticVerdictId,
      errorMessage: rec.errorMessage,
      startedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: workflowSteps.idempotencyKey,
      set: {
        status: rec.status,
        artifactId: rec.artifactId,
        criticVerdictId: rec.criticVerdictId,
        errorMessage: rec.errorMessage,
        endedAt: new Date(),
      },
    });
}

/** Reload a completed step's stored output artifact (for crash-resume skip). */
export async function completedStepOutput(runId: string, idempotencyKey: string): Promise<unknown | undefined> {
  if (offline()) {
    const step = store.findOne(
      'workflow_steps',
      (s) => s.runId === runId && s.idempotencyKey === idempotencyKey && s.status === 'completed',
    );
    if (!step?.artifactId) return undefined;
    const art = store.findOne('artifacts', (a) => a.id === step.artifactId);
    return art?.inlineJson;
  }
  const stepRows = await db.select().from(workflowSteps).where(eq(workflowSteps.idempotencyKey, idempotencyKey)).limit(1);
  const step = stepRows[0];
  if (!step || step.status !== 'completed' || !step.artifactId) return undefined;
  const artRows = await db.select().from(artifacts).where(eq(artifacts.id, step.artifactId)).limit(1);
  return artRows[0]?.inlineJson;
}

/** Idempotency keys of steps already completed for this run (for resume). */
export async function completedStepKeys(runId: string): Promise<Set<string>> {
  if (offline()) {
    const rows = store.findMany('workflow_steps', (s) => s.runId === runId && s.status === 'completed');
    return new Set(rows.map((r) => r.idempotencyKey as string));
  }
  const rows = await db
    .select({ key: workflowSteps.idempotencyKey, status: workflowSteps.status })
    .from(workflowSteps)
    .where(eq(workflowSteps.runId, runId));
  return new Set(rows.filter((r) => r.status === 'completed').map((r) => r.key));
}

// ── Observability records (best-effort; read by the operator portal) ────────

export async function recordInvocation(rec: {
  runId: string;
  stepName: string;
  attemptNumber: number;
  callIndex: number;
  agent: string;
  mode: string;
  model?: string;
  systemPrompt?: string;
  userMessage?: string;
  rawOutput?: string;
  parsedOutput?: unknown;
  tokensIn: number;
  tokensOut: number;
  costCents: number;
  ms: number;
}): Promise<void> {
  if (offline()) {
    store.insert('agent_invocation_details', rec);
    return;
  }
  await db.insert(agentInvocationDetails).values(rec);
}

export async function recordArtifact(rec: {
  runId: string;
  type: string;
  producedByAgent?: string;
  inlineJson?: unknown;
  costCents?: number;
}): Promise<string> {
  if (offline()) {
    return store.insert('artifacts', { ...rec, costCents: rec.costCents ?? 0 }).id;
  }
  const r = await db
    .insert(artifacts)
    .values({
      runId: rec.runId,
      type: rec.type,
      producedByAgent: rec.producedByAgent,
      inlineJson: rec.inlineJson,
      costCents: rec.costCents ?? 0,
    })
    .returning({ id: artifacts.id });
  return r[0]?.id as string;
}

export async function recordVerdict(rec: {
  artifactId?: string;
  criticName: string;
  verdict: string;
  score: number;
  reasons?: unknown;
  findings?: unknown;
  floorViolations?: unknown;
}): Promise<string> {
  if (offline()) {
    return store.insert('critic_verdicts', rec).id;
  }
  const r = await db
    .insert(criticVerdicts)
    .values({
      artifactId: rec.artifactId,
      criticName: rec.criticName,
      verdict: rec.verdict,
      score: String(rec.score),
      reasons: rec.reasons,
      findings: rec.findings,
      floorViolations: rec.floorViolations,
    })
    .returning({ id: criticVerdicts.id });
  return r[0]?.id as string;
}

export async function recordDecision(rec: {
  runId: string;
  stepName: string;
  attemptNumber: number;
  decision: string;
  reasoning?: string;
}): Promise<void> {
  if (offline()) {
    store.insert('supervisor_decisions', rec);
    return;
  }
  await db.insert(supervisorDecisions).values(rec);
}

// ── Persist the finished site so the renderer can serve it ──────────────────

export async function saveSiteSpec(projectId: string, spec: SiteSpec): Promise<string> {
  if (offline()) {
    let site = store.findOne('sites', (s) => s.projectId === projectId);
    if (site) {
      store.update('sites', (s) => s.projectId === projectId, {
        brand: spec.brand,
        theme: spec.theme,
        nav: spec.nav,
        seo: spec.seo,
        status: 'staged',
      });
    } else {
      site = store.insert('sites', {
        projectId,
        status: 'staged',
        brand: spec.brand,
        theme: spec.theme,
        nav: spec.nav,
        seo: spec.seo,
      });
    }
    const siteId = site.id;
    // Replace pages + blocks.
    store.writeColl(
      'pages',
      store.readColl('pages').filter((p) => p.siteId !== siteId),
    );
    store.writeColl(
      'page_blocks',
      store.readColl('page_blocks').filter((b) => b.siteId !== siteId),
    );
    for (const page of spec.pages) {
      const pg = store.insert('pages', {
        siteId,
        slug: page.slug,
        title: page.title,
        seo: page.seo,
        order: page.order,
      });
      for (const b of page.blocks) {
        store.insert('page_blocks', {
          siteId, // denormalized for offline cleanup
          pageId: pg.id,
          blockType: b.type,
          variant: b.variant,
          props: b.props,
          order: b.order,
        });
      }
    }
    return siteId;
  }

  // DB path
  const existing = await db.select().from(sites).where(eq(sites.projectId, projectId)).limit(1);
  let siteId = existing[0]?.id;
  if (siteId) {
    await db
      .update(sites)
      .set({ brand: spec.brand, theme: spec.theme, nav: spec.nav, seo: spec.seo, status: 'staged' })
      .where(eq(sites.id, siteId));
    const pageRows = await db.select({ id: pages.id }).from(pages).where(eq(pages.siteId, siteId));
    for (const p of pageRows) await db.delete(pageBlocks).where(eq(pageBlocks.pageId, p.id));
    await db.delete(pages).where(eq(pages.siteId, siteId));
  } else {
    const r = await db
      .insert(sites)
      .values({ projectId, status: 'staged', brand: spec.brand, theme: spec.theme, nav: spec.nav, seo: spec.seo })
      .returning({ id: sites.id });
    siteId = r[0]?.id as string;
  }
  for (const page of spec.pages) {
    const pr = await db
      .insert(pages)
      .values({ siteId, slug: page.slug, title: page.title, seo: page.seo, order: page.order })
      .returning({ id: pages.id });
    const pageId = pr[0]?.id as string;
    for (const b of page.blocks) {
      await db
        .insert(pageBlocks)
        .values({ pageId, blockType: b.type, variant: b.variant, props: b.props, order: b.order });
    }
  }
  return siteId;
}

/** Flip a staged site to published and set the project to preview. */
export async function markSitePreviewReady(projectId: string): Promise<void> {
  if (offline()) {
    store.update('sites', (s) => s.projectId === projectId, { status: 'published', publishedAt: new Date().toISOString() });
    store.update('projects', (p) => p.id === projectId, { status: 'preview' });
    return;
  }
  await db.update(sites).set({ status: 'published', publishedAt: new Date() }).where(eq(sites.projectId, projectId));
  await db.update(projects).set({ status: 'preview' }).where(eq(projects.id, projectId));
}
