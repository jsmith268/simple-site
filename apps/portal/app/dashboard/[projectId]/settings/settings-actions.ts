"use server";

import type { BusinessInfo, IntakeStyle } from "@simplesight/contracts";
import { saveIntake } from "@simplesight/db";

/** Persist edited business/style after onboarding (re-feeds the next revision/build). */
export async function saveSettingsAction(projectId: string, sections: { business?: BusinessInfo; style?: IntakeStyle }) {
  await saveIntake(projectId, sections);
  return { ok: true as const };
}
