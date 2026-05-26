import type { Agent, AgentBudget, AgentContext } from '@simplesight/contracts';
import type { z } from 'zod';
import { selectAgentModel, TIERS } from './model-routing';
import { runStructured } from './llm-runner';

export const DEFAULT_BUDGET: AgentBudget = { maxTokens: 4000, maxMs: 90_000, maxRetries: 2 };

export interface AgentConfig<I, O> {
  name: string;
  version?: string;
  schema: z.ZodType<O, z.ZodTypeDef, any>;
  budget?: AgentBudget;
  temperature?: number;
  /** Build the system + user prompt from the input (live mode). */
  system: (input: I, ctx: AgentContext) => string;
  prompt: (input: I, ctx: AgentContext) => string;
  /** Deterministic output when offline (no API keys) — the always-works path. */
  offline: (input: I, ctx: AgentContext) => O | Promise<O>;
}

/**
 * Build a producer Agent. Offline → deterministic `offline()`. Live →
 * structured LLM call, schema-validated, with the critic's prior critique fed
 * back via ctx.critiqueFromLastAttempt.
 */
export function defineAgent<I, O>(cfg: AgentConfig<I, O>): Agent<I, O> {
  const budget = cfg.budget ?? DEFAULT_BUDGET;
  return {
    name: cfg.name,
    version: cfg.version ?? '1',
    model: TIERS.mid,
    budget,
    async invoke(input, ctx) {
      if (ctx.offline) {
        const output = await cfg.offline(input, ctx);
        return { output, costCents: 0, tokensIn: 0, tokensOut: 0 };
      }
      const model = selectAgentModel(cfg.name, { attemptNumber: ctx.attemptNumber });
      let prompt = cfg.prompt(input, ctx);
      if (ctx.critiqueFromLastAttempt) {
        prompt += `\n\nThe previous attempt was rejected for these reasons. Fix them:\n${ctx.critiqueFromLastAttempt}`;
      }
      const res = await runStructured(
        { agent: cfg.name, model, schema: cfg.schema, system: cfg.system(input, ctx), prompt, temperature: cfg.temperature },
        ctx,
        budget,
      );
      return { output: res.output, costCents: res.costCents, tokensIn: res.tokensIn, tokensOut: res.tokensOut };
    },
  };
}
