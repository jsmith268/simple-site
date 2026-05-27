import { SitePage } from "@simplesight/blocks";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prefixLinks } from "@/lib/links";
import { loadSiteSpec } from "@/lib/tenant";

type Params = { username: string; slug?: string[] };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { username } = await params;
  const spec = await loadSiteSpec(username);
  if (!spec) return { title: "Not found" };
  return {
    title: spec.seo?.defaultTitle ?? spec.brand.name,
    description: spec.seo?.defaultDescription ?? spec.brand.tagline,
  };
}

export default async function TenantPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { username, slug } = await params;
  const raw = await loadSiteSpec(username);
  if (!raw) notFound();
  // Make internal nav work under the tenant base path (works via subdomain or preview URL).
  const spec = prefixLinks(raw, `/site/${encodeURIComponent(username)}`);
  return <SitePage spec={spec} slug={(slug ?? []).join("/")} />;
}
