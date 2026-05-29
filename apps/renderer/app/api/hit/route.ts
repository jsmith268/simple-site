import { recordHit } from "@simplesight/db";

export const runtime = "nodejs";

// Best-effort per-instance rate limit (fixed window). Serverless instances don't
// share this, so it's not a hard guarantee — just a cheap brake on a single
// client hammering the beacon to inflate counts.
const WINDOW_MS = 10_000;
const MAX_PER_WINDOW = 20;
const hits = new Map<string, { n: number; resetAt: number }>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const e = hits.get(key);
  if (!e || now > e.resetAt) {
    hits.set(key, { n: 1, resetAt: now + WINDOW_MS });
    if (hits.size > 5000) for (const [k, v] of hits) if (now > v.resetAt) hits.delete(k);
    return false;
  }
  e.n += 1;
  return e.n > MAX_PER_WINDOW;
}

/**
 * Cookieless analytics beacon. The live site posts { u, p } (tenant username +
 * in-site path) on page view. No cookies, no PII — just an aggregate counter
 * bump. Always 204s; analytics must never break a customer's page.
 */
export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (rateLimited(ip)) return new Response(null, { status: 204 });

    const raw = await req.text();
    let u: string | undefined;
    let p: string | undefined;
    if (raw) {
      try {
        const body = JSON.parse(raw) as { u?: unknown; p?: unknown };
        if (typeof body.u === "string") u = body.u;
        if (typeof body.p === "string") p = body.p;
      } catch {
        /* malformed body — ignore */
      }
    }
    if (!u) {
      const url = new URL(req.url);
      u = url.searchParams.get("u") ?? undefined;
      p = p ?? url.searchParams.get("p") ?? undefined;
    }
    // Bound input sizes (recordHit normalizes username/path further).
    if (u && u.length <= 64) await recordHit({ username: u, path: p?.slice(0, 512) });
  } catch {
    /* never surface analytics errors to the visitor */
  }
  return new Response(null, { status: 204 });
}
