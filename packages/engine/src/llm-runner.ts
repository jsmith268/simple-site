import type { AgentBudget, AgentContext, ModelRef } from '@simplesight/contracts';
import { generateText, Output } from 'ai';
import type { z } from 'zod';
import { estimateCostCents } from './cost';
import { resilientGenerateText, resolveModel } from './resilient';

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
        model: resolveModel(opts.model),
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

/**
 * One-shot structured generation (no conductor/context) — used by the AI
 * content generator. Returns the validated output + token usage.
 */
export async function generateStructured<T>(opts: {
  model: ModelRef;
  schema: z.ZodType<T, z.ZodTypeDef, any>;
  system: string;
  prompt: string;
  maxOutputTokens?: number;
  temperature?: number;
}): Promise<{ output: T; tokensIn: number; tokensOut: number }> {
  const result = await generateText({
    model: resolveModel(opts.model),
    system: opts.system,
    prompt: opts.prompt,
    output: Output.object({ schema: opts.schema }),
    maxOutputTokens: opts.maxOutputTokens ?? 8000,
    temperature: opts.temperature ?? 0.7,
  });
  return {
    output: result.output as T,
    tokensIn: result.usage?.inputTokens ?? 0,
    tokensOut: result.usage?.outputTokens ?? 0,
  };
}

/**
 * Structured generation via TEXT + JSON parse (no tool-mode Output.object).
 * This sidesteps the Anthropic + AI-SDK-v6 empty-`{}` tool_use bug on complex
 * nested schemas. Validates with the Zod schema; retries on parse/validation fail.
 */
export async function generateJson<T>(opts: {
  model: ModelRef;
  schema: z.ZodType<T, z.ZodTypeDef, any>;
  system: string;
  prompt: string;
  maxOutputTokens?: number;
  retries?: number;
}): Promise<T> {
  const system = `${opts.system}\n\nOUTPUT FORMAT: respond with ONLY one valid JSON object — no markdown, no code fences, no commentary before or after.`;
  let lastErr: unknown;
  for (let i = 0; i <= (opts.retries ?? 2); i++) {
    // resilientGenerateText absorbs transient (529/timeout) failures with backoff;
    // this outer loop only re-rolls on parse/validation failure.
    const r = await resilientGenerateText({
      model: opts.model,
      system,
      prompt: opts.prompt,
      maxOutputTokens: opts.maxOutputTokens ?? 8000,
    });
    try {
      let txt = (r.text ?? '').trim();
      txt = txt.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
      const s = txt.indexOf('{');
      const e = txt.lastIndexOf('}');
      if (s < 0 || e < 0) throw new Error('no JSON object in output');
      const obj = JSON.parse(txt.slice(s, e + 1));
      const parsed = opts.schema.safeParse(obj);
      if (parsed.success) return parsed.data;
      lastErr = new Error(`schema validation failed: ${JSON.stringify(parsed.error.issues.slice(0, 4))}`);
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('generateJson failed');
}
