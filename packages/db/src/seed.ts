/**
 * Dev seed. Inserts a demo customer + project so the renderer has a tenant to
 * draw at username.simplesight.localhost. The demo SiteSpec lives in
 * @simplesight/blocks (added in Phase 1); until then this is a no-op stub.
 */
async function main() {
  if (!process.env.DATABASE_URL) {
    try {
      process.loadEnvFile(new URL('../../../.env', import.meta.url));
    } catch {
      /* ignore */
    }
  }
  if (!process.env.DATABASE_URL) {
    console.log('[seed] DATABASE_URL not set — skipping (offline).');
    return;
  }
  console.log('[seed] (stub) connect + insert demo tenant — implemented in Phase 1.');
}

main().catch((e) => {
  console.error('[seed] failed', e);
  process.exit(1);
});
