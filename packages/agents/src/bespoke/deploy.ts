import { exec } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/* Per-site deploy. Each bespoke site is its own Vercel deployment, shipped with
 * the `vercel` CLI authenticated by VERCEL_API_TOKEN (works on any server / in a
 * Sandbox — no interactive login, no local auth.json). The API-based
 * provisioning in @simplesight/provisioning handles domain attach / go-live. */

/** Vercel API token from the environment (the only server-safe source). */
function vercelToken(): string | undefined {
  return process.env.VERCEL_API_TOKEN || undefined;
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
  const tok = vercelToken();
  const token = tok ? `--token ${tok}` : '';
  const scope = opts.scope ? `--scope ${opts.scope}` : '';
  const target = opts.prod === false ? '' : '--prod';
  // npx so it works without a global install (e.g. inside a Sandbox).
  const cmd = `npx --yes vercel deploy --yes ${target} ${token} ${scope}`.replace(/\s+/g, ' ').trim();
  return new Promise((resolve) => {
    if (!tok) {
      resolve({ ok: false, url: undefined, output: 'VERCEL_API_TOKEN not set — cannot deploy.' });
      return;
    }
    exec(cmd, { cwd: opts.dir, timeout: opts.timeoutMs ?? 600000, maxBuffer: 16 * 1024 * 1024 }, async (err, stdout, stderr) => {
      const out = `${stdout}\n${stderr}`;
      const urls = out.match(/https:\/\/[^\s]+\.vercel\.app/g) ?? [];
      const ok = !err && urls.length > 0;
      if (ok) await disableProtection(opts.dir); // make the deploy publicly reachable for the critics + customer
      resolve({ ok, url: urls[urls.length - 1], output: out.slice(-4000) });
    });
  });
}
