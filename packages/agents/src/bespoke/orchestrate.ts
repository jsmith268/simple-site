import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  type AssetManifest,
  type BuildRun,
  type BuildStage,
  type BuildStageName,
  type BusinessProfile,
  type SiteIA,
} from '@simplesight/contracts';
import { type DesignBrief, generateDesignBrief } from './brief';
import { generateBusinessProfile, profileToBriefInput } from './profile';
import { type ResolvedDesign, validateDesignBrief } from './validate';
import { generateSiteIA, validateSiteIA } from './ia';
import { buildAssetManifest } from './assets';
import { scaffoldNextApp, writeGeneratedFiles } from './scaffold';
import { generateFoundation } from './foundation';
import { generatePage, pageFilePath } from './page';
import { runCodeCritic } from './critic-code';
import { LocalBuildRunner, type BuildRunner } from './runner';

const DEFAULT_MODEL = 'anthropic/claude-opus-4.7';

export interface BespokeBuildArgs {
  /** Freeform pitch OR an already-structured BusinessProfile. */
  input: string | BusinessProfile;
  projectId: string;
  slug: string;
  /** Absolute path for the standalone app (OUTSIDE the monorepo). */
  dir: string;
  model?: string;
  costCeilingCents?: number;
  runner?: BuildRunner;
  /** Skip the install+build code-critic (e.g. when only regenerating content). */
  skipCodeCritic?: boolean;
}

/* Filesystem artifact store under <dir>/.simplesight — gives resumability
 * (skip completed stages on re-run) and an inspectable record per build. */
function artDir(dir: string) {
  const d = join(dir, '.simplesight');
  mkdirSync(d, { recursive: true });
  return d;
}
function save(dir: string, name: string, data: unknown) {
  writeFileSync(join(artDir(dir), name), JSON.stringify(data, null, 2));
}
function load<T>(dir: string, name: string): T | undefined {
  const p = join(artDir(dir), name);
  return existsSync(p) ? (JSON.parse(readFileSync(p, 'utf8')) as T) : undefined;
}

/**
 * The orchestrated bespoke build: profile → brief → IA → assets → scaffold →
 * foundation → pages → code-critic. Checkpointed (resumable), cost-bounded
 * (cost-sentinel), and it holds-for-human rather than shipping broken — the
 * locked no-fallback policy. Returns the BuildRun record (persisted to run.json).
 */
