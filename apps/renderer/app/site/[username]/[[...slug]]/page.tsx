import { SitePage } from "@simplesight/blocks";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
  const spec = await loadSiteSpec(username);
  if (!spec) notFound();
  return <SitePage spec={spec} slug={(slug ?? []).join("/")} />;
}
