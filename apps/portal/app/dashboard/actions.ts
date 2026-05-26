"use server";

import { runBuildPipeline } from "@simplesight/agents";
import {
  getIntake,
  getProject,
  listRunsForProject,
  setProjectStatus,
} from "@simplesight/db";
import { previewUrl } from "@/lib/preview";

/** Customer view of their project: status, preview link, latest build run. */
export async function loadDashboard(projectId: string) {
  const [project, intake, runs] = await Promise.all([
    getProject(projectId),
    getIntake(projectId),
    listRunsForProject(projectId),
  ]);
  if (!project) return { project: null as null };
  return {
    project,
    businessName: intake?.business?.name ?? null,
    preview: project.username ? previewUrl(project.username) : null,
    latestRun: runs[0] ?? null,
    runs,
  };
}

/** Customer requests changes → re-run the build, return to preview. */
export async function requestChangesAction(projectId: string, _notes?: string) {
  await setProjectStatus(projectId, "changes_requested");
  const result = await runBuildPipeline(projectId);
  return { ok: true, ...result };
}

/** Customer approves the site → ready for go-live (Phase 5). */
export async function approveProjectAction(projectId: string) {
  await setProjectStatus(projectId, "approved");
  return { ok: true };
}
