import { createAnthropic } from '@ai-sdk/anthropic';
import { gateway } from '@ai-sdk/gateway';
import type { ModelRef } from '@simplesight/contracts';
import { generateText, type LanguageModel, type ModelMessage } from 'ai';
import { estimateCostCents } from './cost';

/**
 * True when this model will run against the DIRECT Anthropic key (not the
 * gateway). Only on the direct path can we attach Anthropic prompt-caching
 * (`cache_control`) and rely on it; the gateway/OpenAI paths ignore it.
 */
export function isAnthropicDirect(model: ModelRef): boolean {
  return model.startsWith('anthropic/') && !!process.env.ANTHROPIC_API_KEY;
}

/**
 * Resolve a "provider/model" ref to a LanguageModel. Anthropic models route
 * through a DIRECT Anthropic key when present (ANTHROPIC_API_KEY) because the
 * free-tier AI Gateway blocks Sonnet/Opus even via BYOK; everything else
 * (OpenAI included) goes through the AI Gateway via its provider/model string.
 * (Single source of truth — shared by all generators.)
 */
export function resolveModel(model: ModelRef): LanguageModel {
  if (isAnthropicDirect(model)) {
    const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    return anthropic(model.replace('anthropic/', '').replace(/\./g, '-')); // claude-opus-4.8 → claude-opus-4-8
  }
  return gateway(model);
}

/** Ephemeral-cache provider options for a system prefix (Anthropic direct only). */
const CACHE_SYSTEM_OPTS = { anthropic: { cacheControl: { type: 'ephemeral' as const, ttl: '1h' as const } } };

/**
 * Build the generateText message/system args. When `cacheSystem` is set and the
 * model runs on the direct Anthropic path, the system prompt becomes a cached
 * ephemeral breakpoint (so repeated calls in a build — every page, the reviser,
 * the critics — reuse the large shared design prefix at ~10% input cost). On any
 * other path we fall back to a plain system+prompt pair.
 */
function buildCallArgs(model: ModelRef, system: string, prompt: string, cacheSystem?: boolean):
  | { system: string; prompt: string }
  | { messages: ModelMessage[] } {
  if (cacheSystem && isAnthropicDirect(model)) {
    return {
      messages: [
        { role: 'system', content: system, providerOptions: CACHE_SYSTEM_OPTS },
        { role: 'user', content: prompt },
      ],
    };
  }
  return { system, prompt };
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
  /** Mark the system prompt as a cached ephemeral prefix (Anthropic-direct only). */
  cacheSystem?: boolean;
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
        ...buildCallArgs(opts.model, opts.system, opts.prompt, opts.cacheSystem),
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

/**
 * Multimodal generation: a text prompt + one image (e.g. a page screenshot) →
 * text. Same routing/retry/cost as resilientGenerateText. Used by the visual
 * critic. The image must be raw bytes + a media type.
 */
export async function generateVision(opts: {
  model: ModelRef;
  system: string;
  text: string;
  image: { bytes: Uint8Array; mediaType: string };
  maxOutputTokens?: number;
  retry?: RetryOptions;
}): Promise<ResilientTextResult> {
  const start = Date.now();
  let attempts = 0;
  const result = await withRetry(async () => {
    attempts++;
    return generateText({
      model: resolveModel(opts.model),
      system: opts.system,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: opts.text },
            { type: 'image', image: opts.image.bytes, mediaType: opts.image.mediaType },
          ],
        },
      ],
      maxOutputTokens: opts.maxOutputTokens ?? 3000,
    });
  }, { label: 'vision', ...opts.retry });
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
