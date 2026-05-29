import { existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type {
  BuildVariant,
  BusinessInfo,
  RegenFeedback,
  SiteSpec,
  VariantSlot,
} from '@simplesight/contracts';
import { GENERATION_LIMITS } from '@simplesight/contracts';
import {
  createVariant,
  getGenerationState,
  getIntake,
  getProjectEmail,
  saveVariantSpec,
  setGenerationState,
  setProjectStatus,
  updateVariant,
  variantsForRound,
} from '@simplesight/db';
import { DUEL_MODELS, studioLabelFor } from '@simplesight/engine';
import { isOffline } from '@simplesight/env';
import { email, logger } from '@simplesight/observability';
import { pickPlaybook } from '@simplesight/skills';
import { presetByFamily } from '@simplesight/theme';
import { assembleSite } from './assemble';
import { profileFromIntake } from './bespoke/profile';
import { renderVerify } from './render-verify';

/* ──────────────────────────────────────────────────────────────────────────
 * Generation rounds. By default (STUDIO_VARIANTS=1) we build a SINGLE bespoke
 * site with Claude Opus 4.8 via the direct Anthropic key — the primary path.
 * Set STUDIO_VARIANTS=2 (and SIMPLESIGHT_MODEL_B / a gateway key) to restore the
 * dual studio (Studio A = Opus, Studio B = GPT-5.5) compare experience.
 *
 *  - Online (AI + Vercel keys): each variant is a real bespoke Next app built by
 *    its model and deployed to a preview URL, vetted by the convergence loop. A
 *    live build that fails is HELD (surfaced), never silently swapped for a
 *    template — the customer paid for the bespoke product.
 *  - Offline/dev: each variant is a distinct, renderable SiteSpec served by the
 *    multi-tenant renderer at /preview/variant/<id>, so the whole flow is
 *    demonstrable with zero external services.
 * ────────────────────────────────────────────────────────────────────────── */

const BUILD_ROOT = process.env.SIMPLESIGHT_BUILD_DIR ?? join(tmpdir(), 'simplesight-builds');

/** How many variants to generate per round. 1 = single Opus (default), 2 = dual studio. */
function studioVariants(): number {
  return Number(process.env.STUDIO_VARIANTS ?? '1') >= 2 ? 2 : 1;
}

/** Optional per-variant spend cap (cents) for live bespoke builds. */
function costCeilingCents(): number | undefined {
  const n = Number(process.env.SIMPLESIGHT_COST_CEILING_CENTS ?? '');
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

function rendererBase(): string {
  const r = process.env.NEXT_PUBLIC_RENDERER_URL;
  if (r) return r.replace(/\/$/, '');
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? process.env.ROOT_DOMAIN ?? 'simplesight.localhost';
  return root.includes('localhost') ? 'http://localhost:3001' : `https://${root}`;
}

function variantPreviewUrl(variantId: string): string {
  return `${rendererBase()}/preview/variant/${encodeURIComponent(variantId)}`;
}

/** The customer portal base (for email deep-links to the studio). */
function appBase(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3300').replace(/\/$/, '');
}

/**
 * Two contrasting design families so Studio A and Studio B look genuinely
 * different in the offline demo. A keeps the category's natural family; B takes
 * a deliberately different-but-tasteful direction.
 */
const CONTRAST: Record<string, string> = {
  slate: 'ink',
  warmth: 'clay',
  ink: 'aurora',
  sage: 'mist',
  navy: 'slate',
  clay: 'warmth',
  stone: 'sage',
  aurora: 'ink',
  mist: 'stone',
};

function familyFor(slot: VariantSlot, primary: string): string {
  if (slot === 'A') return primary;
  return CONTRAST[primary] ?? 'ink';
}

const DESIGN_BLURB: Record<string, string> = {
  slate: 'Editorial serif headings on a cool slate canvas — calm and credible.',
  warmth: 'Warm terracotta tones with a friendly, approachable rhythm.',
  ink: 'Confident dark mode, tight display type, electric accent.',
  sage: 'Soft sage and cream — quiet, natural, unhurried.',
  navy: 'Formal navy and gold with a classic serif voice.',
  clay: 'Hand-made clay tones, generous spacing, crafted feel.',
  stone: 'Minimal stone palette, big type, lots of air.',
  aurora: 'Bold gradient hero, modern grotesk, high energy.',
  mist: 'Editorial newsreader serif on a soft misted palette — premium and zen.',
};

function businessFromIntake(intake: { business?: BusinessInfo } | null | undefined): BusinessInfo {
  return (
    intake?.business ?? {
      name: 'Your Business',
      category: 'small business',
      description: 'Welcome — more information coming soon.',
      services: [],
      locations: [],
      hours: [],
      contact: { socials: [] },
    }
  );
}

/** Build one offline variant SiteSpec, varied by slot for visible contrast. */
function buildOfflineSpec(business: BusinessInfo, slot: VariantSlot): { spec: SiteSpec; family: string } {
  const playbook = pickPlaybook(business.category);
  const family = familyFor(slot, playbook.paletteFamily);
  const theme = presetByFamily(family);
  const assembled = assembleSite(business, playbook, theme);
  const { spec } = renderVerify(assembled);
  return { spec, family };
}

export interface RoundResult {
  round: number;
  variants: BuildVariant[];
}

/**
 * Run ONE generation round: create + build both variants, persist them, and set
 * the project into 'comparing'. `feedback` (when regenerating) steers the build.
 */
export async function runRound(projectId: string, feedback?: RegenFeedback): Promise<RoundResult> {
  const state = await getGenerationState(projectId);
  const round = state.currentRound + 1;
  if (round > state.maxRounds) {
    await setGenerationState(projectId, { status: 'exhausted' });
    throw new Error('regeneration limit reached');
  }

  await setGenerationState(projectId, { status: 'generating', currentRound: round, ...(feedback ? { feedback } : {}) });
  await setProjectStatus(projectId, 'building');

  const intake = await getIntake(projectId);
  const business = businessFromIntake(intake);
  const slots: VariantSlot[] = studioVariants() >= 2 ? ['A', 'B'] : ['A'];
  const model = { A: DUEL_MODELS.A, B: DUEL_MODELS.B };

  // Create the two variant records up front so the compare screen can show
  // "building" cards immediately.
  const variants: BuildVariant[] = [];
  for (const slot of slots) {
    variants.push(
      await createVariant({
        projectId,
        round,
        slot,
        studioLabel: studioLabelFor(model[slot], slot),
        model: model[slot],
        status: 'building',
      }),
    );
  }

  // Build both in parallel. Each is independent and failure-isolated.
  await Promise.all(
    variants.map(async (v) => {
      try {
        if (isOffline()) {
          const { spec, family } = buildOfflineSpec(business, v.slot);
          await saveVariantSpec(v.id, spec);
          await updateVariant(v.id, {
            status: 'ready',
            previewUrl: variantPreviewUrl(v.id),
            summary: DESIGN_BLURB[family] ?? 'A distinctive, on-brand direction.',
            designScore: v.slot === 'A' ? 90 : 88,
            contentScore: 89,
          });
        } else {
          await buildBespokeVariant(projectId, v, business, feedback);
        }
      } catch (err) {
        const msg = String((err as Error)?.message ?? err);
        logger.error('dual.variant_failed', { projectId, variantId: v.id, slot: v.slot, error: msg });
        if (isOffline()) {
          // Offline the template IS the product → safe deterministic fallback.
          try {
            const { spec, family } = buildOfflineSpec(business, v.slot);
            await saveVariantSpec(v.id, spec);
            await updateVariant(v.id, {
              status: 'ready',
              previewUrl: variantPreviewUrl(v.id),
              summary: DESIGN_BLURB[family] ?? 'A distinctive, on-brand direction.',
            });
          } catch (err2) {
            await updateVariant(v.id, { status: 'failed', error: String((err2 as Error)?.message ?? err2) });
          }
        } else {
          // LIVE: do NOT pass off a template as the bespoke product. Hold it so a
          // human is alerted (e.g. a gateway 402/403 means Opus didn't actually run).
          await updateVariant(v.id, { status: 'held', error: msg });
        }
      }
    }),
  );

  await setGenerationState(projectId, { status: 'comparing' });
  await setProjectStatus(projectId, 'preview');
  // Let the customer know their two directions are ready (offline → just logs).
  try {
    const to = await getProjectEmail(projectId);
    if (to) await email.designsReady(to, `${appBase()}/studio/${projectId}`);
  } catch (err) {
    logger.warn('notify.designsReady failed', { projectId, error: String(err) });
  }
  const fresh = await variantsForRound(projectId, round);
  return { round, variants: fresh };
}

/**
 * Online path: a real bespoke build per model, deployed to a preview URL, vetted
 * by the convergence loop. Best-effort score capture from the run artifacts.
 */
async function buildBespokeVariant(
  projectId: string,
  variant: BuildVariant,
  _business: BusinessInfo,
  feedback?: RegenFeedback,
): Promise<void> {
  const { runBespokeBuild } = await import('./bespoke/orchestrate');
  const intake = await getIntake(projectId);
  const profile = intake?.business
    ? profileFromIntake({ style: intake.style ?? { vibe: [], referenceUrls: [] }, business: intake.business })
    : undefined;
  const dir = join(BUILD_ROOT, projectId, `r${variant.round}-${variant.slot}`);
  const input = profile ? steerProfile(profile, feedback) : steerText(intake?.business?.description ?? 'A small business website.', feedback);
  const deploy = process.env.VERCEL_API_TOKEN ? { scope: process.env.VERCEL_TEAM_ID } : undefined;

  await updateVariant(variant.id, { status: 'building', buildDir: dir });
  const run = await runBespokeBuild({
    input,
    projectId,
    slug: `${projectId.slice(0, 8)}-${variant.round}${variant.slot.toLowerCase()}`,
    dir,
    model: variant.model,
    deploy,
    visualCritic: !!deploy,
    costCeilingCents: costCeilingCents(),
  });

  const review = readJson<{ designScore?: number; contentScore?: number }>(join(dir, '.simplesight', 'review-report.json'));
  const ok = run.status === 'succeeded';
  await updateVariant(variant.id, {
    status: ok ? 'ready' : 'held',
    runId: run.id,
    previewUrl: run.previewUrl ?? variantPreviewUrl(variant.id),
    designScore: review?.designScore,
    contentScore: review?.contentScore,
    costCents: run.costCents,
    summary: run.escalation ? undefined : 'A bespoke, hand-built direction.',
    error: ok ? undefined : run.escalation,
  });

  // If the bespoke build did not deploy (no Vercel), back the preview with a
  // renderable spec so the compare/refine flow still works.
  if (!run.previewUrl) {
    const { spec } = buildOfflineSpec(_business, variant.slot);
    await saveVariantSpec(variant.id, spec);
  }
}

function steerProfile<T extends { description: string; visual: { avoid?: string } }>(profile: T, feedback?: RegenFeedback): T {
  if (!feedback) return profile;
  const liked = feedback.liked ? ` Keep what worked: ${feedback.liked}.` : '';
  const freeform = feedback.freeform ? ` ${feedback.freeform}` : '';
  const disliked = feedback.disliked ? feedback.disliked : '';
  return {
    ...profile,
    description: `${profile.description}${liked}${freeform}`.trim(),
    visual: { ...profile.visual, avoid: [profile.visual.avoid, disliked].filter(Boolean).join('; ') || undefined },
  };
}

function steerText(text: string, feedback?: RegenFeedback): string {
  if (!feedback) return text;
  const parts = [text];
  if (feedback.liked) parts.push(`Keep: ${feedback.liked}.`);
  if (feedback.disliked) parts.push(`Avoid: ${feedback.disliked}.`);
  if (feedback.freeform) parts.push(feedback.freeform);
  return parts.join(' ');
}

function readJson<T>(path: string): T | undefined {
  try {
    return existsSync(path) ? (JSON.parse(readFileSync(path, 'utf8')) as T) : undefined;
  } catch {
    return undefined;
  }
}

/** Customer selects a variant → move into the refinement workspace. */
export async function selectVariant(projectId: string, variantId: string): Promise<void> {
  await updateVariant(variantId, { status: 'selected' });
  await setGenerationState(projectId, { status: 'selected', selectedVariantId: variantId });
  // Still in review (refinement) — not 'approved' until the customer finalizes.
  await setProjectStatus(projectId, 'preview');
}

/** Regenerate: spend a round (if any remain), steering with feedback. */
export async function regenerate(projectId: string, feedback: RegenFeedback): Promise<RoundResult> {
  const state = await getGenerationState(projectId);
  if (state.currentRound >= state.maxRounds) {
    await setGenerationState(projectId, { status: 'exhausted' });
    throw new Error(`You've used all ${state.maxRounds} generations.`);
  }
  return runRound(projectId, feedback);
}

/** How many regenerations remain (for the UI). */
export async function regensRemaining(projectId: string): Promise<{ used: number; max: number; remaining: number }> {
  const state = await getGenerationState(projectId);
  return { used: state.currentRound, max: state.maxRounds, remaining: Math.max(0, state.maxRounds - state.currentRound) };
}

export const DUAL_LIMITS = GENERATION_LIMITS;
