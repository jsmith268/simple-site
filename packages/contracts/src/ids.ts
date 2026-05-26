import { z } from 'zod';

/** Lifecycle of a customer's project, purchase → live (or refunded). */
export const ProjectStatus = z.enum([
  'purchased', // paid, awaiting onboarding
  'onboarding', // filling intake
  'queued', // intake complete, build not yet started
  'building', // pipeline running
  'preview', // built, customer can preview at username.simplesight.co
  'changes_requested', // customer asked for edits (scoped re-run)
  'approved', // customer approved; awaiting go-live / hosting
  'live', // published on a real domain
  'refunded',
  'cancelled',
]);
export type ProjectStatus = z.infer<typeof ProjectStatus>;

/** Per-stage execution status inside a pipeline run. */
export const StageStatus = z.enum(['queued', 'running', 'completed', 'failed', 'skipped']);
export type StageStatus = z.infer<typeof StageStatus>;

/** A critic's verdict on a producer's artifact. */
export const Verdict = z.enum(['pass', 'revise', 'reject']);
export type Verdict = z.infer<typeof Verdict>;

/** What the supervisor decided to do after reading a verdict. Never `kill` on quality. */
export const SupervisorDecision = z.enum([
  'continue',
  'retry_producer',
  'escalate',
  'hold_for_human',
]);
export type SupervisorDecision = z.infer<typeof SupervisorDecision>;

/** Kind of pipeline campaign. */
export const CampaignKind = z.enum(['initial_build', 'change_request']);
export type CampaignKind = z.infer<typeof CampaignKind>;

export const EscalationSeverity = z.enum(['info', 'warn', 'critical']);
export type EscalationSeverity = z.infer<typeof EscalationSeverity>;

/** Hosting / domain provisioning step status machine. */
export const ConnectionStepName = z.enum([
  'deploy',
  'domain_attach',
  'dns_records',
  'dns_verify',
  'ssl_issue',
  'smoke_test',
  'marked_live',
]);
export type ConnectionStepName = z.infer<typeof ConnectionStepName>;
