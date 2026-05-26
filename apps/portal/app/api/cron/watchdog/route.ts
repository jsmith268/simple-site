import { runBuildPipeline } from "@simplesight/agents";
import { findStaleRuns } from "@simplesight/db";
import { logger } from "@simplesight/observability";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 300;

const STALE_MS = 15 * 60 * 1000; // a run with no progress for 15 min is stuck

/**
 * Watchdog: finds builds stuck mid-run (crash, timeout, redeploy) and restarts
 * them. Re-running is safe — saveSiteSpec replaces, and the deterministic floor
 * guarantees a site. Schedule via Vercel Cron. Auth: CRON_SECRET (skipped when
 * unset, e.g. local/offline).
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const stale = await findStaleRuns(STALE_MS);
  logger.info("watchdog: scanning", { staleCount: stale.length });

  const restarted: string[] = [];
  for (const run of stale) {
    try {
      await runBuildPipeline(run.projectId);
      restarted.push(run.projectId);
    } catch (err) {
      logger.error("watchdog: restart failed", { projectId: run.projectId, error: String(err) });
    }
  }

  return NextResponse.json({ scanned: stale.length, restarted });
}
