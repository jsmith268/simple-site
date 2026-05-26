import type { SiteSpec } from "@simplesight/contracts";
import { buildBaseline } from "@simplesight/blocks";
import { isOffline } from "@simplesight/env";

/**
 * Load a tenant's render-ready SiteSpec by username. In offline mode (or with no
 * database) we synthesize a demo site from the baseline assembler so the renderer
 * always has something to draw — the same zero-fail floor the pipeline relies on.
 */
export async function loadSiteSpec(username: string): Promise<SiteSpec | null> {
  if (isOffline() || !process.env.DATABASE_URL) {
    return demoSpec(username);
  }
  // DB-backed path (dynamic import keeps the DB client out of the offline bundle).
  const { getSiteSpecByUsername } = await import("@simplesight/db");
  const spec = await getSiteSpecByUsername(username);
  return spec ?? demoSpec(username);
}

function demoSpec(username: string): SiteSpec {
  const pretty = username
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
  return buildBaseline({
    name: pretty || "Northside Studio",
    category: "design studio",
    tagline: "thoughtful work, on time",
    description:
      "A small studio helping local businesses look their best online and in print.",
    services: [
      { name: "Branding", description: "Logos, color, and a look that fits you." },
      { name: "Web design", description: "Simple, fast sites that explain what you do." },
      { name: "Print", description: "Cards, signage, and everything in between." },
    ],
    contact: {
      email: "hello@example.com",
      phone: "(555) 010-2030",
      socials: [],
    },
    locations: [{ city: "Portland", region: "OR", country: "USA" }],
    hours: [
      { days: "Mon–Fri", open: "9:00", close: "17:00" },
      { days: "Sat", open: "10:00", close: "14:00" },
    ],
  });
}
