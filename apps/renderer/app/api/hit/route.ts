import { recordHit } from "@simplesight/db";

export const runtime = "nodejs";

/**
 * Cookieless analytics beacon. The live site posts { u, p } (tenant username +
 * in-site path) on page view. No cookies, no IP, no PII — just an aggregate
 * counter bump. Always 204s; analytics must never break a customer's page.
 */
export async function POST(req: Request) {
  try {
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
    if (u) await recordHit({ username: u, path: p });
  } catch {
    /* never surface analytics errors to the visitor */
  }
  return new Response(null, { status: 204 });
}
