"use server";

import type { BusinessInfo, IntakeStyle } from "@simplesight/contracts";
import { saveIntake } from "@simplesight/db";
import { requireOwnedProject } from "@/lib/auth";

/** Persist edited business/style after onboarding (re-feeds the next revision/build). */
export async function saveSettingsAction(projectId: string, sections: { business?: BusinessInfo; style?: IntakeStyle }) {
  await requireOwnedProject(projectId);
  await saveIntake(projectId, sections);
  return { ok: true as const };
}
