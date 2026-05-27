import type { Agent, AgentBudget, AgentContext } from '@simplesight/contracts';
import { skillsForAgent } from '@simplesight/skills';
import type { z } from 'zod';
import { selectAgentModel, TIERS } from './model-routing';
import { runStructured } from './llm-runner';

export const DEFAULT_BUDGET: AgentBudget = { maxTokens: 4000, maxMs: 90_000, maxRetries: 2 };

/** Build the expertise block from the skills attached to this agent, applying
 * any operator-edited skill-body overrides. */
function skillsBlock(agentName: string, overrides?: Record<string, string>): { text: string; names: string[] } {
  const skills = skillsForAgent(agentName);
  if (!skills.length) return { text: '', names: [] };
  const text = `\n\n# Expertise you must apply\n${skills
    .map((s) => `## ${s.name} — ${s.summary}\n${overrides?.[s.name] ?? s.body}`)
    .join('\n\n')}`;
  return { text, names: skills.map((s) => s.name) };
}

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
      const skills = skillsBlock(cfg.name, ctx.skillOverrides);
      const system = `${cfg.system(input, ctx)}${skills.text}`;
      let prompt = cfg.prompt(input, ctx);
      if (ctx.critiqueFromLastAttempt) {
        prompt += `\n\nThe previous attempt was rejected for these reasons. Fix them:\n${ctx.critiqueFromLastAttempt}`;
      }

      if (ctx.offline) {
        const output = await cfg.offline(input, ctx);
        // Record what WOULD be sent live, so the operator console shows the
        // resolved system prompt, variables, and attached skills for every step.
        ctx.recordCall?.({
          agent: cfg.name,
          model: `offline (deterministic) · skills: ${skills.names.join(', ') || 'none'}`,
          systemPrompt: system,
          userMessage: prompt,
          rawOutput: '(deterministic build — no LLM call; this is what would be sent live)',
          parsedOutput: output,
          tokensIn: 0,
          tokensOut: 0,
          costCents: 0,
          ms: 0,
        });
        return { output, costCents: 0, tokensIn: 0, tokensOut: 0 };
      }

      const model = selectAgentModel(cfg.name, { attemptNumber: ctx.attemptNumber });
      const res = await runStructured(
        { agent: cfg.name, model, schema: cfg.schema, system, prompt, temperature: cfg.temperature },
        ctx,
        budget,
      );
      return { output: res.output, costCents: res.costCents, tokensIn: res.tokensIn, tokensOut: res.tokensOut };
    },
  };
}
