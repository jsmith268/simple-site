/**
 * Build the preview URL for a tenant.
 * - NEXT_PUBLIC_RENDERER_URL set (deployed renderer, no wildcard domain) →
 *   use the renderer origin with the ?tenant= shortcut.
 * - A real ROOT_DOMAIN with wildcard DNS → use the subdomain.
 * - Local dev → the renderer on :3001 with ?tenant=.
 */
export function previewUrl(username: string): string {
  const renderer = process.env.NEXT_PUBLIC_RENDERER_URL;
  if (renderer) {
    return `${renderer.replace(/\/$/, "")}/?tenant=${encodeURIComponent(username)}`;
  }
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "simplesight.localhost";
  if (root.includes("localhost")) {
    return `http://localhost:3001/?tenant=${encodeURIComponent(username)}`;
  }
  return `https://${username}.${root}`;
}
