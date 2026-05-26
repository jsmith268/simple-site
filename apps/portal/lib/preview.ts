/** Build the preview URL for a tenant. Local dev uses the renderer's ?tenant=
 * shortcut; production uses the real subdomain. */
export function previewUrl(username: string): string {
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "simplesight.localhost";
  if (root.includes("localhost")) {
    return `http://localhost:3001/?tenant=${encodeURIComponent(username)}`;
  }
  return `https://${username}.${root}`;
}
