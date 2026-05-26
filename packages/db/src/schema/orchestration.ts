import {
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { projects } from './core';

const now = () => timestamp('created_at', { withTimezone: true }).defaultNow().notNull();

/** Umbrella over one or more attempts to build (or change) a site. */
export const pipelineCampaigns = pgTable('pipeline_campaigns', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  kind: text('kind').notNull(), // initial_build | change_request
  status: text('status').notNull().default('in_progress'),
  currentAttempt: integer('current_attempt').notNull().default(1),
  maxAttempts: integer('max_attempts').notNull().default(5),
  totalCostCents: integer('total_cost_cents').notNull().default(0),
  finalOutcome: text('final_outcome'),
  createdAt: now(),
});

/** One execution attempt. workflowRunId links to the Workflow DevKit run. */
export const pipelineRuns = pgTable(
  'pipeline_runs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    campaignId: uuid('campaign_id').references(() => pipelineCampaigns.id, { onDelete: 'cascade' }),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    workflowRunId: text('workflow_run_id'),
    status: text('status').notNull().default('running'),
    attemptNumber: integer('attempt_number').notNull().default(1),
    triggerReason: text('trigger_reason').notNull().default('initial'),
    costCents: integer('cost_cents').notNull().default(0),
    startedAt: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
    finishedAt: timestamp('finished_at', { withTimezone: true }),
  },
  (t) => ({ byProject: index('runs_project_idx').on(t.projectId) }),
);

/** Per-stage checkpoint. idempotencyKey dedupes re-runs after a crash/resume. */
export const workflowSteps = pgTable(
  'workflow_steps',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    runId: uuid('run_id')
      .notNull()
      .references(() => pipelineRuns.id, { onDelete: 'cascade' }),
    stepName: text('step_name').notNull(),
    status: text('status').notNull().default('queued'),
    attemptNumber: integer('attempt_number').notNull().default(1),
    idempotencyKey: text('idempotency_key').notNull(),
    artifactId: uuid('artifact_id'),
    criticVerdictId: uuid('critic_verdict_id'),
    errorMessage: text('error_message'),
    startedAt: timestamp('started_at', { withTimezone: true }),
    endedAt: timestamp('ended_at', { withTimezone: true }),
    createdAt: now(),
  },
  (t) => ({
    idemUq: uniqueIndex('steps_idem_uq').on(t.idempotencyKey),
    byRun: index('steps_run_idx').on(t.runId),
  }),
);

/** Content-addressed output store; large blobs go to Vercel Blob via blobUrl. */
export const artifacts = pgTable('artifacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  runId: uuid('run_id').references(() => pipelineRuns.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  producedByAgent: text('produced_by_agent'),
  agentVersion: text('agent_version'),
  parents: jsonb('parents'), // string[] of parent artifact ids (provenance DAG)
  inputHash: text('input_hash'),
  blobUrl: text('blob_url'),
  inlineJson: jsonb('inline_json'),
  costCents: integer('cost_cents').notNull().default(0),
  createdAt: now(),
});

export const criticVerdicts = pgTable('critic_verdicts', {
  id: uuid('id').primaryKey().defaultRandom(),
  artifactId: uuid('artifact_id').references(() => artifacts.id, { onDelete: 'cascade' }),
  criticName: text('critic_name').notNull(),
  verdict: text('verdict').notNull(), // pass | revise | reject
  score: numeric('score'),
  reasons: jsonb('reasons'),
  suggestions: jsonb('suggestions'),
  axes: jsonb('axes'),
  findings: jsonb('findings'),
  floorViolations: jsonb('floor_violations'),
  costCents: integer('cost_cents').notNull().default(0),
  createdAt: now(),
});

export const supervisorDecisions = pgTable('supervisor_decisions', {
  id: uuid('id').primaryKey().defaultRandom(),
  runId: uuid('run_id').references(() => pipelineRuns.id, { onDelete: 'cascade' }),
  stepName: text('step_name').notNull(),
  attemptNumber: integer('attempt_number').notNull().default(1),
  decision: text('decision').notNull(), // continue | retry_producer | escalate | hold_for_human
  reasoning: text('reasoning'),
  criticVerdictId: uuid('critic_verdict_id'),
  createdAt: now(),
});

/** Full per-LLM-call transparency — powers the operator inspector. */
export const agentInvocationDetails = pgTable(
  'agent_invocation_details',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    runId: uuid('run_id')
      .notNull()
      .references(() => pipelineRuns.id, { onDelete: 'cascade' }),
    stepName: text('step_name').notNull(),
    attemptNumber: integer('attempt_number').notNull().default(1),
    callIndex: integer('call_index').notNull().default(0),
    agent: text('agent').notNull(),
    mode: text('mode').notNull().default('live'), // live | offline
    model: text('model'),
    systemPrompt: text('system_prompt'),
    userMessage: text('user_message'),
    rawOutput: text('raw_output'),
    parsedOutput: jsonb('parsed_output'),
    tokensIn: integer('tokens_in').notNull().default(0),
    tokensOut: integer('tokens_out').notNull().default(0),
    costCents: integer('cost_cents').notNull().default(0),
    ms: integer('ms').notNull().default(0),
    createdAt: now(),
  },
  (t) => ({ byRunStep: index('invocations_run_step_idx').on(t.runId, t.stepName, t.attemptNumber) }),
);

export const agentCostsDaily = pgTable(
  'agent_costs_daily',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    date: text('date').notNull(), // YYYY-MM-DD
    provider: text('provider').notNull(),
    costCents: integer('cost_cents').notNull().default(0),
  },
  (t) => ({ dayProviderUq: uniqueIndex('costs_day_provider_uq').on(t.date, t.provider) }),
);

/** Singleton policy row (id = 'fleet'). */
export const fleetSettings = pgTable('fleet_settings', {
  id: text('id').primaryKey().default('fleet'),
  autonomousMode: text('autonomous_mode').notNull().default('off'), // off | preview | full
  dailyBudgetCeilingCents: integer('daily_budget_ceiling_cents').notNull().default(50000),
  perRunMaxRetries: integer('per_run_max_retries').notNull().default(5),
  perStageMaxRevisions: integer('per_stage_max_revisions').notNull().default(2),
  qualityFloors: jsonb('quality_floors'),
  killSwitchEngaged: text('kill_switch_engaged').notNull().default('false'),
  killSwitchReason: text('kill_switch_reason'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const escalations = pgTable('escalations', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  runId: uuid('run_id'),
  kind: text('kind').notNull(),
  severity: text('severity').notNull().default('warn'),
  body: text('body'),
  handledAt: timestamp('handled_at', { withTimezone: true }),
  handledBy: text('handled_by'),
  createdAt: now(),
});
