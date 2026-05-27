'use server';

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import {
  aggregateFindings,
  type BuildArtifacts,
  proposeSkillUpdate,
  readBuildArtifacts,
  type SkillProposalType,
} from '@simplesight/agents';
import { getSkillOverrides, setSkillOverride } from '@simplesight/db';
import { skills as baseSkills } from '@simplesight/skills';

/** Where standalone bespoke build dirs live (each holds .simplesight/run.json). */
function buildsRoot(): string {
  return process.env.BESPOKE_BUILDS_ROOT ?? join(homedir(), 'Projects');
}

export interface BuildSummary {
  slug: string;
  dir: string;
  status?: string;
  direction?: string;
  pages: number;
  files: number;
  costCents: number;
  visualScore?: number;
  visualVerdict?: string;
  previewUrl?: string;
  escalation?: string;
  updatedAt?: string;
}

function summarize(dir: string, a: BuildArtifacts): BuildSummary {
  return {
    slug: a.run?.slug ?? dir.split('/').pop() ?? dir,
    dir,
    status: a.run?.status,
    direction: a.brief?.direction?.split('—')[0]?.trim(),
    pages: a.ia?.pages.length ?? 0,
    files: a.generatedFiles.length,
    costCents: a.run?.costCents ?? 0,
    visualScore: a.visualReport?.score,
    visualVerdict: a.visualReport?.verdict,
    previewUrl: a.run?.previewUrl,
    escalation: a.run?.escalation,
    updatedAt: a.run?.updatedAt,
  };
}

/** List every bespoke build found under the builds root. */
export async function listBespokeBuilds(): Promise<BuildSummary[]> {
  const root = buildsRoot();
  if (!existsSync(root)) return [];
  const out: BuildSummary[] = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const dir = join(root, entry.name);
    if (!existsSync(join(dir, '.simplesight', 'run.json'))) continue;
    try {
      out.push(summarize(dir, readBuildArtifacts(dir)));
    } catch {
      /* skip unreadable */
    }
  }
  return out.sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));
}

/** Full artifact bundle for one build (by slug). */
export async function loadBespokeBuild(slug: string): Promise<BuildArtifacts | null> {
  const root = buildsRoot();
  if (!existsSync(root)) return null;
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const dir = join(root, entry.name);
    const runPath = join(dir, '.simplesight', 'run.json');
    if (!existsSync(runPath)) continue;
    const run = JSON.parse(readFileSync(runPath, 'utf8')) as { slug?: string };
    if (run.slug === slug || entry.name === slug) return readBuildArtifacts(dir);
  }
  return null;
}

/**
 * Learning loop: turn a build's visual-critic findings into a proposed skill
 * edit (does NOT apply — operator approves). Targets the existing skill whose
 * name best matches, else proposes a new one.
 */
export async function proposeSkillFromBuildAction(slug: string): Promise<{ ok: boolean; proposal?: SkillProposalType; error?: string }> {
  const a = await loadBespokeBuild(slug);
  if (!a?.visualReport) return { ok: false, error: 'No visual-critic report for this build.' };
  const { guidance } = aggregateFindings([a.visualReport]);
  const feedback = guidance || a.visualReport.findings.map((f) => `- [${f.severity}] ${f.area}: ${f.message}${f.fix ? ` → ${f.fix}` : ''}`).join('\n');
  if (!feedback.trim()) return { ok: false, error: 'No actionable findings.' };

  // Target the design-standards skill if present (most relevant), else propose new.
  const overrides = await getSkillOverrides();
  const target = baseSkills.find((s) => s.name === 'designStandards' || s.name === 'design-standards' || s.name === 'premium-design');
  const existing = target ? { name: target.name, body: overrides[target.name] ?? target.body } : undefined;

  try {
    const proposal = await proposeSkillUpdate(`Visual-critic findings from the "${slug}" build:\n${feedback}`, 'anthropic/claude-opus-4.7', existing);
    return { ok: true, proposal };
  } catch (err) {
    return { ok: false, error: String((err as Error)?.message ?? err) };
  }
}

/** Apply an approved skill proposal as a fleet-wide override. */
export async function applySkillProposalAction(name: string, body: string): Promise<{ ok: boolean }> {
  await setSkillOverride(name, body, 'learning-loop');
  return { ok: true };
}
