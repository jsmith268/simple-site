"use server";

import { runBuildPipeline } from "@simplesight/agents";
import type { BusinessInfo, IntakeStyle } from "@simplesight/contracts";
import {
  completeIntake,
  getIntake,
  getProject,
  reserveUsername,
  saveIntake,
} from "@simplesight/db";
import { isOffline } from "@simplesight/env";
import { logger } from "@simplesight/observability";
import { requireOwnedProject } from "@/lib/auth";

export async function loadOnboarding(projectId: string) {
  await requireOwnedProject(projectId);
  const [project, intake] = await Promise.all([getProject(projectId), getIntake(projectId)]);
  return { project: project ?? null, intake: intake ?? null };
}

export async function saveStyleAction(projectId: string, style: IntakeStyle) {
  await requireOwnedProject(projectId);
  await saveIntake(projectId, { style, referenceUrls: style.referenceUrls });
  return { ok: true };
}

export async function saveBusinessAction(projectId: string, business: BusinessInfo) {
  await requireOwnedProject(projectId);
  await saveIntake(projectId, { business });
  return { ok: true };
}

export async function reserveUsernameAction(projectId: string, username: string) {
  await requireOwnedProject(projectId);
  return reserveUsername(projectId, username);
}

/**
 * Finalize onboarding → queue the project and kick off the build. Offline the
 * pipeline is deterministic and fast, so we await it. With live LLMs the build
 * is long-running; we fire it without blocking the request (a production
 * deployment runs it as a durable workflow — see docs Phase 6).
 */
export async function submitOnboardingAction(projectId: string) {
  await requireOwnedProject(projectId);
  await completeIntake(projectId);
  if (isOffline()) {
    const result = await runBuildPipeline(projectId);
    return { ok: true, ...result };
  }
  void runBuildPipeline(projectId).catch((err) =>
    logger.error("build pipeline failed", { projectId, error: String(err) }),
  );
  return { ok: true, status: "building" as const };
}
