import type { BusinessInfo } from '@simplesight/contracts';
import { getIntake, markSitePreviewReady, saveSiteSpec, setProjectStatus } from '@simplesight/db';
import { logger } from '@simplesight/observability';
import { pickPlaybook } from '@simplesight/skills';
import { presetByFamily } from '@simplesight/theme';
import { assembleSite } from './assemble';
import { generateContentBundle } from './content';
import { renderVerify } from './render-verify';

export interface AiBuildResult {
  status: 'preview' | 'failed';
  model: string;
  siteId?: string;
  pages: number;
  error?: string;
}

/**
 * Build a site with LIVE AI: generate a rich content bundle via the given model
 * (through the AI Gateway), assemble it onto the category playbook structure +
 * premium theme, verify, and persist. Falls back to the deterministic floor if
 * generation fails — the customer always gets a site.
 */
export async function runAiBuild(projectId: string, model: string): Promise<AiBuildResult> {
  const intake = await getIntake(projectId);
  const business: BusinessInfo =
    intake?.business ?? {
      name: 'Your Business',
      category: 'small business',
      description: '',
      services: [],
      locations: [],
      hours: [],
      contact: { socials: [] },
    };
  const playbook = pickPlaybook(business.category);
  const theme = presetByFamily(playbook.paletteFamily);
  await setProjectStatus(projectId, 'building');

  let content;
  try {
    logger.info('ai-build: generating content', { projectId, model, playbook: playbook.key });
    content = await generateContentBundle(business, playbook, model);
  } catch (err) {
    logger.error('ai-build: content generation failed, using deterministic floor', {
      projectId,
      model,
      error: err instanceof Error ? err.message : String(err),
    });
  }

  const { spec, dropped } = renderVerify(assembleSite(business, playbook, theme, content));
  const siteId = await saveSiteSpec(projectId, spec);
  await markSitePreviewReady(projectId);
  logger.info('ai-build: complete', { projectId, model, pages: spec.pages.length, dropped: dropped.length });
  return { status: 'preview', model, siteId, pages: spec.pages.length };
}
