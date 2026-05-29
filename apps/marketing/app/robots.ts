import type { MetadataRoute } from "next";

const BASE = "https://simplesite.co";

/** robots.txt for the marketing site — allow all, point at the sitemap. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
