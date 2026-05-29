import { SitePage } from "@simplesight/blocks";
import type { SiteSpec } from "@simplesight/contracts";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prefixLinks } from "@/lib/links";

type Params = { variantId: string; slug?: string[] };

/** Load a stored variant SiteSpec (block-mode / offline preview). */
async function loadVariantSpec(variantId: string): Promise<SiteSpec | null> {
  const { getVariantSpec } = await import("@simplesight/db");
  const spec = (await getVariantSpec(variantId)) as SiteSpec | undefined;
  return spec ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { variantId } = await params;
  const spec = await loadVariantSpec(variantId);
  if (!spec) return { title: "Preview", robots: { index: false, follow: false } };
  return {
    title: spec.seo?.defaultTitle ?? spec.brand.name,
    description: spec.seo?.defaultDescription ?? spec.brand.tagline,
    robots: { index: false, follow: false },
  };
}

export default async function VariantPreviewPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { variantId, slug } = await params;
  const raw = await loadVariantSpec(variantId);
  if (!raw) notFound();
  const spec = prefixLinks(raw, `/preview/variant/${encodeURIComponent(variantId)}`);
  return <SitePage spec={spec} slug={(slug ?? []).join("/")} />;
}
