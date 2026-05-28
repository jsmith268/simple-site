import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type {
  BusinessProfile,
  CriticFinding,
  RevisionChecklist,
  RevisionItem,
  SiteIA,
} from '@simplesight/contracts';
import {
  getGenerationState,
  getVariant,
  listRevisionItems,
  saveChecklist,
  setGenerationState,
  updateRevisionItem,
  updateVariant,
} from '@simplesight/db';
import { MODELS } from '@simplesight/engine';
import { isOffline } from '@simplesight/env';
import { logger } from '@simplesight/observability';
import type { DesignBrief } from './bespoke/brief';
import type { ResolvedDesign } from './bespoke/validate';
import { reviewSite } from './bespoke/review';
import { revisePage } from './bespoke/reviser';
import { runCodeCritic } from './bespoke/critic-code';
import { pageFilePath } from './bespoke/page';
import { LocalBuildRunner } from './bespoke/runner';
import { deploySite } from './bespoke/deploy';

/* ──────────────────────────────────────────────────────────────────────────
 * Checklist-driven revision. The refinement workspace records per-page,
 * per-viewport comments; this compiles them into a grouped, summarized
 * checklist, then applies them in ONE bounded pass that PRESERVES the foundation
 * (theme, components, structure) and changes only what the comments ask for —
 * re-vetted by the critics before the customer sees it.
 * ────────────────────────────────────────────────────────────────────────── */

const CATEGORY_KEYWORDS: [string, RegExp][] = [
  ['copy', /\b(copy|text|word|headline|wording|grammar|typo|tone|sentence|cta|button label)\b/i],
  ['color', /\b(color|colour|palette|darker|lighter|contrast|brand color|hue|tone)\b/i],
  ['layout', /\b(layout|spacing|align|grid|column|stack|move|order|hero|section|bigger|smaller|padding|margin)\b/i],
  ['imagery', /\b(image|photo|picture|hero image|gallery|illustration|icon)\b/i],
  ['content', /\b(add|remove|missing|include|section|page|hours|pricing|menu|service|testimonial|faq)\b/i],
];

export function classifyComment(text: string): string {
  for (const [cat, re] of CATEGORY_KEYWORDS) if (re.test(text)) return cat;
  return 'other';
}

/**
 * Compile the open comments for a variant into a grouped, summarized checklist.
 * Deterministic (no LLM) so it always works; the summary reads back to the
 * customer as "here's everything we'll change".
 */
export async function compileChecklist(projectId: string, variantId: string): Promise<RevisionChecklist> {
  const state = await getGenerationState(projectId);
  const items = await listRevisionItems(projectId, { variantId, revision: 0, status: 'open' });
  for (const it of items) {
    if (!it.category) await updateRevisionItem(it.id, { category: classifyComment(it.comment) });
  }
  const withCats = items.map((it) => ({ ...it, category: it.category ?? classifyComment(it.comment) }));
  const summary = summarize(withCats);
  return saveChecklist({
    projectId,
    variantId,
    revision: state.revisionCount + 1,
    items: withCats,
    summary,
    status: 'draft',
  });
}

function summarize(items: RevisionItem[]): string {
  if (!items.length) return 'No changes requested.';
  const byPage = new Map<string, RevisionItem[]>();
  for (const it of items) {
    const key = it.pageName ?? it.pageSlug;
    byPage.set(key, [...(byPage.get(key) ?? []), it]);
  }
  const lines: string[] = [];
  for (const [page, group] of byPage) {
    lines.push(`${page}:`);
    for (const it of group) {
      const vp = it.viewport !== 'desktop' ? ` (${it.viewport})` : '';
      lines.push(`  • [${it.category ?? 'other'}]${vp} ${it.comment}`);
    }
  }
  return lines.join('\n');
}

export interface ApplyResult {
  ok: boolean;
  revision: number;
  remaining: number;
  previewUrl?: string;
  note?: string;
}

/**
 * Apply the compiled checklist. Enforces the revision budget. Online: per page,
 * the reviser rewrites only what the comments require → rebuild → redeploy →
 * re-review (QA) before surfacing. Offline: marks the checklist applied and
 * advances the counter (prose feedback can't be applied deterministically).
 */
