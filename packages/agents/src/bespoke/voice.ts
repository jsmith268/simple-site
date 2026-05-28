import { getSkill } from '@simplesight/skills';

/**
 * The marketing-voice ban list, injected into every code/copy PRODUCER
 * (foundation, page, reviser) — not only the content critic. Catching AI tells
 * in review is expensive and lossy; the reliable fix is to never write them.
 * The body is identical across every page call of a build, so it lives in the
 * cached system prefix at no marginal cost.
 */
export function voiceRules(): string {
  const s = getSkill('marketing-voice');
  return s ? s.body : '';
}

/**
 * A compact "what good looks like" companion to the ban list — models the
 * positive target (operator-grade, specific, memorable) so producers aim higher
 * than merely "no tells".
 */
export const COPY_TARGET = `Aim for the bar set by Linear, Stripe, Mercury, and the best independent operators:
- A hero line a real owner would actually say out loud, with a concrete noun and an active verb. Specific beats clever.
- Proof in real units the business gave us (years, counts, named places) — never invented, never "up to".
- One human detail per section that a template could never know (a process step, a material, a neighborhood, a name).
- Sentences of varied length. A short one lands harder after a long one. End sections; do not summarize them.`;
