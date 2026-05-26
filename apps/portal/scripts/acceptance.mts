/**
 * SimpleSight acceptance drills — proves the zero-fail guarantees, offline.
 * Run: pnpm --filter @simplesight/portal acceptance
 */
process.env.SIMPLESIGHT_OFFLINE = '1';
delete process.env.DATABASE_URL;
process.env.SIMPLESIGHT_DATA_DIR = '/tmp/ss-acceptance';
process.env.NEXT_PUBLIC_ROOT_DOMAIN = 'simplesight.co';
import { rmSync } from 'node:fs';
import assert from 'node:assert';
try {
  rmSync('/tmp/ss-acceptance', { recursive: true });
} catch {}

import { runBuildPipeline, renderVerify } from '@simplesight/agents';
import { runStep } from '@simplesight/engine';
import { buildBaseline } from '@simplesight/blocks';
import {
  completeIntake,
  createPurchasedProject,
  getProject,
  getSiteSpecByUsername,
  reserveUsername,
  saveIntake,
} from '@simplesight/db';
import type { Agent } from '@simplesight/contracts';

let passed = 0;
const ok = (name: string) => {
  passed++;
  console.log(`  ✓ ${name}`);
};

// Drill 1 — a producer that always throws still yields via the fallback.
const boom: Agent<unknown, { value: string }> = {
  name: 'boom',
  version: '1',
  model: 'x',
  budget: { maxTokens: 10, maxMs: 1000, maxRetries: 0 },
  invoke: async () => {
    throw new Error('injected failure');
  },
};
const out = await runStep<unknown, { value: string }>({
  runId: 'acc-run-1',
  projectId: 'acc-p',
  stepName: 'boom',
  producer: boom,
  input: {},
  offline: true,
  fallback: () => ({ value: 'fallback-shipped' }),
});
assert.equal(out.value, 'fallback-shipped');
ok('failure-injection: throwing agent falls back, never aborts');

// Drill 2 — render-verify drops an invalid block but keeps a valid site.
const base = buildBaseline({
  name: 'Drill Co',
  category: 'shop',
  description: 'x',
  services: [],
  locations: [],
  hours: [],
  contact: { socials: [] },
});
const beforeCount = base.pages[0]!.blocks.length;
base.pages[0]!.blocks.push({ id: 'bad', type: 'hero', variant: 'default', props: { not: 'valid' }, order: 999 });
const { spec, dropped } = renderVerify(base);
assert.equal(dropped.length, 1);
assert.equal(spec.pages[0]!.blocks.length, beforeCount);
ok('render-verify: invalid block dropped, valid site preserved');

// Drill 3 — full pipeline always produces a previewable, persisted site.
const { projectId } = await createPurchasedProject({ email: 'drill@x.com', amountCents: 0 });
await reserveUsername(projectId, 'drill-co');
await saveIntake(projectId, {
  business: {
    name: 'Drill Co',
    category: 'bakery',
    description: 'Fresh bread daily.',
    services: [{ name: 'Bread' }, { name: 'Cakes' }],
    locations: [{ city: 'Austin', region: 'TX', country: 'USA' }],
    hours: [{ days: 'Mon-Sat', open: '7:00', close: '18:00' }],
    contact: { email: 'hi@drill.co', socials: [] },
  },
});
await completeIntake(projectId);
const result = await runBuildPipeline(projectId);
assert.equal(result.status, 'preview');
assert.equal(result.droppedBlocks, 0);
assert.equal((await getProject(projectId))?.status, 'preview');
const site = await getSiteSpecByUsername('drill-co');
assert.ok(site && site.pages[0]!.blocks.length >= 8);
ok('full pipeline: onboarding → build → persisted, renderable site');

// Drill 4 — a project with NO intake still ships a site (absolute floor).
const { projectId: empty } = await createPurchasedProject({ email: 'empty@x.com', amountCents: 0 });
await reserveUsername(empty, 'empty-co');
const r2 = await runBuildPipeline(empty);
assert.equal(r2.status, 'preview');
const site2 = await getSiteSpecByUsername('empty-co');
assert.ok(site2 && site2.pages[0]!.blocks.length > 0);
ok('absolute floor: no intake still yields a complete site');

console.log(`\nAll ${passed} acceptance drills passed.`);
rmSync('/tmp/ss-acceptance', { recursive: true, force: true });
