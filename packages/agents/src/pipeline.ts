import type { BusinessInfo, SiteSpec } from '@simplesight/contracts';
import {
  completedStepKeys,
  finishRun,
  getFleetSettings,
  getIntake,
  getTodaySpendCents,
  markSitePreviewReady,
  openCampaign,
  openRun,
  recordArtifact,
  recordStep,
  saveSiteSpec,
  setProjectStatus,
} from '@simplesight/db';
import { isOffline } from '@simplesight/env';
import { runStep } from '@simplesight/engine';
import { buildBaseline } from '@simplesight/blocks';
import { pickPreset } from '@simplesight/theme';
import { logger } from '@simplesight/observability';
import { renderVerify } from './render-verify';
import {
  copyAgent,
  discoveryAgent,
  discoveryCritic,
  seoAgent,
  themeAgent,
  themeCritic,
} from './stages';

export interface BuildResult {
  status: 'preview' | 'failed';
  runId: string;
  siteId?: string;
  costCents: number;
  droppedBlocks: number;
}

/** Record a deterministic (non-LLM) stage for observability. */
async function deterministicStep<T>(runId: string, stepName: string, fn: () => T | Promise<T>): Promise<T> {
  const key = `${runId}:${stepName}`;
  await recordStep({ runId, stepName, status: 'running', attemptNumber: 1, idempotencyKey: key });
  const out = await fn();
  const artifactId = await recordArtifact({ runId, type: stepName, producedByAgent: 'deterministic', inlineJson: out as unknown });
  await recordStep({ runId, stepName, status: 'completed', attemptNumber: 1, idempotencyKey: key, artifactId });
  return out;
}

/**
 * The full build pipeline. Every stage either enhances or is the deterministic
 * baseline, so the run ALWAYS yields a complete, schema-valid, previewable site.
 * Checkpointed per step (resumable). Quality issues escalate-and-continue; they
 * never abort. This is the zero-fail core.
 */
export async function runBuildPipeline(projectId: string): Promise<BuildResult> {
  // Operator emergency stop — pause rather than build.
  const fleet = await getFleetSettings();
  if (fleet.killSwitchEngaged) {
    logger.warn('pipeline.kill_switch engaged — not building', { projectId });
    return { status: 'failed', runId: '', costCents: 0, droppedBlocks: 0 };
  }

  // Cost sentinel: over the daily ceiling → degrade to the free deterministic
  // path (still ships a complete site) instead of spending on LLM calls.
  const spentToday = await getTodaySpendCents();
  const overBudget = spentToday >= fleet.dailyBudgetCeilingCents;
  const offline = isOffline() || overBudget;
  if (overBudget) logger.warn('pipeline.over_budget — building deterministically', { projectId, spentToday });

  const intake = await getIntake(projectId);
  const business: BusinessInfo =
    intake?.business ??
    // Absolute fallback so a project with no intake still yields a site.
    {
      name: 'Your Business',
      category: 'small business',
      description: 'Welcome — more information coming soon.',
      services: [],
      locations: [],
      hours: [],
      contact: { socials: [] },
    };

  const campaignId = await openCampaign(projectId, 'initial_build');
  const runId = await openRun(campaignId, projectId, 1);
  const resume = await completedStepKeys(runId);
  await setProjectStatus(projectId, 'building');

  let cost = 0;
  const onCost = (c: number) => {
    cost += c;
  };
  const common = { runId, projectId, offline, resume, onCost };

  logger.info('pipeline.start', { projectId, runId, offline });

  try {
    // Stage 1 — discovery
    const profile = await runStep<BusinessInfo, BusinessInfo>({
      ...common,
      stepName: 'discovery',
      producer: discoveryAgent,
      critic: discoveryCritic,
      input: business,
      fallback: () => business,
    });

    // Stage 2 — theme (deterministic WCAG critic; falls back to a safe preset)
    const theme = await runStep({
      ...common,
      stepName: 'theme',
      producer: themeAgent,
      critic: themeCritic,
      input: { business: profile, style: intake?.style },
      fallback: () => pickPreset(intake?.style?.mood),
    });

    // Stage 3 — baseline assembly (the floor: a complete, valid site)
    const baseline = await deterministicStep(runId, 'assemble', () => buildBaseline(profile, theme));

    // Stage 4 — copy polish
    const copied = await runStep<SiteSpec, SiteSpec>({
      ...common,
      stepName: 'copy',
      producer: copyAgent,
      input: baseline,
      fallback: () => baseline,
    });

    // Stage 5 — SEO
    const withSeo = await runStep<{ site: SiteSpec; business: BusinessInfo }, SiteSpec>({
      ...common,
      stepName: 'seo',
      producer: seoAgent,
      input: { site: copied, business: profile },
      fallback: () => copied,
    });

    // Stage 6 — render verification (hard gate: only valid blocks survive)
    const { spec: verified, dropped } = await deterministicStep(runId, 'render_verify', () =>
      renderVerify(withSeo),
    );
    if (dropped.length) logger.warn('pipeline.render_verify dropped blocks', { count: dropped.length });

    // Stage 7 — publish (persist + flip to preview)
    const siteId = await deterministicStep(runId, 'publish', async () => {
      const id = await saveSiteSpec(projectId, verified);
      await markSitePreviewReady(projectId);
      return id;
    });

    await finishRun(runId, 'completed', Math.round(cost));
    logger.info('pipeline.complete', { projectId, runId, siteId, costCents: Math.round(cost) });
    return { status: 'preview', runId, siteId, costCents: Math.round(cost), droppedBlocks: dropped.length };
  } catch (err) {
    // Last-resort guarantee: even on an unexpected error, ship the baseline.
    logger.error('pipeline.error — shipping baseline', {
      projectId,
      error: err instanceof Error ? err.message : String(err),
    });
    const safe = renderVerify(buildBaseline(business, pickPreset(intake?.style?.mood))).spec;
    const siteId = await saveSiteSpec(projectId, safe);
    await markSitePreviewReady(projectId);
    await finishRun(runId, 'completed_with_fallback', Math.round(cost));
    return { status: 'preview', runId, siteId, costCents: Math.round(cost), droppedBlocks: 0 };
  }
}
