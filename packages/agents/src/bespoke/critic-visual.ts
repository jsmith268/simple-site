import { generateVision, MODELS } from '@simplesight/engine';
import { type CriticReport } from '@simplesight/contracts';
import type { DesignBrief } from './brief';
import { type Screenshot, type ScreenshotProvider, defaultScreenshotProvider } from './screenshot';

export interface VisualCriticArgs {
  /** A live URL to screenshot, OR a pre-captured screenshot. */
  url?: string;
  screenshot?: Screenshot;
  brief: DesignBrief;
  pageName?: string;
  model?: string;
  provider?: ScreenshotProvider;
  fullPage?: boolean;
}

export interface VisualCriticResult {
  report: CriticReport;
  screenshot: Screenshot;
  rawText: string;
}

const RUBRIC = `Score each dimension 0-100 and give an overall score (their weighted sense, not just the average):
- hierarchy: is the eye led; clear focal order; headline > sub > body
- typography: display/body pairing, scale jumps, tracking/leading, the brief's type treatment
- color: palette adherence, contrast/legibility (WCAG), restraint of the accent
- spacing: rhythm, alignment, generous-but-intentional whitespace, no cramped/blown-out areas
- signatureDevices: are the brief's specific devices actually present and well-executed
- imagery: quality, treatment consistency, no broken/placeholder/irrelevant images
- polish: details, consistency, finish — does it look shipped by a senior designer
- believability: does it read as a real, human-made premium site (NOT generic AI slop)

Verdict: "pass" if overall >= 80, "revise" if 60-79, "reject" if < 60.`;

/**
 * Visual critic: screenshot a rendered page and have Opus 4.7 (multimodal) score
 * it against the committed brief + a fixed rubric. Returns a structured
 * CriticReport with per-dimension scores + actionable findings. The gate that
 * catches "looks off" that text/build checks can't.
 */
export async function runVisualCritic(args: VisualCriticArgs): Promise<VisualCriticResult> {
  const model = args.model ?? MODELS.opus;
  const provider = args.provider ?? defaultScreenshotProvider();
  const shot = args.screenshot ?? (await provider.capture(args.url as string, { fullPage: args.fullPage }));
  if (!args.screenshot && !args.url) throw new Error('runVisualCritic needs a url or a screenshot');

  const system = `You are a brutally honest senior design critic reviewing a SCREENSHOT of a generated web page against its committed design brief. Reward distinctiveness and craft; penalize generic, templated, or "AI-slop" results. Be specific and reference what you actually see in the image. Output ONLY one JSON object — no prose, no code fences.`;

  const text = `DESIGN BRIEF this page must honor:
- Direction: ${args.brief.direction}
- Palette: ${JSON.stringify(args.brief.palette)}
- Signature devices (must be present + well-executed): ${args.brief.signatureDevices.join(' · ')}
- Voice/imagery: ${args.brief.voice} | ${args.brief.imagery?.direction ?? ''}
${args.pageName ? `\nThis is the "${args.pageName}" page.` : ''}

${RUBRIC}

Return JSON:
{
  "score": number (0-100 overall),
  "verdict": "pass"|"revise"|"reject",
  "dimensions": { "hierarchy": n, "typography": n, "color": n, "spacing": n, "signatureDevices": n, "imagery": n, "polish": n, "believability": n },
  "findings": [ { "severity": "info"|"warn"|"block", "area": string, "message": string, "fix"?: string } ],
  "summary": string
}`;

  const result = await generateVision({
    model,
    system,
    text,
    image: { bytes: shot.bytes, mediaType: shot.mediaType },
    maxOutputTokens: 3000,
  });

  const report = parseReport(result.text);
  return { report, screenshot: shot, rawText: result.text };
}

function parseReport(text: string): CriticReport {
  try {
    const s = text.indexOf('{');
    const e = text.lastIndexOf('}');
    const obj = JSON.parse(text.slice(s, e + 1));
    const verdict = obj.verdict === 'pass' || obj.verdict === 'reject' ? obj.verdict : 'revise';
    return {
      score: clamp(Number(obj.score) || 0),
      verdict,
      dimensions: typeof obj.dimensions === 'object' && obj.dimensions ? obj.dimensions : {},
      findings: Array.isArray(obj.findings)
        ? obj.findings.map((f: Record<string, unknown>) => ({
            severity: f.severity === 'block' || f.severity === 'warn' ? f.severity : 'info',
            area: String(f.area ?? 'general'),
            message: String(f.message ?? ''),
            fix: f.fix ? String(f.fix) : undefined,
          }))
        : [],
      summary: String(obj.summary ?? ''),
    };
  } catch {
    return { score: 0, verdict: 'revise', dimensions: {}, findings: [{ severity: 'warn', area: 'critic', message: 'could not parse visual-critic output' }], summary: text.slice(0, 400) };
  }
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
