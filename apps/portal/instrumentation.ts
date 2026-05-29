/**
 * Boot-time configuration guard. In live mode this fails fast on an incoherent
 * setup (e.g. an AI key present but DATABASE_URL missing, which would silently
 * write to an ephemeral JSON store). Offline mode is always coherent → no-op.
 */
export async function register() {
  const { assertLiveConfig } = await import("@simplesight/env");
  assertLiveConfig();
}
