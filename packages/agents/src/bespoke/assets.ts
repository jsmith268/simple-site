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

type Orientation = 'landscape' | 'portrait' | 'squarish';
interface ImageNeed {
  role: string;
  count: number;
  query: string;
  orientation: Orientation;
}

// Authenticity bias (research): prefer candid/real over staged/corporate stock.
const AUTHENTIC = 'candid documentary natural light real';

/**
 * Derive image needs with ART-DIRECTION-FIRST queries: lead with the brief's
 * imagery direction, then category + mood, plus authenticity modifiers and a
 * role-appropriate orientation.
 */
export function deriveImageNeeds(profile: BusinessProfile, ia: SiteIA, imageryDirection?: string): ImageNeed[] {
  const used = componentsUsed(ia);
  const dir = (imageryDirection ?? '').replace(/[^a-z0-9 ]/gi, ' ').split(/\s+/).filter(Boolean).slice(0, 10).join(' ');
  // Lead with the brief's ART DIRECTION + mood, not the bare category — a query
  // of "dental practice" returns clinical glove-and-mirror stock, whereas the
  // brief's "warm, sunlit waiting room" steers toward on-brand, human imagery.
  const base = [dir, ...profile.visual.moodWords, profile.category].filter(Boolean).join(' ').trim() || profile.category;
  const needs: ImageNeed[] = [{ role: 'hero', count: Math.max(2, ia.pages.length), query: `${base} ${AUTHENTIC}`, orientation: 'landscape' }];
  if (used.includes('social-feed')) needs.push({ role: 'feed', count: 8, query: `${profile.category} ${AUTHENTIC}`, orientation: 'squarish' });
  if (used.includes('gallery')) needs.push({ role: 'gallery', count: 10, query: `${profile.category} interior ${AUTHENTIC}`, orientation: 'landscape' });
  if (used.includes('team-cards')) needs.push({ role: 'portrait', count: 4, query: `${profile.category} team person portrait natural`, orientation: 'portrait' });
  if (used.includes('feature-grid') || used.includes('content-prose')) needs.push({ role: 'feature', count: 4, query: `${base} ${AUTHENTIC}`, orientation: 'landscape' });
  if (used.includes('testimonials')) needs.push({ role: 'avatar', count: 3, query: 'portrait headshot natural', orientation: 'squarish' });
  return needs;
}

const picsum = (seed: string, w = 1600, h = 1100) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;

async function unsplashSearch(query: string, count: number, key: string, orientation: Orientation): Promise<string[]> {
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${Math.min(30, count)}&orientation=${orientation}&order_by=relevant&content_filter=high`;
  const res = await fetch(url, { headers: { Authorization: `Client-ID ${key}`, 'Accept-Version': 'v1' } });
  if (!res.ok) return [];
  const json = (await res.json()) as { results?: { urls?: { raw?: string; regular?: string } }[] };
  return (json.results ?? [])
    .map((r) => r.urls?.raw ?? r.urls?.regular)
    .filter((u): u is string => !!u)
    .map((u) => `${u}${u.includes('?') ? '&' : '?'}auto=format&fit=crop&w=1600&q=80`);
}

async function pexelsSearch(query: string, count: number, key: string, orientation: Orientation): Promise<string[]> {
  const o = orientation === 'squarish' ? 'square' : orientation; // Pexels uses "square"
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${Math.min(40, count)}&orientation=${o}&size=large`;
  const res = await fetch(url, { headers: { Authorization: key } });
  if (!res.ok) return [];
  const json = (await res.json()) as { photos?: { src?: { large2x?: string; large?: string; landscape?: string; portrait?: string } }[] };
  return (json.photos ?? [])
    .map((p) => p.src?.large2x ?? p.src?.large ?? p.src?.landscape ?? p.src?.portrait)
    .filter((u): u is string => !!u);
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
export async function buildAssetManifest(
  profile: BusinessProfile,
  ia: SiteIA,
  opts?: { imageryDirection?: string },
): Promise<AssetManifest> {
  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
  const pexelsKey = process.env.PEXELS_API_KEY;
  const needs = deriveImageNeeds(profile, ia, opts?.imageryDirection);
  const images: ManifestImage[] = [];
  let idx = 0;

  for (const need of needs) {
    // Source from BOTH Unsplash and Pexels (more + better options), then fall back.
    const [u, p] = await Promise.all([
      unsplashKey ? unsplashSearch(need.query, need.count, unsplashKey, need.orientation).catch(() => []) : Promise.resolve([]),
      pexelsKey ? pexelsSearch(need.query, need.count, pexelsKey, need.orientation).catch(() => []) : Promise.resolve([]),
    ]);
    const pool: { url: string; source: ManifestImage['source'] }[] = [
      ...u.map((url) => ({ url, source: 'unsplash' as const })),
      ...p.map((url) => ({ url, source: 'pexels' as const })),
    ];
    const small = need.role === 'portrait' || need.role === 'avatar';

    for (let i = 0; i < need.count; i++) {
      const pick = pool[i]; // interleave-ish: u then p; good enough for variety
      const fallback = picsum(`${profile.name}-${need.role}-${i}`, small ? 600 : 1600, small ? 600 : 1100);
      let url = pick?.url ?? fallback;
      let source: ManifestImage['source'] = pick?.source ?? 'picsum';
      let status = await verifyImage(url);
      if (status !== 200) {
        url = fallback;
        source = 'picsum';
        status = await verifyImage(url);
      }
      images.push({ id: `img-${idx++}`, role: need.role, url, alt: `${profile.name} — ${need.role}`, status, source });
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
