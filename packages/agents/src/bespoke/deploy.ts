import { exec } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

/* Per-site deploy. Each bespoke site is its own Vercel deployment. Uses the
 * authenticated `vercel` CLI from the app dir (the path proven on the live
 * builds); the API-based provisioning in @simplesight/provisioning remains for
 * domain attach / go-live. */

/** Vercel API token: explicit env, else the logged-in CLI's auth.json. */
function vercelToken(): string | undefined {
  if (process.env.VERCEL_API_TOKEN) return process.env.VERCEL_API_TOKEN;
  try {
    return JSON.parse(readFileSync(join(homedir(), 'Library/Application Support/com.vercel.cli/auth.json'), 'utf8')).token;
  } catch {
    return undefined;
  }
}

/**
 * Turn OFF Vercel deployment protection on the just-deployed project so the
 * convergence loop (and the customer) can reach the site without an auth wall.
 * Best-effort: new projects inherit the team default, so we clear it per build.
 */
async function disableProtection(dir: string): Promise<void> {
  try {
    const meta = JSON.parse(readFileSync(join(dir, '.vercel', 'project.json'), 'utf8')) as { projectId?: string; orgId?: string };
    const tok = vercelToken();
    if (!tok || !meta.projectId) return;
    const q = meta.orgId ? `?teamId=${meta.orgId}` : '';
    await fetch(`https://api.vercel.com/v9/projects/${meta.projectId}${q}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ssoProtection: null, passwordProtection: null }),
    });
  } catch {
    /* best-effort — never fail the deploy over protection */
  }
}

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
    exec(cmd, { cwd: opts.dir, timeout: opts.timeoutMs ?? 600000, maxBuffer: 16 * 1024 * 1024 }, async (err, stdout, stderr) => {
      const out = `${stdout}\n${stderr}`;
      const urls = out.match(/https:\/\/[^\s]+\.vercel\.app/g) ?? [];
      const ok = !err && urls.length > 0;
      if (ok) await disableProtection(opts.dir); // make the deploy publicly reachable for the critics + customer
      resolve({ ok, url: urls[urls.length - 1], output: out.slice(-4000) });
    });
  });
}
