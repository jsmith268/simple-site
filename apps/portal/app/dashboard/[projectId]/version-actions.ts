"use server";

import { getSiteVersion, saveSiteSpec } from "@simplesight/db";
import { revalidatePath } from "next/cache";

/**
 * Restore a prior site version: re-persist its SiteSpec as the live site. Uses
 * the same saveSiteSpec writer the build/revision flow uses, so the renderer
 * serves it immediately (and the restore is itself snapshotted as a new version).
 */
export async function restoreVersionAction(
  projectId: string,
  versionId: string,
): Promise<{ ok: boolean; error?: string }> {
  const v = await getSiteVersion(projectId, versionId);
  if (!v) return { ok: false, error: "That version is no longer available." };
  try {
    await saveSiteSpec(projectId, v.spec);
  } catch {
    return { ok: false, error: "Couldn't restore that version. Please try again." };
  }
  revalidatePath(`/dashboard/${projectId}`);
  return { ok: true };
}
