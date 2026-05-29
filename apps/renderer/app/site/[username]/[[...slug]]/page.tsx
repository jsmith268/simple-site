import { SitePage } from "@simplesight/blocks";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prefixLinks } from "@/lib/links";
import { pageMetadata, siteJsonLd, tenantUrl } from "@/lib/seo";
import { loadSiteSpec } from "@/lib/tenant";
import { HitBeacon } from "./hit-beacon";

type Params = { username: string; slug?: string[] };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { username, slug } = await params;
  const spec = await loadSiteSpec(username);
  if (!spec) return { title: "Not found" };
  return pageMetadata(spec, tenantUrl(username), (slug ?? []).join("/"));
}

export default async function TenantPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { username, slug } = await params;
  const raw = await loadSiteSpec(username);
  if (!raw) notFound();
  // A non-home slug that matches no page is a real 404 (avoid soft-404 / duplicate
  // content from silently rendering the home page).
  const slugStr = (slug ?? []).join("/").replace(/^\/+|\/+$/g, "");
  if (slugStr && !raw.pages.some((p) => (p.slug ?? "").replace(/^\/+|\/+$/g, "") === slugStr)) {
    notFound();
  }
  // Make internal nav work under the tenant base path (works via subdomain or preview URL).
  const spec = prefixLinks(raw, `/site/${encodeURIComponent(username)}`);
  const inSitePath = `/${(slug ?? []).join("/")}`;
  return (
    <>
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is server-built from our own SiteSpec */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: siteJsonLd(raw, tenantUrl(username)) }} />
      <SitePage spec={spec} slug={(slug ?? []).join("/")} />
      <HitBeacon username={username} path={inSitePath} />
    </>
  );
}
