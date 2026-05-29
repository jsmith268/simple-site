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

/** Collect up to 12 services across the site as schema.org Offers. */
function collectOffers(
  spec: SiteSpec,
): { "@type": string; itemOffered: Record<string, unknown> }[] {
  const offers: { "@type": string; itemOffered: Record<string, unknown> }[] = [];
  for (const page of spec.pages) {
    for (const block of page.blocks) {
      if (block.type !== "services") continue;
      const items = (block.props as { items?: unknown }).items;
      if (!Array.isArray(items)) continue;
      for (const it of items) {
        const rec = it as { title?: unknown; description?: unknown };
        if (typeof rec.title === "string" && rec.title.trim()) {
          offers.push({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: rec.title.trim(),
              ...(typeof rec.description === "string" && rec.description.trim()
                ? { description: rec.description.trim() }
                : {}),
            },
          });
        }
        if (offers.length >= 12) return offers;
      }
    }
  }
  return offers;
}

/** schema.org JSON-LD: a WebSite + a LocalBusiness/Organization built from the SiteSpec. */
export function siteJsonLd(spec: SiteSpec, url: string): string {
  const name = spec.brand.name;
  const description = spec.seo?.defaultDescription ?? spec.brand.tagline ?? "";
  const phone = findProp(spec, ["phone", "telephone", "tel"]);
  const address = findProp(spec, ["address", "streetAddress"]);
  const email = findProp(spec, ["email"]);
  const offers = collectOffers(spec);
  const org: Record<string, unknown> = {
    "@type": phone || address ? "LocalBusiness" : "Organization",
    "@id": `${url}#org`,
    name,
    url,
    ...(description ? { description } : {}),
    ...(spec.brand.logoUrl ? { logo: spec.brand.logoUrl } : {}),
    ...(phone ? { telephone: phone } : {}),
    ...(email ? { email } : {}),
    ...(address ? { address: { "@type": "PostalAddress", streetAddress: address } } : {}),
    ...(offers.length ? { makesOffer: offers } : {}),
  };
  const website = { "@type": "WebSite", "@id": `${url}#website`, name, url, ...(description ? { description } : {}) };
  return JSON.stringify({ "@context": "https://schema.org", "@graph": [website, org] });
}

/** Find the page matching a slug ('' = home). */
function findPage(spec: SiteSpec, slug: string): SiteSpec["pages"][number] | undefined {
  const norm = slug.replace(/^\/+|\/+$/g, "");
  return spec.pages.find((p) => (p.slug ?? "").replace(/^\/+|\/+$/g, "") === norm);
}

/**
 * Escape a JSON-LD string for safe injection into <script>. SiteSpec content is
 * AI-generated from crawled URLs + customer free-text — NOT trusted — so a value
 * containing `</script>` must not be able to break out of the JSON-LD block.
 */
export function escapeJsonLd(json: string): string {
  return json
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

/** FAQPage JSON-LD built from any faq block on the given page. Null if none. */
export function faqJsonLd(spec: SiteSpec, slug: string): string | null {
  const norm = slug.replace(/^\/+|\/+$/g, "");
  const page = findPage(spec, norm);
  if (!page) return null;
  const qa: { question: string; answer: string }[] = [];
  for (const block of page.blocks) {
    if (block.type !== "faq") continue;
    const items = (block.props as { items?: unknown }).items;
    if (!Array.isArray(items)) continue;
    for (const it of items) {
      const rec = it as { question?: unknown; answer?: unknown };
      if (
        typeof rec.question === "string" &&
        typeof rec.answer === "string" &&
        rec.question.trim() &&
        rec.answer.trim()
      ) {
        qa.push({ question: rec.question.trim(), answer: rec.answer.trim() });
      }
    }
  }
  if (!qa.length) return null;
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: qa.map((x) => ({
      "@type": "Question",
      name: x.question,
      acceptedAnswer: { "@type": "Answer", text: x.answer },
    })),
  });
}

/** BreadcrumbList JSON-LD for an inner page (Home → page). Null on the home page. */
export function breadcrumbJsonLd(spec: SiteSpec, baseUrl: string, slug: string): string | null {
  const norm = slug.replace(/^\/+|\/+$/g, "");
  if (!norm) return null;
  const page = findPage(spec, norm);
  const name = page?.title ?? norm;
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      { "@type": "ListItem", position: 2, name, item: `${baseUrl}/${norm}` },
    ],
  });
}

/**
 * Per-page OpenGraph + canonical metadata. Uses the matched page's own
 * `seo.title`/`seo.description` when present, falling back to the site defaults
 * — so every page gets a distinct, accurate title/description and canonical.
 * `baseUrl` is the tenant root; `slug` is the in-site path ('' = home).
 */
export function pageMetadata(spec: SiteSpec, baseUrl: string, slug = ""): Metadata {
  const page = findPage(spec, slug);
  const isHome = !slug.replace(/^\/+|\/+$/g, "");
  const siteTitle = spec.seo?.defaultTitle ?? spec.brand.name;
  const siteDesc = spec.seo?.defaultDescription ?? spec.brand.tagline;
  const title =
    page?.seo?.title ??
    (isHome
      ? siteTitle
      : page?.title
        ? `${page.title} · ${spec.brand.name}`
        : siteTitle);
  const description = page?.seo?.description ?? siteDesc;
  const pageUrl = isHome ? baseUrl : `${baseUrl}/${slug.replace(/^\/+|\/+$/g, "")}`;
  // Brand-generated 1200×630 cards from the colocated opengraph-image.tsx /
  // twitter-image.tsx routes. Referenced explicitly (not via file-convention
  // auto-injection) because this segment's generateMetadata defines `openGraph`,
  // which shallow-overrides the parent segment's file-based image.
  const ogImage = `${baseUrl}/opengraph-image`;
  const twImage = `${baseUrl}/twitter-image`;
  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title,
      description: description ?? undefined,
      url: pageUrl,
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

/** Site-level metadata (home). Thin wrapper kept for callers that don't have a slug. */
export function siteMetadata(spec: SiteSpec, url: string): Metadata {
  return pageMetadata(spec, url, "");
}
