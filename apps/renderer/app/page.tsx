// Root of the renderer (apex hit without a tenant subdomain). The real tenant
// rendering lives at /_sites/[siteId], reached via subdomain middleware (Phase 1).
export default function Page() {
  return (
    <main style={{ padding: 48, fontFamily: "system-ui" }}>
      <h1>SimpleSight renderer</h1>
      <p>Tenant sites are served at username.simplesight.co.</p>
    </main>
  );
}
