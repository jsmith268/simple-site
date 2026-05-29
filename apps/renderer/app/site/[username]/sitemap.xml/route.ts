import { latestVersionAt } from "@simplesight/db";
import { tenantUrl } from "@/lib/seo";
import { loadSiteSpec } from "@/lib/tenant";

/**
 * Per-tenant sitemap. In production `proxy.ts` rewrites
 * `username.simplesight.co/sitemap.xml` → `/site/username/sitemap.xml`, so this
 * serves at the tenant's domain root. <loc> URLs are built from the SiteSpec
 * pages (slug '' = home). No external calls.
 */
function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;
  const spec = await loadSiteSpec(username).catch(() => null);
  const base = tenantUrl(username);
  const lastmod = (await latestVersionAt(username).catch(() => null))?.slice(0, 10);
  const lastmodTag = lastmod ? `<lastmod>${lastmod}</lastmod>` : "";
  const pages = spec
    ? [...spec.pages].sort((a, b) => a.order - b.order)
    : [{ slug: "", order: 0 } as { slug: string; order: number }];
  const seen = new Set<string>();
  const urls: string[] = [];
  for (const p of pages) {
    const slug = (p.slug ?? "").replace(/^\/+/, "").trim();
    const loc = slug ? `${base}/${slug}` : base;
    if (seen.has(loc)) continue;
    seen.add(loc);
    const priority = slug ? "0.7" : "1.0";
    urls.push(
      `  <url><loc>${escapeXml(loc)}</loc>${lastmodTag}<changefreq>weekly</changefreq><priority>${priority}</priority></url>`,
    );
  }
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
  return new Response(body, {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
