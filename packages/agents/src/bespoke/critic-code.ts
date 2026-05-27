import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { resilientGenerateText } from '@simplesight/engine';
import type { BuildReport } from '@simplesight/contracts';
import { parseDelimitedFiles } from './parse';
import type { BuildRunner } from './runner';

export interface CodeCriticArgs {
  dir: string;
  model: string;
  runner: BuildRunner;
  maxAttempts?: number;
  skipInstall?: boolean;
}

/** Files the build error text refers to (so we send Opus the right ones to fix). */
function referencedFiles(output: string): string[] {
  const set = new Set<string>();
  const re = /(?:^|[\s(])((?:\.\/)?app\/[\w./-]+\.(?:tsx|ts|css))/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(output))) set.add((m[1] ?? '').replace(/^\.\//, ''));
  return [...set];
}

/**
 * Code-critic: install + build the generated app, and on failure reprompt Opus
 * to repair the offending files, bounded. The reliability gate that makes
 * unattended generation safe — per the no-fallback decision, a build that can't
 * be made to pass becomes a hold-for-human upstream.
 */
export async function runCodeCritic(args: CodeCriticArgs): Promise<BuildReport> {
  const { dir, model, runner } = args;
  const maxAttempts = args.maxAttempts ?? 6;
  const start = Date.now();
  const filesFixed = new Set<string>();
  const errors: string[] = [];

  if (!args.skipInstall) {
    const install = await runner.install(dir);
    if (!install.ok) {
      return { ok: false, attempts: 0, errors: [`install failed:\n${install.output}`], durationMs: Date.now() - start, filesFixed: [] };
    }
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const build = await runner.build(dir);
    if (build.ok) {
      return { ok: true, attempts: attempt, errors, durationMs: Date.now() - start, filesFixed: [...filesFixed] };
    }
    errors.push(build.output.slice(-2000));
    if (attempt === maxAttempts) break;

    // Gather the files the error points at (fallback: common entry files).
    let paths = referencedFiles(build.output).filter((p) => existsSync(join(dir, p)));
    if (paths.length === 0) {
      paths = ['app/page.tsx', 'app/layout.tsx', 'app/globals.css'].filter((p) => existsSync(join(dir, p)));
    }
    paths = paths.slice(0, 4); // keep the reprompt focused
    const blocks = paths
      .map((p) => `=== FILE: ${p} ===\n${readFileSync(join(dir, p), 'utf8')}`)
      .join('\n\n');

    const system = `You are fixing a Next.js 16 (App Router) + Tailwind v4 build error. Return ONLY the corrected, COMPLETE file(s) in this exact delimited format and nothing else:
=== FILE: <path> ===
<code>

Rules: keep the design/markup intact; fix only what breaks the build. Components using useState/onClick/onSubmit/onChange need 'use client' as the first line; pages must not. No next/image, no next/font, no extra libraries. Escape JSX entities. Fix import/prop mismatches.`;
    const prompt = `The build failed with:\n\n${build.output.slice(-6000)}\n\nHere are the current files to correct:\n\n${blocks}\n\nReturn the corrected complete file(s) now.`;

    try {
      const r = await resilientGenerateText({ model, system, prompt, maxOutputTokens: 24000 });
      const fixes = parseDelimitedFiles(r.text);
      for (const f of fixes) {
        if (paths.includes(f.path) || existsSync(join(dir, f.path))) {
          writeFileSync(join(dir, f.path), f.contents);
          filesFixed.add(f.path);
        }
      }
      if (fixes.length === 0) errors.push('fix attempt produced no parseable files');
    } catch (err) {
      errors.push(`fix attempt error: ${String((err as Error)?.message ?? err)}`);
    }
  }

  return { ok: false, attempts: maxAttempts, errors, durationMs: Date.now() - start, filesFixed: [...filesFixed] };
}
