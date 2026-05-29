import { hasDatabase } from '@simplesight/env';
import { and, eq, gte, sql } from 'drizzle-orm';
import { db } from '../client';
import { siteHits } from '../schema/core';
import * as store from '../offline-store';

const DAY_MS = 24 * 60 * 60 * 1000;

function utcDay(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

/** Strip query/hash, collapse slashes, drop trailing slash, cap length. */
function normalizePath(raw: string | undefined): string {
  if (!raw) return '/';
  let p = (raw.split('?')[0] ?? raw).split('#')[0] ?? raw;
  p = p.trim();
  if (!p.startsWith('/')) p = `/${p}`;
  p = p.replace(/\/{2,}/g, '/');
  if (p.length > 1) p = p.replace(/\/+$/, '');
  if (p.length > 256) p = p.slice(0, 256);
  return p || '/';
}

/** Tenant usernames are [a-z0-9-]; anything else is rejected (no PII recorded). */
function cleanUsername(raw: string | undefined): string | null {
  if (!raw) return null;
  const u = raw.trim().toLowerCase();
  return /^[a-z0-9-]{1,64}$/.test(u) ? u : null;
}

/** Record one page view. Cookieless, no PII — just bumps an aggregate counter. */
export async function recordHit(input: { username: string; path?: string }): Promise<void> {
  const username = cleanUsername(input.username);
  if (!username) return;
  const path = normalizePath(input.path);
  const day = utcDay();

  if (!hasDatabase()) {
    const existing = store.findOne(
      'site_hits',
      (r) => r.username === username && r.day === day && r.path === path,
    );
    if (existing) {
      store.update('site_hits', (r) => r.id === existing.id, {
        count: ((existing.count as number) ?? 0) + 1,
      });
    } else {
      store.insert('site_hits', { username, day, path, count: 1 });
    }
    return;
  }

  await db
    .insert(siteHits)
    .values({ username, day, path, count: 1 })
    .onConflictDoUpdate({
      target: [siteHits.username, siteHits.day, siteHits.path],
      set: { count: sql`${siteHits.count} + 1` },
    });
}

export interface HitStats {
  total: number;
  last7: number;
  today: number;
  byDay: { day: string; count: number }[];
  topPaths: { path: string; count: number }[];
}

const EMPTY_STATS: HitStats = { total: 0, last7: 0, today: 0, byDay: [], topPaths: [] };

/** Aggregate view stats for a tenant over a trailing window (default 30 days). */
export async function getHitStats(username: string, opts?: { days?: number }): Promise<HitStats> {
  const u = cleanUsername(username);
  if (!u) return { ...EMPTY_STATS, byDay: [], topPaths: [] };
  const windowDays = opts?.days ?? 30;
  const sinceDay = utcDay(new Date(Date.now() - windowDays * DAY_MS));
  const today = utcDay();
  const last7Day = utcDay(new Date(Date.now() - 7 * DAY_MS));

  let rows: { day: string; path: string; count: number }[];
  if (!hasDatabase()) {
    rows = store
      .findMany('site_hits', (r) => r.username === u && (r.day as string) >= sinceDay)
      .map((r) => ({ day: r.day as string, path: r.path as string, count: (r.count as number) ?? 0 }));
  } else {
    rows = await db
      .select({ day: siteHits.day, path: siteHits.path, count: siteHits.count })
      .from(siteHits)
      .where(and(eq(siteHits.username, u), gte(siteHits.day, sinceDay)));
  }

  const total = rows.reduce((s, r) => s + r.count, 0);
  const last7 = rows.filter((r) => r.day >= last7Day).reduce((s, r) => s + r.count, 0);
  const todayCount = rows.filter((r) => r.day === today).reduce((s, r) => s + r.count, 0);

  const dayMap = new Map<string, number>();
  for (const r of rows) dayMap.set(r.day, (dayMap.get(r.day) ?? 0) + r.count);
  const byDay = [...dayMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([day, count]) => ({ day, count }));

  const pathMap = new Map<string, number>();
  for (const r of rows) pathMap.set(r.path, (pathMap.get(r.path) ?? 0) + r.count);
  const topPaths = [...pathMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([path, count]) => ({ path, count }));

  return { total, last7, today: todayCount, byDay, topPaths };
}
