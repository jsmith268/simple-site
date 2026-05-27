import { exec } from 'node:child_process';

/* A build runner abstracts WHERE generated code is installed + built. The local
 * runner uses the host machine; a Vercel Sandbox runner (ephemeral microVM) can
 * be dropped in later behind the same interface — the code-critic doesn't care. */

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
 * Placeholder for the Vercel Sandbox runner (ephemeral microVM). Wired in Phase 9
 * alongside screenshotting. Implements the same interface so the code-critic is
 * runner-agnostic.
 */
export class SandboxBuildRunner implements BuildRunner {
  async install(_dir: string): Promise<BuildOutcome> {
    throw new Error('SandboxBuildRunner not configured — set up Vercel Sandbox (see Phase 9). Use LocalBuildRunner meanwhile.');
  }
  async build(_dir: string): Promise<BuildOutcome> {
    throw new Error('SandboxBuildRunner not configured.');
  }
}
