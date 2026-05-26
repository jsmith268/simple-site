import type { CriticVerdict, SupervisorDecision } from '@simplesight/contracts';

export interface SupervisorInput {
  verdict: CriticVerdict;
  attemptNumber: number;
  maxRevisions: number;
}

export interface SupervisorOutput {
  decision: SupervisorDecision;
  reasoning: string;
  /** Critique to feed the producer when retrying. */
  critique?: string;
}

/**
 * The never-kill supervisor. Quality failures NEVER abort the build — they
 * converge (retry within budget) or escalate-and-continue (accept current best;
 * the convergence gate + the deterministic baseline guarantee a shippable site).
 * Only the convergence gate may decide hold_for_human, never a kill.
 */
export function supervise({ verdict, attemptNumber, maxRevisions }: SupervisorInput): SupervisorOutput {
  if (verdict.verdict === 'pass') {
    return { decision: 'continue', reasoning: 'critic passed' };
  }

  const floorHit = (verdict.floorViolations?.length ?? 0) > 0;

  if (verdict.verdict === 'revise' && !floorHit && attemptNumber <= maxRevisions) {
    return {
      decision: 'retry_producer',
      reasoning: `revise (attempt ${attemptNumber}/${maxRevisions})`,
      critique: [...(verdict.reasons ?? []), ...(verdict.suggestions ?? [])].join('\n'),
    };
  }

  // Out of revision budget, hard reject, or floor violation: escalate but
  // continue with the current best output (never lose the customer's site).
  return {
    decision: 'escalate',
    reasoning: floorHit
      ? `floor violation: ${verdict.floorViolations?.join('; ')}`
      : `accepting best after ${attemptNumber} attempt(s); verdict=${verdict.verdict}`,
  };
}