export async function runBespokeBuild(args: BespokeBuildArgs): Promise<BuildRun> {
  const model = args.model ?? DEFAULT_MODEL;
  const runner = args.runner ?? new LocalBuildRunner();
  const now = () => new Date().toISOString();

  const run: BuildRun =
    load<BuildRun>(args.dir, 'run.json') ?? {
      id: `run-${Date.now()}`,
      projectId: args.projectId,
      slug: args.slug,
      model,
      status: 'running',
      stages: [],
      costCents: 0,
      costCeilingCents: args.costCeilingCents,
      createdAt: now(),
      updatedAt: now(),
    };
  run.status = 'running';

  const stageRec = (name: BuildStageName): BuildStage => {
    let s = run.stages.find((x) => x.name === name);
    if (!s) {
      s = { name, status: 'pending', ms: 0, costCents: 0, attempts: 0 };
      run.stages.push(s);
    }
    return s;
  };
  const persist = () => {
    run.updatedAt = now();
    save(args.dir, 'run.json', run);
  };
  const addCost = (cents: number, stage: BuildStage) => {
    stage.costCents += cents;
    run.costCents += cents;
  };
  const overBudget = () => args.costCeilingCents != null && run.costCents > args.costCeilingCents;
  const hold = (reason: string): BuildRun => {
    run.status = 'held_for_human';
    run.escalation = reason;
    persist();
    return run;
  };

  /** Run a stage with checkpoint skip + timing + persistence. */
  async function stage<T>(name: BuildStageName, artifact: string | null, fn: () => Promise<{ value: T; costCents?: number; note?: string }>, loadFn?: () => T | undefined): Promise<T> {
    const s = stageRec(name);
    if (s.status === 'completed' && loadFn) {
      const cached = loadFn();
      if (cached !== undefined) return cached;
    }
    s.status = 'running';
    s.attempts += 1;
    persist();
    const t0 = Date.now();
    const { value, costCents, note } = await fn();
    s.ms += Date.now() - t0;
    if (costCents) addCost(costCents, s);
    if (note) s.note = note;
    s.status = 'completed';
    if (artifact) save(args.dir, artifact, value as unknown);
    persist();
    return value;
  }

  // 1) Profile
  const profile = await stage<BusinessProfile>(
    'profile',
    'profile.json',
    async () => {
      if (typeof args.input !== 'string') return { value: args.input };
      return { value: await generateBusinessProfile(args.input, model), costCents: 30 };
    },
    () => load<BusinessProfile>(args.dir, 'profile.json'),
  );

  // 2) Brief (+ resolved design)
  const brief = await stage<DesignBrief>(
    'brief',
    'brief.json',
    async () => ({ value: await generateDesignBrief(profileToBriefInput(profile), model), costCents: 40 }),
    () => load<DesignBrief>(args.dir, 'brief.json'),
  );
  let design = load<ResolvedDesign>(args.dir, 'design.json');
  if (!design) {
    design = validateDesignBrief(brief);
    save(args.dir, 'design.json', design);
    if (design.warnings.length) stageRec('brief').note = design.warnings.join(' | ');
    persist();
  }
  if (overBudget()) return hold(`cost ceiling exceeded after brief (${run.costCents}¢)`);

  // 3) IA (+ deterministic gate; one regen on blocking findings)
  const ia = await stage<SiteIA>(
    'ia',
    'ia.json',
    async () => {
      let candidate = await generateSiteIA(profile, brief, model);
      let gate = validateSiteIA(candidate, profile);
      let cost = 80;
      if (!gate.ok) {
        candidate = await generateSiteIA(profile, brief, model);
        gate = validateSiteIA(candidate, profile);
        cost += 80;
      }
      return { value: candidate, costCents: cost, note: gate.ok ? undefined : `IA gate: ${gate.findings.filter((f) => f.severity === 'block').map((f) => f.message).join('; ')}` };
    },
    () => load<SiteIA>(args.dir, 'ia.json'),
  );
  const iaGate = validateSiteIA(ia, profile);
  if (!iaGate.ok) return hold(`IA failed the gate: ${iaGate.findings.filter((f) => f.severity === 'block').map((f) => f.message).join('; ')}`);
  if (overBudget()) return hold(`cost ceiling exceeded after IA (${run.costCents}¢)`);

  // 4) Assets
  const assets = await stage<AssetManifest>(
    'assets',
    'assets.json',
    async () => ({ value: await buildAssetManifest(profile, ia) }),
    () => load<AssetManifest>(args.dir, 'assets.json'),
  );

  // 5) Scaffold
  await stage<boolean>('scaffold', null, async () => {
    if (!existsSync(join(args.dir, 'package.json'))) scaffoldNextApp({ dir: args.dir, slug: args.slug });
    return { value: true };
  });

  // 6) Foundation (skip if all files already on disk)
  await stage<boolean>('foundation', null, async () => {
    const res = await generateFoundation({ profile, brief, design: design as ResolvedDesign, ia, assets, model });
    writeGeneratedFiles(args.dir, res.files);
    save(args.dir, 'foundation-files.json', res.files.map((f) => f.path));
    return { value: true, costCents: res.costCents, note: res.missing.length ? `missing: ${res.missing.join(', ')}` : undefined };
  });
  if (overBudget()) return hold(`cost ceiling exceeded after foundation (${run.costCents}¢)`);

  // 7) Pages (sequential, save-as-you-go, skip existing)
  const pagesStage = stageRec('pages');
  pagesStage.status = 'running';
  persist();
  for (const page of ia.pages) {
    const fp = pageFilePath(page.slug);
    if (existsSync(join(args.dir, fp))) continue;
    const t0 = Date.now();
    const res = await generatePage({ profile, brief, design: design as ResolvedDesign, ia, page, assets, model });
    writeGeneratedFiles(args.dir, [res.file]);
    pagesStage.ms += Date.now() - t0;
    addCost(res.costCents, pagesStage);
    persist();
    if (overBudget()) return hold(`cost ceiling exceeded during pages (${run.costCents}¢)`);
  }
  pagesStage.status = 'completed';
  persist();

  // 8) Code-critic (install + build + fix loop)
  if (!args.skipCodeCritic) {
    const cc = stageRec('code_critic');
    cc.status = 'running';
    persist();
    const report = await runCodeCritic({ dir: args.dir, model, runner });
    cc.ms += report.durationMs;
    cc.attempts = report.attempts;
    cc.note = report.ok ? `built in ${report.attempts} attempt(s)${report.filesFixed.length ? `, fixed ${report.filesFixed.join(', ')}` : ''}` : report.errors.slice(-1)[0];
    cc.status = report.ok ? 'completed' : 'failed';
    save(args.dir, 'build-report.json', report);
    persist();
    if (!report.ok) return hold(`code-critic could not produce a passing build after ${report.attempts} attempts`);
  }

  run.status = 'succeeded';
  persist();
  return run;
}
