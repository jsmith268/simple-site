import { createAnthropic } from '@ai-sdk/anthropic';
import { gateway } from '@ai-sdk/gateway';
import type { ModelRef } from '@simplesight/contracts';
import { generateText, type LanguageModel } from 'ai';
import { estimateCostCents } from './cost';

/**
 * Resolve a "provider/model" ref to a LanguageModel. Anthropic models route
 * through a DIRECT Anthropic key when present (ANTHROPIC_API_KEY) because the
 * free-tier AI Gateway blocks Sonnet/Opus even via BYOK; everything else goes
 * through the gateway. (Single source of truth — shared by all generators.)
 */
export function resolveModel(model: ModelRef): LanguageModel {
  if (model.startsWith('anthropic/') && process.env.ANTHROPIC_API_KEY) {
    const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    return anthropic(model.replace('anthropic/', '').replace('.', '-')); // claude-opus-4.7 → claude-opus-4-7
  }
  return gateway(model);
}

const TRANSIENT =
  /\b(429|500|502|503|504|529)\b|overload|rate.?limit|timeout|timed out|ETIMEDOUT|ECONNRESET|ECONNREFUSED|EAI_AGAIN|fetch failed|socket hang up/i;

export function isTransient(err: unknown): boolean {
  const e = err as { message?: string; statusCode?: number; status?: number } | undefined;
  const status = e?.statusCode ?? e?.status;
  if (typeof status === 'number' && (status === 429 || status >= 500)) return true;
  return TRANSIENT.test(String(e?.message ?? err ?? ''));
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface RetryOptions {
  /** Total attempts including the first (default 6). */
  maxAttempts?: number;
  /** Base delay in ms; grows ~exponentially with jitter (default 20000 — tuned for Anthropic 529s). */
  baseDelayMs?: number;
  /** Cap per-wait delay (default 60000). */
  maxDelayMs?: number;
  /** Called before each retry sleep. */
  onRetry?: (info: { attempt: number; waitMs: number; err: unknown }) => void;
  label?: string;
}

/**
 * Run an async fn with exponential backoff on TRANSIENT failures only.
 * Non-transient errors throw immediately. This is the one retry primitive the
 * whole codegen pipeline shares (was previously copy-pasted into each script).
 */
export async function withRetry<T>(fn: () => Promise<T>, opts: RetryOptions = {}): Promise<T> {
  const maxAttempts = Math.max(1, opts.maxAttempts ?? 6);
  const base = opts.baseDelayMs ?? 20000;
  const cap = opts.maxDelayMs ?? 60000;
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt >= maxAttempts || !isTransient(err)) throw err;
      const backoff = Math.min(cap, base * 2 ** (attempt - 1));
      const waitMs = Math.round(backoff * (0.75 + Math.random() * 0.5)); // jitter
      opts.onRetry?.({ attempt, waitMs, err });
      if (!opts.onRetry && opts.label) {
        console.error(`[${opts.label}] transient (attempt ${attempt}/${maxAttempts}): ${String((err as Error)?.message ?? err)}. waiting ${Math.round(waitMs / 1000)}s`);
      }
      await sleep(waitMs);
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('withRetry exhausted');
}

export interface ResilientTextResult {
  text: string;
  tokensIn: number;
  tokensOut: number;
  costCents: number;
  ms: number;
  attempts: number;
}

/**
 * generateText with shared model routing, transient retry/backoff, an optional
 * hard timeout, and token/cost accounting. The base call for every text/codegen
 * generator (brief, IA, foundation, page, critics).
 */
export async function resilientGenerateText(opts: {
  model: ModelRef;
  system: string;
  prompt: string;
  maxOutputTokens?: number;
  temperature?: number;
  timeoutMs?: number;
  retry?: RetryOptions;
  abortSignal?: AbortSignal;
}): Promise<ResilientTextResult> {
  const start = Date.now();
  let attempts = 0;
  const result = await withRetry(async () => {
    attempts++;
    const signals: AbortSignal[] = [];
    if (opts.abortSignal) signals.push(opts.abortSignal);
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (opts.timeoutMs) {
      const ac = new AbortController();
      timer = setTimeout(() => ac.abort(new Error(`timeout after ${opts.timeoutMs}ms`)), opts.timeoutMs);
      signals.push(ac.signal);
    }
    try {
      return await generateText({
        model: resolveModel(opts.model),
        system: opts.system,
        prompt: opts.prompt,
        maxOutputTokens: opts.maxOutputTokens ?? 8000,
        ...(opts.temperature != null ? { temperature: opts.temperature } : {}),
        abortSignal: signals.length === 1 ? signals[0] : signals.length > 1 ? AbortSignal.any(signals) : undefined,
      });
    } finally {
      if (timer) clearTimeout(timer);
    }
  }, { label: 'llm', ...opts.retry });

  const tokensIn = result.usage?.inputTokens ?? 0;
  const tokensOut = result.usage?.outputTokens ?? 0;
  return {
    text: result.text ?? '',
    tokensIn,
    tokensOut,
    costCents: estimateCostCents(opts.model, tokensIn, tokensOut),
    ms: Date.now() - start,
    attempts,
  };
}
