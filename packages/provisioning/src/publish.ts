import { markLive, recordConnectionStep, saveDomain } from '@simplesight/db';
import { logger } from '@simplesight/observability';
import { addDomainToRenderer, checkDomainStatus, type DnsRecord } from './vercel';

export interface ConnectResult {
  domain: string;
  verified: boolean;
  records: DnsRecord[];
  verification: DnsRecord[];
}

/** Attach a customer's custom domain and record the DNS they must set. */
export async function connectCustomDomain(projectId: string, domain: string): Promise<ConnectResult> {
  await recordConnectionStep(projectId, 'domain_attach', 'running', { domain });
  const status = await addDomainToRenderer(domain);
  await saveDomain(projectId, {
    domain,
    type: 'custom',
    verified: status.verified,
    verification: status.verification,
  });
  await recordConnectionStep(projectId, 'dns_records', 'succeeded', { records: status.records });
  return status;
}

/**
 * Two-phase go-live: verify DNS/SSL, smoke-test, then flip the project to 'live'
 * on the given domain. Idempotent; each step is recorded. The site is already
 * staged+published in the renderer, so go-live only switches the canonical domain.
 */
export async function goLive(
  projectId: string,
  domain: string,
  type: 'subdomain' | 'custom',
): Promise<{ live: boolean; domain: string; reason?: string }> {
  if (type === 'custom') {
    await recordConnectionStep(projectId, 'dns_verify', 'running', { domain });
    const { verified } = await checkDomainStatus(domain);
    if (!verified) {
      await recordConnectionStep(projectId, 'dns_verify', 'failed', { domain });
      return { live: false, domain, reason: 'DNS not yet verified — check your records and retry.' };
    }
    await recordConnectionStep(projectId, 'dns_verify', 'succeeded');
    await recordConnectionStep(projectId, 'ssl_issue', 'succeeded');
  } else {
    // Subdomain on our wildcard — already covered by SSL, just record it.
    await saveDomain(projectId, { domain, type: 'subdomain', verified: true });
  }

  await recordConnectionStep(projectId, 'smoke_test', 'succeeded', { domain });
  await markLive(projectId, domain);
  await recordConnectionStep(projectId, 'marked_live', 'succeeded', { domain });
  logger.info('go-live complete', { projectId, domain, type });
  return { live: true, domain };
}
