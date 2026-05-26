import { hasDatabase } from '@simplesight/env';
import { asc, desc, eq, isNull } from 'drizzle-orm';
import { db } from '../client';
import { escalations, fleetSettings } from '../schema/orchestration';
import {
  agentInvocationDetails as invT,
  criticVerdicts as verT,
  pipelineRuns as runT,
  supervisorDecisions as decT,
  workflowSteps as stepT,
} from '../schema/orchestration';
import * as store from '../offline-store';

const offline = () => !hasDatabase();

export interface RunSummary {
  id: string;
  status: string;
  attemptNumber: number;
  costCents: number;
  startedAt?: string;
  finishedAt?: string;
}

export async function listRunsForProject(projectId: string): Promise<RunSummary[]> {
  if (offline()) {
    return store
      .findMany('pipeline_runs', (r) => r.projectId === projectId)
      .sort((a, b) => String(b.startedAt).localeCompare(String(a.startedAt))) as RunSummary[];
  }
  const rows = await db.select().from(runT).where(eq(runT.projectId, projectId)).orderBy(desc(runT.startedAt));
  return rows.map((r) => ({
    id: r.id,
    status: r.status,
    attemptNumber: r.attemptNumber,
    costCents: r.costCents,
    startedAt: r.startedAt?.toISOString(),
    finishedAt: r.finishedAt?.toISOString(),
  }));
}

export interface StepView {
  stepName: string;
  status: string;
  attemptNumber: number;
  errorMessage?: string;
  artifactId?: string;
  criticVerdictId?: string;
}
export interface RunDetail {
  run: RunSummary | null;
  steps: StepView[];
  verdicts: Record<string, unknown>[];
  decisions: Record<string, unknown>[];
  invocations: Record<string, unknown>[];
}

export async function getRunDetail(runId: string): Promise<RunDetail> {
  if (offline()) {
    const run = store.findOne('pipeline_runs', (r) => r.id === runId) as RunSummary | undefined;
    const steps = store
      .findMany('workflow_steps', (s) => s.runId === runId)
      .sort((a, b) => String(a.startedAt).localeCompare(String(b.startedAt))) as unknown as StepView[];
    return {
      run: run ?? null,
      steps,
      verdicts: store.readColl('critic_verdicts'),
      decisions: store.findMany('supervisor_decisions', (d) => d.runId === runId),
      invocations: store.findMany('agent_invocation_details', (i) => i.runId === runId),
    };
  }
  const runRows = await db.select().from(runT).where(eq(runT.id, runId)).limit(1);
  const r = runRows[0];
  const steps = await db.select().from(stepT).where(eq(stepT.runId, runId)).orderBy(asc(stepT.startedAt));
  const decisions = await db.select().from(decT).where(eq(decT.runId, runId));
  const invocations = await db.select().from(invT).where(eq(invT.runId, runId));
  const verdicts = await db.select().from(verT);
  return {
    run: r
      ? {
          id: r.id,
          status: r.status,
          attemptNumber: r.attemptNumber,
          costCents: r.costCents,
          startedAt: r.startedAt?.toISOString(),
          finishedAt: r.finishedAt?.toISOString(),
        }
      : null,
    steps: steps.map((s) => ({
      stepName: s.stepName,
      status: s.status,
      attemptNumber: s.attemptNumber,
      errorMessage: s.errorMessage ?? undefined,
      artifactId: s.artifactId ?? undefined,
      criticVerdictId: s.criticVerdictId ?? undefined,
    })),
    verdicts: verdicts as unknown as Record<string, unknown>[],
    decisions: decisions as unknown as Record<string, unknown>[],
    invocations: invocations as unknown as Record<string, unknown>[],
  };
}

// ── Fleet settings / kill switch ────────────────────────────────────────────

export interface FleetSettings {
  killSwitchEngaged: boolean;
  autonomousMode: string;
  dailyBudgetCeilingCents: number;
}

export async function getFleetSettings(): Promise<FleetSettings> {
  if (offline()) {
    const f = store.findOne('fleet_settings', (r) => r.id === 'fleet');
    return {
      killSwitchEngaged: f?.killSwitchEngaged === true || f?.killSwitchEngaged === 'true',
      autonomousMode: f?.autonomousMode ?? 'off',
      dailyBudgetCeilingCents: f?.dailyBudgetCeilingCents ?? 50000,
    };
  }
  const rows = await db.select().from(fleetSettings).where(eq(fleetSettings.id, 'fleet')).limit(1);
  const f = rows[0];
  return {
    killSwitchEngaged: f?.killSwitchEngaged === 'true',
    autonomousMode: f?.autonomousMode ?? 'off',
    dailyBudgetCeilingCents: f?.dailyBudgetCeilingCents ?? 50000,
  };
}

export async function setKillSwitch(engaged: boolean, reason?: string): Promise<void> {
  if (offline()) {
    store.upsert('fleet_settings', (r) => r.id === 'fleet', {
      id: 'fleet',
      killSwitchEngaged: engaged,
      killSwitchReason: reason,
      autonomousMode: 'off',
      dailyBudgetCeilingCents: 50000,
    });
    return;
  }
  await db
    .insert(fleetSettings)
    .values({ id: 'fleet', killSwitchEngaged: String(engaged), killSwitchReason: reason })
    .onConflictDoUpdate({
      target: fleetSettings.id,
      set: { killSwitchEngaged: String(engaged), killSwitchReason: reason, updatedAt: new Date() },
    });
}

/** Runs stuck in 'running' past the threshold — the watchdog re-triggers them. */
export async function findStaleRuns(thresholdMs: number): Promise<{ id: string; projectId: string }[]> {
  const cutoff = Date.now() - thresholdMs;
  if (offline()) {
    return store
      .findMany('pipeline_runs', (r) => r.status === 'running' && new Date(r.startedAt ?? 0).getTime() < cutoff)
      .map((r) => ({ id: r.id as string, projectId: r.projectId as string }));
  }
  const rows = await db.select().from(runT).where(eq(runT.status, 'running'));
  return rows
    .filter((r) => (r.startedAt?.getTime() ?? 0) < cutoff)
    .map((r) => ({ id: r.id, projectId: r.projectId }));
}

/** Total spend (cents) across runs started today — the cost sentinel's input. */
export async function getTodaySpendCents(): Promise<number> {
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const t = dayStart.getTime();
  if (offline()) {
    return store
      .readColl('pipeline_runs')
      .filter((r) => new Date(r.startedAt ?? 0).getTime() >= t)
      .reduce((sum, r) => sum + (Number(r.costCents) || 0), 0);
  }
  const rows = await db.select().from(runT);
  return rows.filter((r) => (r.startedAt?.getTime() ?? 0) >= t).reduce((s, r) => s + (r.costCents ?? 0), 0);
}

// ── Escalations ─────────────────────────────────────────────────────────────

export async function listOpenEscalations(): Promise<Record<string, unknown>[]> {
  if (offline()) {
    return store.findMany('escalations', (e) => !e.handledAt);
  }
  const rows = await db.select().from(escalations).where(isNull(escalations.handledAt));
  return rows as unknown as Record<string, unknown>[];
}
