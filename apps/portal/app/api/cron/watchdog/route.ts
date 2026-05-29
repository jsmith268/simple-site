import { timingSafeEqual } from "node:crypto";
import { runBuildPipeline } from "@simplesight/agents";
import { finishRun, findStaleRuns } from "@simplesight/db";
import { logger } from "@simplesight/observability";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 300;

const STALE_MS = 15 * 60 * 1000; // a run with no progress for 15 min is stuck

function tokenOk(authHeader: string | null, secret: string): boolean {
  if (!authHeader) return false;
  const a = Buffer.from(authHeader);
  const b = Buffer.from(`Bearer ${secret}`);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Watchdog: finds builds stuck mid-run (crash, timeout, redeploy) and restarts
 * them. Schedule via Vercel Cron. Auth: CRON_SECRET — REQUIRED in production
 * (rejects when unset); skipped only outside production (local/offline).
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const isProd = process.env.NODE_ENV === "production";
  if (!secret) {
    if (isProd) return NextResponse.json({ error: "cron not configured" }, { status: 401 });
  } else if (!tokenOk(req.headers.get("authorization"), secret)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const stale = await findStaleRuns(STALE_MS);
  logger.info("watchdog: scanning", { staleCount: stale.length });

  const restarted: string[] = [];
  for (const run of stale) {
    try {
      // Close the stale run FIRST so it can't re-match next tick (no re-build
      // storm / double-spend), then restart from the deterministic floor.
      await finishRun(run.id, "failed", 0);
      await runBuildPipeline(run.projectId);
      restarted.push(run.projectId);
    } catch (err) {
      logger.error("watchdog: restart failed", { projectId: run.projectId, error: String(err) });
    }
  }

  return NextResponse.json({ scanned: stale.length, restarted });
}
