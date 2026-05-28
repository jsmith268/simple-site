"use server";

import { applyRevision, compileChecklist, regenerate, selectVariant } from "@simplesight/agents";
import type { RegenFeedback, SiteSpec, Viewport } from "@simplesight/contracts";
import {
  addRevisionItem,
  deleteRevisionItem,
  getVariant,
  getVariantSpec,
  listRevisionItems,
  markSitePreviewReady,
  saveSiteSpec,
  setGenerationState,
  setProjectStatus,
} from "@simplesight/db";
import { isOffline } from "@simplesight/env";
import { logger } from "@simplesight/observability";

/* Compare screen */

export async function selectVariantAction(projectId: string, variantId: string) {
  await selectVariant(projectId, variantId);
  return { ok: true as const };
}

export async function regenerateAction(projectId: string, feedback: RegenFeedback) {
  try {
    if (isOffline()) {
      await regenerate(projectId, feedback);
      return { ok: true as const, status: "comparing" as const };
    }
    void regenerate(projectId, feedback).catch((err) => logger.error("regenerate failed", { projectId, error: String(err) }));
    return { ok: true as const, status: "generating" as const };
  } catch (err) {
    return { ok: false as const, error: String((err as Error)?.message ?? err) };
  }
}

/* Refinement workspace */

export async function addCommentAction(input: {
  projectId: string;
  variantId: string;
  pageSlug: string;
  pageName?: string;
  viewport: Viewport;
  comment: string;
}) {
  const item = await addRevisionItem({ ...input, revision: 0, status: "open" });
  return { ok: true as const, item };
}

export async function deleteCommentAction(id: string) {
  await deleteRevisionItem(id);
  return { ok: true as const };
}

export async function listCommentsAction(projectId: string, variantId: string) {
  const items = await listRevisionItems(projectId, { variantId, revision: 0, status: "open" });
  return { items };
}

/** Compile the open comments into a grouped, summarized checklist (preview before approving). */
export async function previewChecklistAction(projectId: string, variantId: string) {
  const checklist = await compileChecklist(projectId, variantId);
  return { checklist };
}

/** Approve the checklist → apply it (keeps foundation; bounded; QA before surfacing). */
export async function approveRevisionAction(projectId: string, variantId: string) {
  if (isOffline()) {
    const res = await applyRevision(projectId, variantId);
    return res;
  }
  // Flip to the "applying" state up front so the studio shows progress immediately.
  await setGenerationState(projectId, { status: "revising" });
  void applyRevision(projectId, variantId).catch((err) => logger.error("applyRevision failed", { projectId, error: String(err) }));
  return { ok: true as const, revision: -1, remaining: -1, note: "applying" };
}

/** Lock in the selected design → ready for hosting / go-live. */
export async function finalizeAction(projectId: string, variantId: string) {
  const variant = await getVariant(variantId);
  // Block-mode/offline variants carry a renderable spec → publish it so the
  // renderer serves the chosen design at the customer's address.
  const spec = (await getVariantSpec(variantId)) as SiteSpec | undefined;
  if (spec) {
    await saveSiteSpec(projectId, spec);
    await markSitePreviewReady(projectId);
  }
  await setGenerationState(projectId, { status: "finalized" });
  await setProjectStatus(projectId, "approved");
  return { ok: true as const, previewUrl: variant?.previewUrl };
}
