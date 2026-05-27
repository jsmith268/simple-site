import { exec } from 'node:child_process';

/* Per-site deploy. Each bespoke site is its own Vercel deployment. Uses the
 * authenticated `vercel` CLI from the app dir (the path proven on the live
 * builds); the API-based provisioning in @simplesight/provisioning remains for
 * domain attach / go-live. */

export interface DeployResult {
  ok: boolean;
  url?: string;
  output: string;
}

export interface DeployOptions {
  dir: string;
  scope?: string;
  /** production deploy (default true). */
  prod?: boolean;
  timeoutMs?: number;
}

export function deploySite(opts: DeployOptions): Promise<DeployResult> {
  const scope = opts.scope ? `--scope ${opts.scope}` : '';
  const target = opts.prod === false ? '' : '--prod';
  const cmd = `vercel deploy --yes ${target} ${scope}`.replace(/\s+/g, ' ').trim();
  return new Promise((resolve) => {
    exec(cmd, { cwd: opts.dir, timeout: opts.timeoutMs ?? 600000, maxBuffer: 16 * 1024 * 1024 }, (err, stdout, stderr) => {
      const out = `${stdout}\n${stderr}`;
      const urls = out.match(/https:\/\/[^\s]+\.vercel\.app/g) ?? [];
      resolve({ ok: !err && urls.length > 0, url: urls[urls.length - 1], output: out.slice(-4000) });
    });
  });
}
