import type { ModelRef } from '@simplesight/contracts';

/** Cents per 1M tokens, {in, out}. Approximate; updated as pricing changes. */
const PRICE_TABLE: Record<string, { in: number; out: number }> = {
  'anthropic/claude-haiku-4.5': { in: 100, out: 500 },
  'anthropic/claude-sonnet-4.6': { in: 300, out: 1500 },
  'anthropic/claude-opus-4.7': { in: 1500, out: 7500 },
};

export function estimateCostCents(model: ModelRef, tokensIn: number, tokensOut: number): number {
  const p = PRICE_TABLE[model] ?? { in: 300, out: 1500 };
  return (tokensIn * p.in + tokensOut * p.out) / 1_000_000;
}
