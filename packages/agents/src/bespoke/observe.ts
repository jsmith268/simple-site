import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { AssetManifest, BuildReport, BuildRun, BusinessProfile, CriticReport, SiteIA } from '@simplesight/contracts';
import type { DesignBrief } from './brief';
import type { ResolvedDesign } from './validate';

/* Phase 10 — observability read-model. The orchestrator persists every artifact
 * to <dir>/.simplesight; this reads them back into one inspectable bundle for
 * an admin view (brief, IA, files, critic scores, cost, stage traces). */

export interface BuildArtifacts {
  run?: BuildRun;
  profile?: BusinessProfile;
  brief?: DesignBrief;
  design?: ResolvedDesign;
  ia?: SiteIA;
  assets?: AssetManifest;
  buildReport?: BuildReport;
  visualReport?: CriticReport;
  generatedFiles: { path: string; bytes: number }[];
}

function readJson<T>(dir: string, name: string): T | undefined {
  const p = join(dir, '.simplesight', name);
  return existsSync(p) ? (JSON.parse(readFileSync(p, 'utf8')) as T) : undefined;
}

function walkApp(dir: string): { path: string; bytes: number }[] {
  const root = join(dir, 'app');
  if (!existsSync(root)) return [];
  const out: { path: string; bytes: number }[] = [];
  const walk = (d: string) => {
    for (const e of readdirSync(d)) {
      const full = join(d, e);
      const st = statSync(full);
      if (st.isDirectory()) walk(full);
      else if (/\.(tsx|ts|css)$/.test(e)) out.push({ path: full.slice(dir.length + 1), bytes: st.size });
    }
  };
  walk(root);
  return out.sort((a, b) => a.path.localeCompare(b.path));
}

/** Read all persisted artifacts for a build directory. */
export function readBuildArtifacts(dir: string): BuildArtifacts {
  return {
    run: readJson<BuildRun>(dir, 'run.json'),
    profile: readJson<BusinessProfile>(dir, 'profile.json'),
    brief: readJson<DesignBrief>(dir, 'brief.json'),
    design: readJson<ResolvedDesign>(dir, 'design.json'),
    ia: readJson<SiteIA>(dir, 'ia.json'),
    assets: readJson<AssetManifest>(dir, 'assets.json'),
    buildReport: readJson<BuildReport>(dir, 'build-report.json'),
    visualReport: readJson<CriticReport>(dir, 'visual-report.json'),
    generatedFiles: walkApp(dir),
  };
}

/** A compact human/operator summary of a run. */
export function summarizeRun(a: BuildArtifacts): string {
  const r = a.run;
  const lines: string[] = [];
  if (r) {
    lines.push(`Run ${r.id} · ${r.slug} · ${r.status}${r.previewUrl ? ` · ${r.previewUrl}` : ''}`);
    lines.push(`Cost: ${(r.costCents / 100).toFixed(2)} USD${r.costCeilingCents ? ` / ceiling ${(r.costCeilingCents / 100).toFixed(2)}` : ''}`);
    lines.push(`Stages: ${r.stages.map((s) => `${s.name}:${s.status}(${Math.round(s.ms / 1000)}s${s.attempts > 1 ? `,×${s.attempts}` : ''})`).join(' → ')}`);
    if (r.escalation) lines.push(`⚠ Held: ${r.escalation}`);
  }
  if (a.brief) lines.push(`Direction: ${(a.brief.direction.split('—')[0] ?? a.brief.direction).trim()}`);
  if (a.ia) lines.push(`Pages: ${a.ia.pages.map((p) => p.slug).join(', ')}`);
  lines.push(`Generated files: ${a.generatedFiles.length}`);
  if (a.buildReport) lines.push(`Build: ${a.buildReport.ok ? 'passed' : 'FAILED'} in ${a.buildReport.attempts} attempt(s)${a.buildReport.filesFixed.length ? `, fixed ${a.buildReport.filesFixed.join(', ')}` : ''}`);
  if (a.visualReport) lines.push(`Visual critic: ${a.visualReport.score} (${a.visualReport.verdict}) — ${a.visualReport.findings.filter((f) => f.severity === 'block').length} blocking`);
  return lines.join('\n');
}
