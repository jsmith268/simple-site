import { z } from 'zod';
import type { Verdict } from './ids';

/** AI Gateway model reference, e.g. "anthropic/claude-sonnet-4.6". */
export type ModelRef = string;

export const AgentBudget = z.object({
  maxTokens: z.number().int().positive(),
  maxMs: z.number().int().positive(),
  maxRetries: z.number().int().min(0),
  maxCostCents: z.number().optional(),
});
export type AgentBudget = z.infer<typeof AgentBudget>;

/**
 * Context threaded into every agent invocation by the conductor. Carries the
 * abort signal, the critique from the previous failed attempt (so the producer
 * can fix it), and a sink for recording the raw LLM call for observability.
 */
export interface AgentContext {
  runId: string;
  projectId: string;
  attemptNumber: number;
  /** Critic feedback from the last attempt, fed back so the producer can revise. */
  critiqueFromLastAttempt?: string;
  /** Operator/learning prompt augmentations to append to the system prompt. */
  promptAugmentations?: string[];
  /** Operator-edited skill bodies (skill name → body), applied at runtime. */
  skillOverrides?: Record<string, string>;
  abortSignal?: AbortSignal;
  /** Record a single LLM call for the operator inspector + cost tracking. */
  recordCall?: (call: InvocationRecord) => void;
  /** True when running without live API keys — agents return deterministic mocks. */
  offline: boolean;
}

export interface InvocationRecord {
  agent: string;
  model: ModelRef;
  systemPrompt: string;
  userMessage: string;
  rawOutput: string;
  parsedOutput?: unknown;
  tokensIn: number;
  tokensOut: number;
  costCents: number;
  ms: number;
}

export interface AgentResult<O> {
  output: O;
  costCents: number;
  tokensIn: number;
  tokensOut: number;
}

/** A producer agent: pure transform from input to a validated artifact. */
export interface Agent<I, O> {
  name: string;
  version: string;
  model: ModelRef;
  budget: AgentBudget;
  invoke(input: I, ctx: AgentContext): Promise<AgentResult<O>>;
}

/** A single problem a critic found in an artifact. */
export const Finding = z.object({
  axis: z.string(), // which dimension (e.g. "contrast", "voice", "schema")
  severity: z.enum(['block', 'warn', 'info']),
  message: z.string(),
  /** Optional pointer at the offending unit (block id, page slug). */
  target: z.string().optional(),
});
export type Finding = z.infer<typeof Finding>;

export const CriticVerdict = z.object({
  verdict: z.custom<Verdict>(),
  score: z.number().min(0).max(1),
  reasons: z.array(z.string()).default([]),
  suggestions: z.array(z.string()).default([]),
  axes: z.record(z.number()).default({}),
  findings: z.array(Finding).default([]),
  floorViolations: z.array(z.string()).default([]),
});
export type CriticVerdict = z.infer<typeof CriticVerdict>;

/** A read-only critic: scores an artifact, never mutates it. */
export interface Critic<A> {
  name: string;
  /** Hard floor on `score` — any artifact below this is forced to `reject`. */
  scoreFloor: number;
  review(artifact: A, ctx: AgentContext): Promise<CriticVerdict>;
}
