import type { SiteSpec } from "@simplesight/contracts";

function rewrite(value: unknown, base: string): unknown {
  if (typeof value === "string") {
    // Prefix internal absolute paths ("/about") with the tenant base; leave
    // anchors (#...), external (http...), mailto/tel, and protocol-relative alone.
    if (/^\/(?!\/)/.test(value)) return value === "/" ? base || "/" : `${base}${value}`;
    return value;
  }
  if (Array.isArray(value)) return value.map((v) => rewrite(v, base));
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) out[k] = rewrite(v, base);
    return out;
  }
  return value;
}

/**
 * Rewrite internal links in a SiteSpec to live under a tenant base path
 * (e.g. /site/acme), so multi-page nav works whether the site is reached via a
 * subdomain or the path-based preview URL. Page slugs are untouched (no leading /).
 */
export function prefixLinks(spec: SiteSpec, base: string): SiteSpec {
  return rewrite(spec, base) as SiteSpec;
}
