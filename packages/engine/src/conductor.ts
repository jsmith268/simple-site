import type { Agent, AgentContext, Critic, CriticVerdict } from '@simplesight/contracts';
import {
  completedStepOutput,
  recordArtifact,
  recordDecision,
  recordInvocation,
  recordStep,
  recordVerdict,
} from '@simplesight/db';
import { logger } from '@simplesight/observability';
import { supervise } from './supervisor';

export interface RunStepParams<I, O> {
  runId: string;
  projectId: string;
  stepName: string;
  producer: Agent<I, O>;
  critic?: Critic<O>;
  input: I;
  offline: boolean;
  maxRevisions?: number;
  /** Idempotency keys completed on a prior attempt — skip + reload (resume). */
  resume?: Set<string>;
  promptAugmentations?: string[];
  abortSignal?: AbortSignal;
  /** Deterministic value used if the producer fails — guarantees the step yields. */
  fallback?: () => O | Promise<O>;
  onCost?: (cents: number) => void;
}

/**
 * Run one pipeline stage: producer → critic → supervisor, with a bounded revise
 * loop. Checkpoints to the DB (resumable). If the producer fails outright and a
 * fallback is provided, the fallback is used — the step always yields an output.
 */
export async function runStep<I, O>(p: RunStepParams<I, O>): Promise<O> {
  const key = `${p.runId}:${p.stepName}`;
  const maxRevisions = p.maxRevisions ?? 2;

  if (p.resume?.has(key)) {
    const prev = await completedStepOutput(p.runId, key);
    if (prev !== undefined) {
      logger.debug('conductor.resume: skipping completed step', { stepName: p.stepName });
      return prev as O;
    }
  }

  await recordStep({ runId: p.runId, stepName: p.stepName, status: 'running', attemptNumber: 1, idempotencyKey: key });

  let callIndex = 0;
  let totalCost = 0;
  let critique: string | undefined;
  let finalOutput: O | undefined;
  let lastVerdict: CriticVerdict | undefined;
  let usedFallback = false;

  try {
    for (let attempt = 1; attempt <= maxRevisions + 1; attempt++) {
      const ctx: AgentContext = {
        runId: p.runId,
        projectId: p.projectId,
        attemptNumber: attempt,
        offline: p.offline,
        critiqueFromLastAttempt: critique,
        promptAugmentations: p.promptAugmentations,
        abortSignal: p.abortSignal,
        recordCall: (call) => {
          void recordInvocation({
            runId: p.runId,
            stepName: p.stepName,
            attemptNumber: attempt,
            callIndex: callIndex++,
            mode: p.offline ? 'offline' : 'live',
            ...call,
          });
        },
      };

      const res = await p.producer.invoke(p.input, ctx);
      totalCost += res.costCents;
      p.onCost?.(res.costCents);
      finalOutput = res.output;

      if (!p.critic) break;

      const verdict = await p.critic.review(res.output, ctx);
      lastVerdict = verdict;
      const decision = supervise({ verdict, attemptNumber: attempt, maxRevisions });
      await recordDecision({
        runId: p.runId,
        stepName: p.stepName,
        attemptNumber: attempt,
        decision: decision.decision,
        reasoning: decision.reasoning,
      });
      if (decision.decision === 'retry_producer' && attempt <= maxRevisions) {
        critique = decision.critique;
        continue;
      }
      break;
    }
  } catch (err) {
    if (!p.fallback) {
      await recordStep({
        runId: p.runId,
        stepName: p.stepName,
        status: 'failed',
        attemptNumber: 1,
        idempotencyKey: key,
        errorMessage: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
    logger.warn('conductor: producer failed, using deterministic fallback', {
      stepName: p.stepName,
      error: err instanceof Error ? err.message : String(err),
    });
    finalOutput = await p.fallback();
    usedFallback = true;
  }

  const artifactId = await recordArtifact({
    runId: p.runId,
    type: p.stepName,
    producedByAgent: p.producer.name,
    inlineJson: finalOutput,
    costCents: totalCost,
  });
  let verdictId: string | undefined;
  if (lastVerdict && p.critic) {
    verdictId = await recordVerdict({
      artifactId,
      criticName: p.critic.name,
      verdict: lastVerdict.verdict,
      score: lastVerdict.score,
      reasons: lastVerdict.reasons,
      findings: lastVerdict.findings,
      floorViolations: lastVerdict.floorViolations,
    });
  }
  await recordStep({
    runId: p.runId,
    stepName: p.stepName,
    status: 'completed',
    attemptNumber: 1,
    idempotencyKey: key,
    artifactId,
    criticVerdictId: verdictId,
    errorMessage: usedFallback ? 'used deterministic fallback' : undefined,
  });

  return finalOutput as O;
}
