import { generateJson, MODELS } from '@simplesight/engine';
import { type CriticReport, CriticReport as CriticReportSchema } from '@simplesight/contracts';
import type { DesignBrief } from './brief';

/**
 * Content critic — reviews the VISIBLE TEXT of a page as an award-winning copy
 * editor: grammar, idiom/natural English, clarity, voice consistency, no
 * placeholder/fabricated copy. Reads the rendered text (not a screenshot), which
 * is far more reliable for catching errors like "roasted on Alberta" → "in".
 * Grammar/idiom errors are BLOCKING.
 */
export async function runContentCritic(opts: {
  text: string;
  brief?: DesignBrief;
  pageName?: string;
  model?: string;
}): Promise<CriticReport> {
  const model = opts.model ?? MODELS.opus;
  const system = `You are an award-winning website copy editor reviewing the VISIBLE TEXT of one web page for an informational small-business website. Judge it as publish-ready marketing copy.

Catch EVERY: grammar error; idiom / natural-English error (e.g. "roasted on Alberta" must be "roasted in Alberta"); awkward or unidiomatic phrasing; inconsistent or off-brand voice; placeholder/lorem/obviously-fabricated content; unclear or empty messaging; typos; punctuation/spacing issues.

CRITICAL — RAW ESCAPE SEQUENCES: if any literal escape shows up as visible text — e.g. "\\u2014", "\\u2019", "\\u2013", "\\x..", "&#x2014;", or a stray "/u2019" — that is a BLOCKING rendering defect (the real character —, ', – should appear instead). Flag EVERY occurrence on EVERY page; quote it.

Quote the exact offending text in each finding. Grammar, idiom, and raw-escape errors are BLOCKING (severity "block"). Output ONLY one JSON object.`;

  const shape = `Return CriticReport JSON:
{
  "score": 0-100 (overall copy quality),
  "verdict": "pass"|"revise"|"reject",
  "dimensions": { "grammar": n, "clarity": n, "idiom": n, "voiceConsistency": n, "specificity": n, "scannability": n },
  "findings": [ { "severity": "info"|"warn"|"block", "area": string, "message": string (QUOTE the offending text), "fix"?: string (the corrected text) } ],
  "summary": string
}
verdict is "pass" ONLY if there are zero grammar/idiom errors AND score >= 80.`;

  return generateJson({
    model,
    schema: CriticReportSchema,
    system,
    prompt: `${opts.brief ? `Brand voice to honor: ${opts.brief.voice}\n` : ''}${opts.pageName ? `Page: ${opts.pageName}\n` : ''}
VISIBLE PAGE TEXT:
"""
${opts.text.slice(0, 14000)}
"""

${shape}`,
    maxOutputTokens: 3000,
  });
}
