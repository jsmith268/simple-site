"use server";

import type { BusinessInfo, IntakeStyle } from "@simplesight/contracts";
import {
  completeIntake,
  getIntake,
  getProject,
  reserveUsername,
  saveIntake,
} from "@simplesight/db";

export async function loadOnboarding(projectId: string) {
  const [project, intake] = await Promise.all([getProject(projectId), getIntake(projectId)]);
  return { project: project ?? null, intake: intake ?? null };
}

export async function saveStyleAction(projectId: string, style: IntakeStyle) {
  await saveIntake(projectId, { style, referenceUrls: style.referenceUrls });
  return { ok: true };
}

export async function saveBusinessAction(projectId: string, business: BusinessInfo) {
  await saveIntake(projectId, { business });
  return { ok: true };
}

export async function reserveUsernameAction(projectId: string, username: string) {
  return reserveUsername(projectId, username);
}

/** Finalize onboarding → queues the project for the build pipeline. */
export async function submitOnboardingAction(projectId: string) {
  await completeIntake(projectId);
  return { ok: true };
}
