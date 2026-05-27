import { type CriticFinding, type CriticReport, type PageReview, type SiteReview } from '@simplesight/contracts';
import type { DesignBrief } from './brief';
import { runVisualCritic } from './critic-visual';
import { runContentCritic } from './critic-content';
import { defaultScreenshotProvider, type ScreenshotProvider } from './screenshot';

/** Strip HTML to visible text for the content critic. */
export function extractText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(Number.parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number.parseInt(n, 10)))
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchText(url: string): Promise<string> {
  try {
    const res = await fetch(url, { headers: { 'user-agent': 'SimpleSightReviewer/1.0' } });
    return extractText(await res.text());
  } catch {
    return '';
  }
}

export interface ReviewArgs {
  baseUrl: string;
  pages: { name: string; slug: string }[];
  brief: DesignBrief;
  model?: string;
  provider?: ScreenshotProvider;
}

/**
 * Full-site review: for EVERY page, a full-page screenshot → design critic
 * (award-winning designer) AND the rendered text → content critic
 * (award-winning copy editor). Aggregates into one SiteReview; any blocking
 * design or content finding makes the site fail verification.
 */
export async function reviewSite(args: ReviewArgs): Promise<SiteReview> {
  const model = args.model ?? 'anthropic/claude-opus-4.7';
  const provider = args.provider ?? defaultScreenshotProvider();
  const base = args.baseUrl.replace(/\/$/, '');
  const pages: PageReview[] = [];
  const blocking: CriticFinding[] = [];

  for (const p of args.pages) {
    const url = `${base}${p.slug === '/' ? '' : p.slug}`;
    // Design (full-page screenshot) and content (rendered text) in parallel.
    const [design, text] = await Promise.all([
      runVisualCritic({ url, brief: args.brief, pageName: p.name, model, provider, fullPage: true }).then((r) => r.report),
      fetchText(url),
    ]);
    const content = await runContentCritic({ text, brief: args.brief, pageName: p.name, model });
    pages.push({ slug: p.slug, name: p.name, design, content });
    for (const f of [...design.findings, ...content.findings]) {
      if (f.severity === 'block') blocking.push({ ...f, area: `${p.name}/${f.area}` });
    }
  }

  const designScore = pages.length ? Math.min(...pages.map((p) => p.design.score)) : 0;
  const contentScore = pages.length ? Math.min(...pages.map((p) => p.content.score)) : 0;
  const anyReject = pages.some((p) => p.design.verdict === 'reject' || p.content.verdict === 'reject');
  const verdict: SiteReview['verdict'] = blocking.length || anyReject ? (anyReject ? 'reject' : 'revise') : designScore >= 80 && contentScore >= 80 ? 'pass' : 'revise';

  return {
    pages,
    designScore,
    contentScore,
    verdict,
    blocking,
    summary: `${pages.length} pages reviewed · design min ${designScore} · content min ${contentScore} · ${blocking.length} blocking finding(s).`,
  };
}

/** Flatten a SiteReview into a single CriticReport (backward-compat for the
 *  admin's per-build critic panel + the learning loop). */
export function siteReviewToCriticReport(review: SiteReview): CriticReport {
  const dims: Record<string, number> = {};
  for (const p of review.pages) {
    for (const [k, v] of Object.entries(p.design.dimensions)) dims[k] = Math.min(dims[k] ?? 100, v);
    for (const [k, v] of Object.entries(p.content.dimensions)) dims[k] = Math.min(dims[k] ?? 100, v);
  }
  const findings = review.pages.flatMap((p) =>
    [...p.design.findings, ...p.content.findings].map((f) => ({ ...f, area: `${p.name}/${f.area}` })),
  );
  return {
    score: Math.min(review.designScore, review.contentScore),
    verdict: review.verdict,
    dimensions: dims,
    findings,
    summary: review.summary,
  };
}
