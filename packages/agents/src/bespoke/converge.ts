import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { BusinessProfile, SiteIA, SiteReview } from '@simplesight/contracts';
import { MODELS } from '@simplesight/engine';
import type { DesignBrief } from './brief';
import type { ResolvedDesign } from './validate';
import { reviewSite } from './review';
import { revisePage } from './reviser';
import { buildAssetManifest } from './assets';
import { runCodeCritic } from './critic-code';
import { pageFilePath } from './page';
import type { BuildRunner } from './runner';

export interface ConvergeArgs {
  dir: string;
  baseUrl: string; // current (preview) deploy URL to review
  profile: BusinessProfile;
  brief: DesignBrief;
  design: ResolvedDesign;
  ia: SiteIA;
  runner: BuildRunner;
  /** Model that built the site — used by the reviser so each variant keeps its character. */
  model: string;
  /** Judge model for the critics — always the strongest, never the model under test. */
  criticModel?: string;
  maxPasses?: number;
  /** Rebuild+redeploy after a revise pass; returns the fresh URL to re-review. */
  redeploy: () => Promise<string>;
  onPass?: (info: { pass: number; review: SiteReview; revised: string[] }) => void;
}

export interface ConvergeResult {
  review: SiteReview; // the final review
  passes: number;
  revised: string[];
  deployUrl: string;
  converged: boolean; // true if no blocking findings remain
  costCents: number;
}

/**
 * The auto-fix convergence loop. Reviews the deployed site (design + content),
 * and while blocking findings remain (bounded by maxPasses): the REVISER fixes
 * each affected page → rebuild (code-critic) → redeploy → RE-REVIEW (the critic
 * after the reviser). Loops back to the reviser if the re-review still catches
 * anything. Exits when clean (converged) or the pass budget is spent (→ hold).
 */
export async function runConvergence(args: ConvergeArgs): Promise<ConvergeResult> {
  const { dir, profile, brief, design, ia, runner, model } = args;
  const criticModel = args.criticModel ?? MODELS.opus;
  const maxPasses = args.maxPasses ?? 3;
  const pageList = ia.pages.map((p) => ({ name: p.name, slug: p.slug }));
  const revised = new Set<string>();
  let costCents = 0;
  let url = args.baseUrl;

  let review = await reviewSite({ baseUrl: url, pages: pageList, brief, model: criticModel });
  let pass = 0;

  while (review.blocking.length > 0 && pass < maxPasses) {
    pass++;

    // If imagery was flagged anywhere, re-source fresh, on-brand photos once for
    // this pass — the reviser can only rewrite code, so without new URLs the loop
    // would hold forever on "the hero photo is too clinical".
    const imageryFlagged = review.blocking.some((f) => /imagery|photo|image/i.test(f.area));
    let freshImages: { url: string; alt: string; role: string }[] = [];
    if (imageryFlagged) {
      try {
        const steer = `warm welcoming natural light candid real people ${brief.imagery?.direction ?? ''}`.trim();
        const fresh = await buildAssetManifest(profile, ia, { imageryDirection: steer });
        freshImages = fresh.images.filter((i) => i.status === 200).map((i) => ({ url: i.url, alt: i.alt, role: i.role }));
      } catch {
        /* proceed without fresh imagery */
      }
    }

    // Revise every page that has a blocking finding.
    for (const pr of review.pages) {
      const all = [...pr.design.findings, ...pr.content.findings];
      if (!all.some((f) => f.severity === 'block')) continue;
      const plan = ia.pages.find((p) => p.slug === pr.slug);
      const fp = pageFilePath(pr.slug);
      const full = join(dir, fp);
      if (!plan || !existsSync(full)) continue;
      const pageHasImagery = all.some((f) => f.severity === 'block' && /imagery|photo|image/i.test(f.area));
      const res = await revisePage({
        profile, brief, design, ia, page: plan,
        currentContents: readFileSync(full, 'utf8'),
        findings: all.filter((f) => f.severity !== 'info'),
        newImages: pageHasImagery && freshImages.length ? freshImages : undefined,
        model,
      });
      writeFileSync(full, res.file.contents);
      costCents += res.costCents;
      revised.add(fp);
    }

    // Ensure the revised code still builds (code-critic repairs build errors).
    const build = await runCodeCritic({ dir, model, runner, skipInstall: true });
    if (!build.ok) break; // can't compile the fixes → stop; caller holds for human

    // Redeploy for fresh screenshots, then RE-REVIEW (the critic after the reviser).
    url = await args.redeploy();
    review = await reviewSite({ baseUrl: url, pages: pageList, brief, model: criticModel });
    args.onPass?.({ pass, review, revised: [...revised] });
  }

  return {
    review,
    passes: pass,
    revised: [...revised],
    deployUrl: url,
    converged: review.blocking.length === 0,
    costCents,
  };
}
