import { exec } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

/* A build runner abstracts WHERE generated code is installed + built. The local
 * runner uses the host machine; the Sandbox runner uses an ephemeral Vercel
 * Sandbox microVM (production — the host running this code is serverless and
 * cannot npm-install/build). Both implement the same interface so the
 * code-critic is runner-agnostic. */

const IGNORE_DIRS = new Set(['node_modules', '.next', '.git', '.vercel', '.turbo', 'dist']);

/** Collect a generated app's source files (relative paths) for upload, skipping build artifacts. */
function collectFiles(root: string): { path: string; content: Buffer }[] {
  const out: { path: string; content: Buffer }[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.') && entry.name !== '.env' && entry.name !== '.npmrc') {
        if (entry.isDirectory() && IGNORE_DIRS.has(entry.name)) continue;
      }
      const abs = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (IGNORE_DIRS.has(entry.name)) continue;
        walk(abs);
      } else if (entry.isFile() && statSync(abs).size < 2 * 1024 * 1024) {
        out.push({ path: relative(root, abs).split(sep).join('/'), content: readFileSync(abs) });
      }
    }
  };
  walk(root);
  return out;
}

export interface BuildOutcome {
  ok: boolean;
  /** Combined stdout+stderr (trimmed to a useful tail). */
  output: string;
  code: number | null;
}

export interface BuildRunner {
  install(dir: string): Promise<BuildOutcome>;
  build(dir: string): Promise<BuildOutcome>;
}

function run(cmd: string, cwd: string, timeoutMs: number): Promise<BuildOutcome> {
  return new Promise((resolve) => {
    exec(cmd, { cwd, timeout: timeoutMs, maxBuffer: 32 * 1024 * 1024, env: { ...process.env, CI: '1', NEXT_TELEMETRY_DISABLED: '1' } }, (err, stdout, stderr) => {
      const output = `${stdout}\n${stderr}`.trim();
      resolve({ ok: !err, output: output.slice(-12000), code: (err as { code?: number } | null)?.code ?? (err ? 1 : 0) });
    });
  });
}

/** Runs install + build on the host machine. */
export class LocalBuildRunner implements BuildRunner {
  constructor(private opts: { packageManager?: 'npm' | 'pnpm'; installTimeoutMs?: number; buildTimeoutMs?: number } = {}) {}
  install(dir: string): Promise<BuildOutcome> {
    const pm = this.opts.packageManager ?? 'npm';
    const cmd = pm === 'pnpm' ? 'pnpm install --no-frozen-lockfile' : 'npm install --no-audit --no-fund';
    return run(cmd, dir, this.opts.installTimeoutMs ?? 300000);
  }
  build(dir: string): Promise<BuildOutcome> {
    const pm = this.opts.packageManager ?? 'npm';
    return run(`${pm} run build`, dir, this.opts.buildTimeoutMs ?? 300000);
  }
}

/**
 * Vercel Sandbox runner (ephemeral microVM). The production substrate: the host
 * running this orchestrator is serverless and can't npm-install/build, so the
 * generated app is uploaded to a Sandbox where install + build run. The same
 * Sandbox is reused across the code-critic's fix→rebuild loop (re-uploading the
 * edited files each time). Auth via VERCEL_API_TOKEN (+ optional VERCEL_TEAM_ID).
 */
export class SandboxBuildRunner implements BuildRunner {
  // biome-ignore lint/suspicious/noExplicitAny: @vercel/sandbox types are loaded dynamically
  private sandbox: any | null = null;

  constructor(private opts: { timeoutMs?: number; runtime?: string } = {}) {}

  private async ensureSandbox(): Promise<{
    // biome-ignore lint/suspicious/noExplicitAny: dynamic SDK
    writeFiles: (f: { path: string; content: Buffer }[]) => Promise<void>;
    // biome-ignore lint/suspicious/noExplicitAny: dynamic SDK
    runCommand: (...a: any[]) => Promise<any>;
  }> {
    if (this.sandbox) return this.sandbox;
    const { Sandbox } = await import('@vercel/sandbox');
    this.sandbox = await Sandbox.create({
      token: process.env.VERCEL_API_TOKEN,
      teamId: process.env.VERCEL_TEAM_ID,
      timeout: this.opts.timeoutMs ?? 15 * 60 * 1000,
      runtime: this.opts.runtime ?? 'node24',
      // biome-ignore lint/suspicious/noExplicitAny: credentials/runtime union is intricate; verified at runtime
    } as any);
    return this.sandbox;
  }

  private async upload(dir: string): Promise<void> {
    const sbx = await this.ensureSandbox();
    const files = collectFiles(dir);
    // writeFiles in batches to keep request sizes sane.
    for (let i = 0; i < files.length; i += 200) {
      await sbx.writeFiles(files.slice(i, i + 200));
    }
  }

  // biome-ignore lint/suspicious/noExplicitAny: dynamic SDK result
  private async outcome(result: any): Promise<BuildOutcome> {
    const code = typeof result?.exitCode === 'number' ? result.exitCode : result?.exitCode == null ? null : 1;
    let stdout = '';
    let stderr = '';
    try {
      stdout = typeof result?.stdout === 'function' ? await result.stdout() : (result?.stdout ?? '');
      stderr = typeof result?.stderr === 'function' ? await result.stderr() : (result?.stderr ?? '');
    } catch {
      /* output best-effort */
    }
    const output = `${stdout}\n${stderr}`.trim().slice(-12000);
    return { ok: code === 0, output, code };
  }

  async install(dir: string): Promise<BuildOutcome> {
    const sbx = await this.ensureSandbox();
    await this.upload(dir);
    return this.outcome(await sbx.runCommand('npm', ['install', '--no-audit', '--no-fund']));
  }

  async build(dir: string): Promise<BuildOutcome> {
    const sbx = await this.ensureSandbox();
    await this.upload(dir); // re-sync any files the critic edited since install
    return this.outcome(await sbx.runCommand('npm', ['run', 'build']));
  }
}

/**
 * The runner to use by default. In a deployed (serverless) environment with a
 * Vercel token we MUST use the Sandbox — the host can't build. Locally (or when
 * SIMPLESIGHT_USE_SANDBOX=0) we use the host machine.
 */
export function defaultBuildRunner(): BuildRunner {
  const useSandbox = process.env.SIMPLESIGHT_USE_SANDBOX === '1' || (!!process.env.VERCEL && !!process.env.VERCEL_API_TOKEN);
  return useSandbox ? new SandboxBuildRunner() : new LocalBuildRunner();
}
