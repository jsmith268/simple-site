import { generateJson } from '@simplesight/engine';
import type { CriticReport } from '@simplesight/contracts';
import { z } from 'zod';

/* Phase 10 — the learning loop. Operator/critic feedback becomes (a) immediate
 * prompt guidance for future builds, and (b) proposed skill edits that, once
 * approved, lift every future build (applied via skill_overrides). */

/** Aggregate recurring findings across runs into injectable generation guidance. */
export function aggregateFindings(reports: CriticReport[]): { guidance: string; topAreas: { area: string; count: number }[] } {
  const byArea = new Map<string, { count: number; msgs: Set<string> }>();
  for (const r of reports) {
    for (const f of r.findings) {
      if (f.severity === 'info') continue;
      const e = byArea.get(f.area) ?? { count: 0, msgs: new Set<string>() };
      e.count += f.severity === 'block' ? 2 : 1;
      if (f.fix) e.msgs.add(f.fix);
      byArea.set(f.area, e);
    }
  }
  const topAreas = [...byArea.entries()].map(([area, e]) => ({ area, count: e.count })).sort((a, b) => b.count - a.count);
  const guidance = topAreas
    .slice(0, 6)
    .map(({ area }) => {
      const fixes = [...(byArea.get(area)?.msgs ?? [])].slice(0, 3);
      return `- ${area}: ${fixes.join(' ') || 'recurring issue — pay special attention.'}`;
    })
    .join('\n');
  return { guidance: guidance ? `LEARNED GUIDANCE (recurring critic findings — avoid these):\n${guidance}` : '', topAreas };
}

export const SkillProposal = z.object({
  name: z.string(),
  summary: z.string(),
  body: z.string(),
  rationale: z.string(),
});
export type SkillProposal = z.infer<typeof SkillProposal>;

/**
 * Meta-agent: turn operator feedback (and/or aggregated critic findings) into a
 * proposed new/edited skill. Returns a proposal for human approval; once
 * approved, persist via setSkillOverride so it injects into future prompts.
 */
export async function proposeSkillUpdate(
  feedback: string,
  model: string,
  existing?: { name: string; body: string },
): Promise<SkillProposal> {
  const system = `You maintain the design/voice skill library for an automated web studio. Convert the feedback into ${existing ? 'an EDITED version of an existing skill' : 'a new skill'} — concise, concrete, imperative guidance an LLM producer can apply to every future build. No fluff; specific techniques and banned patterns. Output ONLY JSON { name, summary, body, rationale }.`;
  const prompt = `${existing ? `EXISTING SKILL "${existing.name}":\n${existing.body}\n\n` : ''}FEEDBACK to incorporate:\n${feedback}\n\nReturn the ${existing ? 'updated' : 'new'} skill as JSON { "name": kebab-case, "summary": one line, "body": markdown guidance, "rationale": why this helps }.`;
  return generateJson({ model, schema: SkillProposal, system, prompt, maxOutputTokens: 2000 });
}
