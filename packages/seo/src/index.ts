import type { BusinessInfo, SiteSpec } from '@simplesight/contracts';

type Json = Record<string, unknown>;

/** schema.org WebSite node. */
export function websiteSchema(site: SiteSpec, baseUrl: string): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.brand.name,
    url: baseUrl,
    description: site.seo?.defaultDescription ?? site.brand.tagline,
  };
}

/** schema.org LocalBusiness node from intake business info — great for informational/local sites. */
export function localBusinessSchema(business: BusinessInfo, baseUrl: string): Json {
  const loc = business.locations[0];
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name,
    description: business.description,
    url: baseUrl,
    ...(business.contact.phone ? { telephone: business.contact.phone } : {}),
    ...(business.contact.email ? { email: business.contact.email } : {}),
    ...(loc
      ? {
          address: {
            '@type': 'PostalAddress',
            streetAddress: loc.address,
            addressLocality: loc.city,
            addressRegion: loc.region,
            addressCountry: loc.country,
          },
        }
      : {}),
    ...(business.hours.length
      ? {
          openingHoursSpecification: business.hours.map((h) => ({
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: h.days,
            opens: h.open,
            closes: h.close,
          })),
        }
      : {}),
    sameAs: business.contact.socials.map((s) => s.url),
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

/** Render a JSON-LD object as a `<script>` body string. */
export function jsonLd(obj: Json): string {
  return JSON.stringify(obj);
}

/** Build a sitemap.xml from a SiteSpec. */
export function sitemapXml(site: SiteSpec, baseUrl: string): string {
  const urls = site.pages
    .map((p) => `  <url><loc>${baseUrl.replace(/\/$/, '')}/${p.slug}</loc></url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
}
