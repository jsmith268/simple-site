import type { ModelRef } from '@simplesight/contracts';

/** Capability tiers → AI Gateway model strings (provider/model). */
export const TIERS = {
  quick: 'anthropic/claude-haiku-4.5',
  mid: 'anthropic/claude-sonnet-4.6',
  deep: 'anthropic/claude-opus-4.7',
} as const;

export type Tier = keyof typeof TIERS;

/** Default tier per agent/critic. Tuned: producers richer, critics mid, bounded quick. */
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
