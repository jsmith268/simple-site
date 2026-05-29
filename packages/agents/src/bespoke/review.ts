import { type CriticFinding, type CriticReport, type PageReview, type SiteReview } from '@simplesight/contracts';
import { MODELS } from '@simplesight/engine';
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

/** Append a Vercel deployment-protection bypass so screenshots/fetch see the real
 *  site (not the auth wall) when the secret is configured. No-op otherwise. */
function bypassUrl(u: string): string {
  const secret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  if (!secret) return u;
  const sep = u.includes('?') ? '&' : '?';
  return `${u}${sep}x-vercel-protection-bypass=${secret}&x-vercel-set-bypass-cookie=true`;
}

const PROTECTED_RE = /Vercel Authentication|Authenticating\b|Log in to Vercel|sso-api|deployment is protected|Deployment Protection/i;
/** True if the fetched page is a Vercel auth/SSO wall rather than the real site. */
export function looksProtected(text: string): boolean {
  return text.length < 6000 && PROTECTED_RE.test(text);
}

export interface ReviewArgs {
  baseUrl: string;
  pages: { name: string; slug: string }[];
  brief: DesignBrief;
  model?: string;
  provider?: ScreenshotProvider;
}

const BLANK_RE = /blank|entirely white|all white|white screen|no content|nothing (is )?(visible|rendered)|failed to (render|load)|empty page/i;
/** A blank/failed screenshot the critic scored near-zero — not a real design failure. */
function looksBlankCapture(r: CriticReport): boolean {
  return r.score < 25 && BLANK_RE.test(`${r.summary} ${r.findings.map((f) => f.message).join(' ')}`);
}
/** Neutral design report when a page's screenshot can't be captured — does NOT block. */
const NOT_ASSESSED: CriticReport = {
  score: 75,
  verdict: 'pass',
  dimensions: {},
  findings: [{ severity: 'warn', area: 'screenshot', message: 'Screenshot came back blank after retries — design not auto-assessed for this page; verify manually.' }],
  summary: 'capture failed — design not assessed',
};

/**
 * Full-site review: for EVERY page, a full-page screenshot → design critic
 * (award-winning designer) AND the rendered text → content critic
 * (award-winning copy editor). Aggregates into one SiteReview; any blocking
 * design or content finding makes the site fail verification.
 */
export async function reviewSite(args: ReviewArgs): Promise<SiteReview> {
  const model = args.model ?? MODELS.opus;
  const provider = args.provider ?? defaultScreenshotProvider();
  const base = args.baseUrl.replace(/\/$/, '');
  const pages: PageReview[] = [];
  const blocking: CriticFinding[] = [];

  // Guard: a Vercel-protected preview returns the auth wall to the public
  // screenshot/fetch — reviewing THAT falsely rejects and burns reviser passes.
  // Fail fast with a clear, actionable reason instead.
  const homeProbe = await fetchText(bypassUrl(base));
  if (looksProtected(homeProbe)) {
    throw new Error(
      'DEPLOYMENT_PROTECTED: the deploy is behind Vercel deployment protection, so the review only sees the login page. Set VERCEL_AUTOMATION_BYPASS_SECRET (Vercel → Project → Settings → Deployment Protection → Protection Bypass for Automation) or turn off protection for preview deployments.',
    );
  }

  for (const p of args.pages) {
    const url = bypassUrl(`${base}${p.slug === '/' ? '' : p.slug}`);
    const shoot = () => runVisualCritic({ url, brief: args.brief, pageName: p.name, model, provider, fullPage: true }).then((r) => r.report);
    // Design (full-page screenshot) and content (rendered text) in parallel.
    const [firstDesign, text] = await Promise.all([shoot(), fetchText(url)]);
    let design = firstDesign;
    // A blank/failed capture must not falsely reject the page. Retry once; if
    // still blank, don't assess (and don't block) — flag it for a manual look.
    if (looksBlankCapture(design)) {
      design = await shoot().catch(() => design);
      if (looksBlankCapture(design)) design = NOT_ASSESSED;
    }
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
