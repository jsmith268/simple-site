import { z } from 'zod';

/* ──────────────────────────────────────────────────────────────────────────
 * Generation contracts — the dual-model "generate, compare, refine" flow.
 *
 *   round 1 → two variants (Studio A = Opus 4.8, Studio B = GPT-5.5)
 *   customer compares → SELECT one, or REGENERATE with feedback (next round)
 *   up to 5 rounds = up to 10 designs, then locked.
 *   after selecting → refinement workspace → checklist → bounded revisions.
 * ────────────────────────────────────────────────────────────────────────── */

/** Hard limits the product enforces. Tunable in one place. */
export const GENERATION_LIMITS = { maxRounds: 5, maxRevisions: 5 } as const;

export const VariantSlot = z.enum(['A', 'B']);
export type VariantSlot = z.infer<typeof VariantSlot>;

export const VariantStatus = z.enum([
  'queued', // created, not started
  'building', // codegen in progress
  'reviewing', // critics / convergence running
  'ready', // previewable
  'failed', // build could not be produced
  'held', // produced but held for human (sub-threshold)
  'selected', // the customer chose this one
  'superseded', // a later round/revision replaced it
]);
export type VariantStatus = z.infer<typeof VariantStatus>;

/** One generated site: one model, one round. */
export const BuildVariant = z.object({
  id: z.string(),
  projectId: z.string(),
  round: z.number().int().min(1),
  slot: VariantSlot,
  /** Vendor-neutral label shown to the customer ("Studio A" / "Studio B"). */
  studioLabel: z.string(),
  /** The actual model ref (operator-only; never surfaced to the customer). */
  model: z.string(),
  status: VariantStatus.default('queued'),
  /** Deployed preview URL, or the local preview route in offline mode. */
  previewUrl: z.string().optional(),
  /** A captured hero thumbnail for the compare grid. */
  thumbnailUrl: z.string().optional(),
  /** The BuildRun id and the standalone app dir. */
  runId: z.string().optional(),
  buildDir: z.string().optional(),
  designScore: z.number().optional(),
  contentScore: z.number().optional(),
  /** One-line "what defines this design" for the compare card. */
  summary: z.string().optional(),
  costCents: z.number().default(0),
  error: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type BuildVariant = z.infer<typeof BuildVariant>;

/** Feedback captured when the customer regenerates (steers the next round). */
export const RegenFeedback = z.object({
  liked: z.string().optional(),
  disliked: z.string().optional(),
  freeform: z.string().optional(),
  /** Which of the two they leaned toward — a soft steer, not a selection. */
  preferredSlot: VariantSlot.optional(),
});
export type RegenFeedback = z.infer<typeof RegenFeedback>;

export const GenerationStatus = z.enum([
  'idle', // onboarding not yet submitted
  'generating', // a round is building
  'comparing', // round complete, awaiting select / regenerate
  'selected', // a variant chosen → refinement workspace
  'revising', // a revision checklist is being applied
  'finalized', // approved as the final site
  'exhausted', // round budget spent without selecting
]);
export type GenerationStatus = z.infer<typeof GenerationStatus>;

/** The project's generation state machine across rounds + revisions. */
export const GenerationState = z.object({
  projectId: z.string(),
  status: GenerationStatus.default('idle'),
  currentRound: z.number().int().default(0),
  maxRounds: z.number().int().default(GENERATION_LIMITS.maxRounds),
  selectedVariantId: z.string().optional(),
  revisionCount: z.number().int().default(0),
  maxRevisions: z.number().int().default(GENERATION_LIMITS.maxRevisions),
  updatedAt: z.string(),
});
export type GenerationState = z.infer<typeof GenerationState>;

export const Viewport = z.enum(['desktop', 'tablet', 'mobile']);
export type Viewport = z.infer<typeof Viewport>;

export const RevisionItemStatus = z.enum(['open', 'included', 'applied', 'dismissed']);
export type RevisionItemStatus = z.infer<typeof RevisionItemStatus>;

/** One comment captured in the refinement workspace (page + viewport + note). */
export const RevisionItem = z.object({
  id: z.string(),
  projectId: z.string(),
  variantId: z.string(),
  /** Which revision batch this belongs to (0 = the current, not-yet-submitted draft). */
  revision: z.number().int().default(0),
  pageSlug: z.string(),
  pageName: z.string().optional(),
  viewport: Viewport.default('desktop'),
  comment: z.string(),
  /** Auto-classified bucket for the summarized checklist. */
  category: z.string().optional(), // 'copy' | 'layout' | 'color' | 'imagery' | 'content' | 'other'
  status: RevisionItemStatus.default('open'),
  createdAt: z.string(),
});
export type RevisionItem = z.infer<typeof RevisionItem>;

/** A compiled, summarized checklist submitted for one revision pass. */
export const RevisionChecklist = z.object({
  id: z.string(),
  projectId: z.string(),
  variantId: z.string(),
  revision: z.number().int(),
  items: z.array(RevisionItem).default([]),
  /** Model-summarized changelist grouped by page. */
  summary: z.string().default(''),
  status: z.enum(['draft', 'submitted', 'applied', 'failed']).default('draft'),
  createdAt: z.string(),
});
export type RevisionChecklist = z.infer<typeof RevisionChecklist>;
