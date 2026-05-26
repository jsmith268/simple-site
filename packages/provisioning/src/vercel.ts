import { logger } from '@simplesight/observability';

/** Live Vercel provisioning requires an API token. Otherwise everything mocks. */
export function isProvisioningLive(): boolean {
  return !!process.env.VERCEL_API_TOKEN;
}

const API = 'https://api.vercel.com';

function authHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
    'Content-Type': 'application/json',
  };
}

function teamQuery(): string {
  const team = process.env.VERCEL_TEAM_ID;
  return team ? `?teamId=${team}` : '';
}

export interface DnsRecord {
  type: 'A' | 'CNAME' | 'TXT';
  name: string; // host label, '@' for apex
  value: string;
}

/**
 * The DNS records a customer must set to point a custom domain at our renderer.
 * Apex → A record; subdomain/www → CNAME. (Verify exact values via the API in
 * production; these are Vercel's documented defaults.)
 */
export function requiredDnsRecords(domain: string): DnsRecord[] {
  const isApex = domain.split('.').length === 2;
  if (isApex) {
    return [
      { type: 'A', name: '@', value: '76.76.21.21' },
      { type: 'CNAME', name: 'www', value: 'cname.vercel-dns.com' },
    ];
  }
  const sub = domain.split('.')[0] ?? domain;
  return [{ type: 'CNAME', name: sub, value: 'cname.vercel-dns.com' }];
}

export interface DomainStatus {
  domain: string;
  verified: boolean;
  records: DnsRecord[];
  /** Ownership-challenge TXT records, if the domain is used on another account. */
  verification: DnsRecord[];
}

/** Attach a custom domain to the shared renderer project. */
export async function addDomainToRenderer(domain: string): Promise<DomainStatus> {
  const records = requiredDnsRecords(domain);
  if (!isProvisioningLive()) {
    logger.info('provisioning.offline: would attach domain', { domain });
    return { domain, verified: false, records, verification: [] };
  }
  const projectId = process.env.VERCEL_RENDERER_PROJECT_ID as string;
  const res = await fetch(`${API}/v10/projects/${projectId}/domains${teamQuery()}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ name: domain }),
  });
  const data = (await res.json()) as Record<string, any>;
  return {
    domain,
    verified: data.verified === true,
    records,
    verification: (data.verification ?? []).map((v: any) => ({
      type: (v.type ?? 'TXT') as DnsRecord['type'],
      name: v.domain ?? '@',
      value: v.value ?? '',
    })),
  };
}

/** Poll a custom domain's verification/SSL status. */
export async function checkDomainStatus(domain: string): Promise<{ verified: boolean }> {
  if (!isProvisioningLive()) {
    // Offline: pretend DNS has propagated so the go-live flow can complete.
    return { verified: true };
  }
  const projectId = process.env.VERCEL_RENDERER_PROJECT_ID as string;
  const res = await fetch(`${API}/v9/projects/${projectId}/domains/${domain}${teamQuery()}`, {
    headers: authHeaders(),
  });
  const data = (await res.json()) as Record<string, any>;
  return { verified: data.verified === true };
}

// ── Domain purchase (Vercel Domains registrar) ──────────────────────────────

export interface DomainAvailability {
  domain: string;
  available: boolean;
  priceUsd?: number;
}

export async function searchDomain(domain: string): Promise<DomainAvailability> {
  if (!isProvisioningLive()) {
    // Offline heuristic: pretend it's available at a flat price.
    return { domain, available: true, priceUsd: 20 };
  }
  const status = await fetch(`${API}/v4/domains/status?name=${domain}${teamQuery() ? `&teamId=${process.env.VERCEL_TEAM_ID}` : ''}`, {
    headers: authHeaders(),
  }).then((r) => r.json() as Promise<Record<string, any>>);
  const price = await fetch(`${API}/v4/domains/price?name=${domain}`, { headers: authHeaders() })
    .then((r) => r.json() as Promise<Record<string, any>>)
    .catch(() => ({}) as Record<string, any>);
  return { domain, available: status.available === true, priceUsd: price.price };
}

export async function buyDomain(domain: string): Promise<{ ok: boolean }> {
  if (!isProvisioningLive()) {
    logger.info('provisioning.offline: would buy domain via Vercel Domains', { domain });
    return { ok: true };
  }
  const res = await fetch(`${API}/v5/domains/buy${teamQuery()}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ name: domain }),
  });
  return { ok: res.ok };
}

// ── Dedicated deployment (file-based) — premium isolation option ────────────

/**
 * Deploy generated files to a dedicated Vercel project (no git). Offline returns
 * a mock deployment. Full file-upload (POST /v2/files with x-vercel-digest) is
 * wired in production; here we create the deployment record.
 */
export async function deployDedicated(
  name: string,
  files: { file: string; data: string }[],
): Promise<{ id: string; url: string; readyState: string }> {
  if (!isProvisioningLive()) {
    logger.info('provisioning.offline: would deploy dedicated project', { name, files: files.length });
    return { id: `mock_${Date.now().toString(36)}`, url: `https://${name}.vercel.app`, readyState: 'READY' };
  }
  const res = await fetch(`${API}/v13/deployments${teamQuery()}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ name, files, projectSettings: { framework: 'nextjs' }, target: 'production' }),
  });
  const data = (await res.json()) as Record<string, any>;
  return { id: data.id ?? '', url: data.url ?? '', readyState: data.readyState ?? 'QUEUED' };
}
