import {
  type AssetManifest,
  type BusinessProfile,
  type ManifestImage,
  type SiteIA,
} from '@simplesight/contracts';
import { componentsUsed } from './ia';

/* ──────────────────────────────────────────────────────────────────────────
 * Phase 5 — Asset service. Source images by what the IA needs, verify every URL
 * is live, and fall back deterministically so a site NEVER ships a broken image
 * (the soft spot from earlier builds). Uses the Unsplash API when
 * UNSPLASH_ACCESS_KEY is set; otherwise falls back to seeded picsum.photos
 * (always-200) so the pipeline still runs end-to-end without a key.
 * ────────────────────────────────────────────────────────────────────────── */

interface ImageNeed {
  role: string;
  count: number;
  query: string;
}

/** Derive how many images of each role this site needs, with search queries. */
export function deriveImageNeeds(profile: BusinessProfile, ia: SiteIA): ImageNeed[] {
  const used = componentsUsed(ia);
  const base = [profile.category, ...profile.visual.moodWords].filter(Boolean).join(' ').trim() || profile.category;
  const needs: ImageNeed[] = [{ role: 'hero', count: Math.max(2, ia.pages.length), query: base }];
  if (used.includes('social-feed')) needs.push({ role: 'feed', count: 8, query: `${profile.category} candid` });
  if (used.includes('gallery')) needs.push({ role: 'gallery', count: 10, query: `${profile.category} interior` });
  if (used.includes('team-cards')) needs.push({ role: 'portrait', count: 4, query: 'professional portrait person' });
  if (used.includes('feature-grid') || used.includes('content-prose')) needs.push({ role: 'feature', count: 4, query: base });
  if (used.includes('testimonials')) needs.push({ role: 'avatar', count: 3, query: 'portrait headshot' });
  return needs;
}

const picsum = (seed: string, w = 1600, h = 1100) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;

async function unsplashSearch(query: string, count: number, key: string): Promise<string[]> {
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${Math.min(30, count)}&orientation=landscape&content_filter=high`;
  const res = await fetch(url, { headers: { Authorization: `Client-ID ${key}`, 'Accept-Version': 'v1' } });
  if (!res.ok) return [];
  const json = (await res.json()) as { results?: { urls?: { raw?: string; regular?: string } }[] };
  return (json.results ?? [])
    .map((r) => r.urls?.raw ?? r.urls?.regular)
    .filter((u): u is string => !!u)
    .map((u) => `${u}${u.includes('?') ? '&' : '?'}auto=format&fit=crop&w=1600&q=80`);
}

/** HEAD-check a URL is live (200). Falls back to a tiny GET if HEAD is unsupported. */
export async function verifyImage(url: string, timeoutMs = 8000): Promise<number> {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeoutMs);
  try {
    let res = await fetch(url, { method: 'HEAD', signal: ac.signal });
    if (res.status === 405 || res.status === 403) res = await fetch(url, { method: 'GET', signal: ac.signal });
    return res.status;
  } catch {
    return 0;
  } finally {
    clearTimeout(t);
  }
}

/**
 * Build a verified AssetManifest for a site. Sources per-role images, verifies
 * each is live, and swaps any non-200 for a seeded picsum fallback (re-verified).
 */
export async function buildAssetManifest(profile: BusinessProfile, ia: SiteIA): Promise<AssetManifest> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  const needs = deriveImageNeeds(profile, ia);
  const images: ManifestImage[] = [];
  let idx = 0;

  for (const need of needs) {
    let urls: string[] = [];
    if (key) {
      try {
        urls = await unsplashSearch(need.query, need.count, key);
      } catch {
        urls = [];
      }
    }
    for (let i = 0; i < need.count; i++) {
      const fromApi = urls[i];
      const fallback = picsum(`${profile.name}-${need.role}-${i}`, need.role === 'portrait' || need.role === 'avatar' ? 600 : 1600, need.role === 'portrait' || need.role === 'avatar' ? 600 : 1100);
      let url = fromApi ?? fallback;
      let source: ManifestImage['source'] = fromApi ? 'unsplash' : 'picsum';
      let status = await verifyImage(url);
      if (status !== 200) {
        url = fallback;
        source = 'picsum';
        status = await verifyImage(url);
      }
      images.push({
        id: `img-${idx++}`,
        role: need.role,
        url,
        alt: `${profile.name} — ${need.role}`,
        status,
        source,
      });
    }
  }
  return { images };
}

/** Re-verify an existing manifest and swap any broken URLs for fallbacks. */
export async function reverifyManifest(profile: BusinessProfile, manifest: AssetManifest): Promise<{ manifest: AssetManifest; swapped: number }> {
  let swapped = 0;
  const images: ManifestImage[] = [];
  for (const img of manifest.images) {
    const status = await verifyImage(img.url);
    if (status === 200) {
      images.push({ ...img, status });
    } else {
      const fallback = picsum(`${profile.name}-${img.role}-${img.id}`);
      images.push({ ...img, url: fallback, source: 'picsum', status: await verifyImage(fallback) });
      swapped++;
    }
  }
  return { manifest: { images }, swapped };
}