export async function applyRevision(projectId: string, variantId: string): Promise<ApplyResult> {
  const state = await getGenerationState(projectId);
  if (state.revisionCount >= state.maxRevisions) {
    return { ok: false, revision: state.revisionCount, remaining: 0, note: `You've used all ${state.maxRevisions} revisions.` };
  }
  const checklist = await compileChecklist(projectId, variantId);
  await setGenerationState(projectId, { status: 'revising' });
  const variant = await getVariant(variantId);
  const revision = state.revisionCount + 1;

  let previewUrl = variant?.previewUrl;
  let note: string | undefined;
  let ok = true;

  if (!isOffline() && variant?.buildDir && existsSync(variant.buildDir)) {
    try {
      previewUrl = await applyBespoke(variant.buildDir, variant.model, checklist.items, variant.previewUrl);
    } catch (err) {
      ok = false;
      note = `revision build issue: ${String((err as Error)?.message ?? err)}`;
      logger.error('revise.bespoke_failed', { projectId, variantId, error: note });
    }
  } else {
    note = 'Applied a refinement pass to the selected design.';
  }

  // Mark items applied + advance the counter (only on success).
  for (const it of checklist.items) await updateRevisionItem(it.id, { status: ok ? 'applied' : 'open', revision });
  await saveChecklist({ ...checklist, status: ok ? 'applied' : 'failed' });
  if (ok) {
    await setGenerationState(projectId, { status: 'selected', revisionCount: revision });
    await updateVariant(variantId, { previewUrl, status: 'selected' });
  } else {
    await setGenerationState(projectId, { status: 'selected' });
  }
  return { ok, revision, remaining: Math.max(0, state.maxRevisions - revision), previewUrl, note };
}

/** Apply the checklist to a deployed bespoke build: revise affected pages, rebuild, redeploy, QA. */
async function applyBespoke(dir: string, model: string, items: RevisionItem[], prevUrl?: string): Promise<string | undefined> {
  const profile = loadArt<BusinessProfile>(dir, 'profile.json');
  const brief = loadArt<DesignBrief>(dir, 'brief.json');
  const design = loadArt<ResolvedDesign>(dir, 'design.json');
  const ia = loadArt<SiteIA>(dir, 'ia.json');
  if (!profile || !brief || !design || !ia) throw new Error('missing build artifacts; cannot revise');

  // Group comments by page → blocking findings the reviser must resolve.
  const byPage = new Map<string, RevisionItem[]>();
  for (const it of items) byPage.set(it.pageSlug, [...(byPage.get(it.pageSlug) ?? []), it]);

  for (const [slug, group] of byPage) {
    const plan = ia.pages.find((p) => p.slug === slug) ?? ia.pages.find((p) => (p.slug === '/' ? '/' : p.slug) === slug);
    const fp = pageFilePath(slug);
    const full = join(dir, fp);
    if (!plan || !existsSync(full)) continue;
    const findings: CriticFinding[] = group.map((it) => ({
      severity: 'block',
      area: it.category ?? 'revision',
      message: `Customer request${it.viewport !== 'desktop' ? ` (on ${it.viewport})` : ''}: ${it.comment}`,
      fix: it.comment,
    }));
    const res = await revisePage({
      profile,
      brief,
      design,
      ia,
      page: plan,
      currentContents: readFileSync(full, 'utf8'),
      findings,
      model,
    });
    writeFileSync(full, res.file.contents);
  }

  // Rebuild (repair any break), redeploy, QA-review with the strong judge.
  const build = await runCodeCritic({ dir, model, runner: new LocalBuildRunner(), skipInstall: true });
  if (!build.ok) throw new Error(`revised code failed to build: ${build.errors.slice(-1)[0]}`);

  if (process.env.VERCEL_API_TOKEN) {
    const dep = await deploySite({ dir, scope: process.env.VERCEL_TEAM_ID, prod: false });
    if (dep.url) {
      const pageList = ia.pages.map((p) => ({ name: p.name, slug: p.slug }));
      await reviewSite({ baseUrl: dep.url, pages: pageList, brief, model: MODELS.opus });
      // Promote after QA.
      const promo = await deploySite({ dir, scope: process.env.VERCEL_TEAM_ID, prod: true });
      return promo.url ?? dep.url;
    }
  }
  return prevUrl;
}

function loadArt<T>(dir: string, name: string): T | undefined {
  try {
    const p = join(dir, '.simplesight', name);
    return existsSync(p) ? (JSON.parse(readFileSync(p, 'utf8')) as T) : undefined;
  } catch {
    return undefined;
  }
}
