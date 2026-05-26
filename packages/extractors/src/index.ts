/**
 * Crawl a customer's existing website/socials for extra context. All extractors
 * degrade gracefully: with no API keys (offline) they return empty results, so
 * the pipeline never blocks on them. Full implementation in Phase 3.
 */
export interface CrawledContext {
  pages: { url: string; title?: string; text?: string }[];
  detectedColors: string[];
  detectedLogoUrl?: string;
}

export async function crawlSite(_url: string): Promise<CrawledContext> {
  // Phase 3: Firecrawl/Exa-backed. Offline-safe default:
  return { pages: [], detectedColors: [] };
}
