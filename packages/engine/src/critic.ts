import type { AgentContext, Critic, CriticVerdict } from '@simplesight/contracts';
import { z } from 'zod';
import { DEFAULT_BUDGET } from './agent';
import { selectAgentModel } from './model-routing';
import { runStructured } from './llm-runner';

/** The uniform shape every LLM critic returns. */
export const LlmCriticSchema = z.object({
  verdict: z.enum(['pass', 'revise', 'reject']),
  score: z.number().min(0).max(1),
  reasons: z.array(z.string()).default([]),
  suggestions: z.array(z.string()).default([]),
});

export interface CriticConfig<A> {
  name: string;
  scoreFloor: number;
  temperature?: number;
  system: (artifact: A, ctx: AgentContext) => string;
  prompt: (artifact: A, ctx: AgentContext) => string;
  /** Deterministic verdict when offline — defaults to a clean pass. */
  offline?: (artifact: A, ctx: AgentContext) => CriticVerdict | Promise<CriticVerdict>;
}

/** Force `reject` when score is below the critic's hard floor (defense-in-depth). */
export function enforceFloor(verdict: CriticVerdict, scoreFloor: number, criticName: string): CriticVerdict {
  if (verdict.score < scoreFloor) {
    return {
      ...verdict,
      verdict: 'reject',
      floorViolations: [...(verdict.floorViolations ?? []), `${criticName}: score ${verdict.score} < floor ${scoreFloor}`],
    };
  }
  return verdict;
}

const cleanPass: CriticVerdict = {
  verdict: 'pass',
  score: 1,
  reasons: [],
  suggestions: [],
  axes: {},
  findings: [],
  floorViolations: [],
};

/** Build a read-only critic. Offline → deterministic pass (the floor is valid by construction). */
export function buildLlmCritic<A>(cfg: CriticConfig<A>): Critic<A> {
  return {
    name: cfg.name,
    scoreFloor: cfg.scoreFloor,
    async review(artifact, ctx) {
      if (ctx.offline) {
        const v = cfg.offline ? await cfg.offline(artifact, ctx) : cleanPass;
        return enforceFloor(v, cfg.scoreFloor, cfg.name);
      }
      const model = selectAgentModel(cfg.name, { attemptNumber: ctx.attemptNumber });
      const res = await runStructured(
        {
          agent: cfg.name,
          model,
          schema: LlmCriticSchema,
          system: cfg.system(artifact, ctx),
          prompt: cfg.prompt(artifact, ctx),
          temperature: cfg.temperature ?? 0.2,
          maxOutputTokens: 1500,
        },
        ctx,
        DEFAULT_BUDGET,
      );
      const v: CriticVerdict = {
        verdict: res.output.verdict,
        score: res.output.score,
        reasons: res.output.reasons ?? [],
        suggestions: res.output.suggestions ?? [],
        axes: {},
        findings: [],
        floorViolations: [],
      };
      return enforceFloor(v, cfg.scoreFloor, cfg.name);
    },
  };
}
