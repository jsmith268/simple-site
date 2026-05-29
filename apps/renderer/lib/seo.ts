import type { SiteSpec } from "@simplesight/contracts";
import type { Metadata } from "next";

/** Absolute URL for a tenant (clean subdomain in prod, path-based locally). */
export function tenantUrl(username: string): string {
  const r = process.env.NEXT_PUBLIC_RENDERER_URL;
  if (r) return `${r.replace(/\/$/, "")}/site/${encodeURIComponent(username)}`;
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? process.env.ROOT_DOMAIN ?? "simplesight.localhost";
  return root.includes("localhost") ? `http://localhost:3001/site/${encodeURIComponent(username)}` : `https://${username}.${root}`;
}

/** Best-effort scan of block props across pages for a contact-ish value. */
function findProp(spec: SiteSpec, keys: string[]): string | undefined {
  for (const page of spec.pages) {
    for (const block of page.blocks) {
      const props = block.props as Record<string, unknown>;
      for (const k of keys) {
        const v = props?.[k];
        if (typeof v === "string" && v.trim()) return v.trim();
      }
    }
  }
  return undefined;
}

/** schema.org JSON-LD: a WebSite + a LocalBusiness/Organization built from the SiteSpec. */
export function siteJsonLd(spec: SiteSpec, url: string): string {
  const name = spec.brand.name;
  const description = spec.seo?.defaultDescription ?? spec.brand.tagline ?? "";
  const phone = findProp(spec, ["phone", "telephone", "tel"]);
  const address = findProp(spec, ["address", "streetAddress"]);
  const org: Record<string, unknown> = {
    "@type": phone || address ? "LocalBusiness" : "Organization",
    "@id": `${url}#org`,
    name,
    url,
    ...(description ? { description } : {}),
    ...(spec.brand.logoUrl ? { logo: spec.brand.logoUrl } : {}),
    ...(phone ? { telephone: phone } : {}),
    ...(address ? { address: { "@type": "PostalAddress", streetAddress: address } } : {}),
  };
  const website = { "@type": "WebSite", "@id": `${url}#website`, name, url, ...(description ? { description } : {}) };
  return JSON.stringify({ "@context": "https://schema.org", "@graph": [website, org] });
}

/** OpenGraph + canonical metadata for a tenant page. */
export function siteMetadata(spec: SiteSpec, url: string): Metadata {
  const title = spec.seo?.defaultTitle ?? spec.brand.name;
  const description = spec.seo?.defaultDescription ?? spec.brand.tagline;
  // Brand-generated 1200×630 cards produced by the colocated opengraph-image.tsx /
  // twitter-image.tsx routes. Referenced explicitly (not via the file-convention
  // auto-injection) because this page's generateMetadata defines `openGraph`, which
  // shallow-overrides the parent segment's file-based image.
  const ogImage = `${url}/opengraph-image`;
  const twImage = `${url}/twitter-image`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: description ?? undefined,
      url,
      siteName: spec.brand.name,
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: description ?? undefined,
      images: [twImage],
    },
  };
}
