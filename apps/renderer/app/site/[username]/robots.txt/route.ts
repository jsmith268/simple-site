import { tenantUrl } from "@/lib/seo";

/**
 * Per-tenant robots.txt. In production `proxy.ts` rewrites
 * `username.simplesight.co/robots.txt` → `/site/username/robots.txt`, so this
 * serves at the tenant's domain root and points crawlers at the tenant sitemap.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;
  const base = tenantUrl(username);
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`;
  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
