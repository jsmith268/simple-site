"use server";

import { runBuildPipeline } from "@simplesight/agents";
import {
  getFleetSettings,
  getRunDetail,
  listOpenEscalations,
  listProjects,
  listRunsForProject,
  setKillSwitch,
} from "@simplesight/db";

/** Operator fleet overview: every project + its latest run + fleet controls. */
export async function loadFleet() {
  const [projects, fleet, escalations] = await Promise.all([
    listProjects(),
    getFleetSettings(),
    listOpenEscalations(),
  ]);
  const withRuns = await Promise.all(
    projects.map(async (p) => {
      const runs = await listRunsForProject(p.id);
      return { project: p, latestRun: runs[0] ?? null, runCount: runs.length };
    }),
  );
  return { projects: withRuns, fleet, escalations };
}

export async function loadProjectRuns(projectId: string) {
  return listRunsForProject(projectId);
}

/** Full run drill-in: steps + critic verdicts + supervisor decisions + every LLM call. */
export async function loadRun(runId: string) {
  return getRunDetail(runId);
}

export async function toggleKillSwitchAction(engaged: boolean) {
  await setKillSwitch(engaged, engaged ? "operator engaged from console" : undefined);
  return { ok: true };
}

/** Re-run the build for a project (operator action / recovery). */
export async function retriggerBuildAction(projectId: string) {
  const result = await runBuildPipeline(projectId);
  return { ok: true, ...result };
}
