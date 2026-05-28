import type { ModelRef } from '@simplesight/contracts';

/**
 * Canonical model ids (AI Gateway `provider/model` strings). Opus is the newest
 * 4.8; the GPT engine string is overridable via env so the exact gateway id can
 * be corrected without a code change.
 */
export const MODELS = {
  opus: 'anthropic/claude-opus-4.8',
  sonnet: 'anthropic/claude-sonnet-4.6',
  haiku: 'anthropic/claude-haiku-4.5',
  gpt: process.env.SIMPLESIGHT_MODEL_GPT ?? 'openai/gpt-5.5',
} as const;

/** Capability tiers → model ids. Deep is the newest Opus. */
export const TIERS = {
  quick: MODELS.haiku,
  mid: MODELS.sonnet,
  deep: MODELS.opus,
} as const;

export type Tier = keyof typeof TIERS;

/**
 * The two engines a customer's site is built with IN PARALLEL for the
 * generate-and-compare flow. A = Claude Opus 4.8, B = OpenAI GPT-5.5. Both are
 * env-overridable so the duel can be retargeted without a deploy.
 */
export const DUEL_MODELS = {
  A: process.env.SIMPLESIGHT_MODEL_A ?? MODELS.opus,
  B: process.env.SIMPLESIGHT_MODEL_B ?? MODELS.gpt,
} as const;

/** Human-facing labels for the compare UI (keyed by model ref). */
export const MODEL_LABELS: Record<string, string> = {
  'anthropic/claude-opus-4.8': 'Claude Opus 4.8',
  'anthropic/claude-opus-4.7': 'Claude Opus 4.7',
  'anthropic/claude-sonnet-4.6': 'Claude Sonnet 4.6',
  'anthropic/claude-haiku-4.5': 'Claude Haiku 4.5',
  'openai/gpt-5.5': 'GPT-5.5',
};

/** A short, neutral label that never leaks the vendor to the customer. */
export function studioLabelFor(model: ModelRef, slot: 'A' | 'B'): string {
  return slot === 'A' ? 'Studio A' : 'Studio B';
}

export function modelLabel(model: ModelRef): string {
  return MODEL_LABELS[model] ?? model;
}

/** Default tier per agent/critic (used by the block-mode `defineAgent` path). */
export const AGENT_TIERS: Record<string, Tier> = {
  // producers
  discovery: 'mid',
  design_brief: 'deep',
  theme: 'mid',
  ia: 'mid',
  section_builder: 'deep',
  copy_editor: 'mid',
  imager: 'quick',
  seo: 'quick',
  managing_editor: 'deep',
  // critics
  discovery_critic: 'mid',
  design_critic: 'mid',
  theme_critic: 'quick',
  ia_critic: 'quick',
  block_critic: 'mid',
  copy_critic: 'mid',
  seo_critic: 'quick',
};

export interface RouteContext {
  attemptNumber?: number;
}

/** Resolve the model for an agent, escalating to `deep` on later retries. */
export function selectAgentModel(name: string, ctx: RouteContext = {}): ModelRef {
  const base = AGENT_TIERS[name] ?? 'mid';
  const escalate = (ctx.attemptNumber ?? 1) >= 3;
  const tier: Tier = escalate ? 'deep' : base;
  return TIERS[tier];
}
