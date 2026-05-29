import type { MetadataRoute } from "next";

const BASE = "https://simplesite.co";

/** Sitemap for the marketing site's public pages. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/start`, changeFrequency: "monthly", priority: 0.8 },
  ];
}
