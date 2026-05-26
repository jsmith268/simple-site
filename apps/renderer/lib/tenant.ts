import type { SiteSpec } from "@simplesight/contracts";
import { buildBaseline } from "@simplesight/blocks";

/**
 * Load a tenant's render-ready SiteSpec by username. Serves the built+persisted
 * site when one exists. With a real database (production) an unknown username
 * returns null → 404 (no fake/demo site is ever shown). Only pure local dev
 * (no DATABASE_URL) falls back to a demo so previews aren't empty.
 */
export async function loadSiteSpec(username: string): Promise<SiteSpec | null> {
  const { getSiteSpecByUsername } = await import("@simplesight/db");
  const spec = await getSiteSpecByUsername(username);
  if (spec) return spec;
  if (!process.env.DATABASE_URL) return demoSpec(username); // local dev only
  return null;
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
