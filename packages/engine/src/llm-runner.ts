import { gateway } from '@ai-sdk/gateway';
import type { AgentBudget, AgentContext, ModelRef } from '@simplesight/contracts';
import { generateText, Output } from 'ai';
import type { z } from 'zod';
import { estimateCostCents } from './cost';

export interface RunStructuredOpts<T> {
  agent: string;
  model: ModelRef;
  schema: z.ZodType<T, z.ZodTypeDef, any>;
  system: string;
  prompt: string;
  maxOutputTokens?: number;
  temperature?: number;
}

export interface RunResult<T> {
  output: T;
  raw: string;
  tokensIn: number;
  tokensOut: number;
  costCents: number;
  ms: number;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Live structured generation via AI SDK v6 + Vercel AI Gateway. Validates output
 * against a Zod schema (Output.object). Retries transient failures with backoff.
 * Records the call into ctx for the operator inspector + cost tracking.
 * Only called when ctx.offline is false — agents own the offline path.
 */
export async function runStructured<T>(
  opts: RunStructuredOpts<T>,
  ctx: AgentContext,
  budget: AgentBudget,
): Promise<RunResult<T>> {
  const maxAttempts = Math.max(1, (budget.maxRetries ?? 1) + 1);
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const start = Date.now();
    try {
      const result = await generateText({
        model: gateway(opts.model),
        system: opts.system,
        prompt: opts.prompt,
        output: Output.object({ schema: opts.schema }),
        maxOutputTokens: opts.maxOutputTokens ?? budget.maxTokens,
        temperature: opts.temperature ?? 0.7,
        abortSignal: ctx.abortSignal,
      });
      const output = result.output as T;
      const tokensIn = result.usage?.inputTokens ?? 0;
      const tokensOut = result.usage?.outputTokens ?? 0;
      const costCents = estimateCostCents(opts.model, tokensIn, tokensOut);
      const ms = Date.now() - start;
      ctx.recordCall?.({
        agent: opts.agent,
        model: opts.model,
        systemPrompt: opts.system,
        userMessage: opts.prompt,
        rawOutput: result.text ?? JSON.stringify(output),
        parsedOutput: output,
        tokensIn,
        tokensOut,
        costCents,
        ms,
      });
      return { output, raw: result.text ?? '', tokensIn, tokensOut, costCents, ms };
    } catch (err) {
      lastErr = err;
      if (attempt < maxAttempts) await sleep(attempt * 1000);
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('runStructured failed');
}
