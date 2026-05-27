/**
 * Build the preview URL for a tenant. Uses the renderer's path-based route
 * (/site/<username>) so multi-page nav works without a wildcard domain.
 * A real wildcard ROOT_DOMAIN still uses the clean subdomain.
 */
export function previewUrl(username: string): string {
  const u = encodeURIComponent(username);
  const renderer = process.env.NEXT_PUBLIC_RENDERER_URL;
  if (renderer) return `${renderer.replace(/\/$/, "")}/site/${u}`;
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "simplesight.localhost";
  if (root.includes("localhost")) return `http://localhost:3001/site/${u}`;
  return `https://${username}.${root}`;
}
