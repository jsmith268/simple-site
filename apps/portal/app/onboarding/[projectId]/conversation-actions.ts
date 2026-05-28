"use server";

import { runRound } from "@simplesight/agents";
import { completeIntake, reserveUsername, saveIntake } from "@simplesight/db";
import { isOffline } from "@simplesight/env";
import { logger } from "@simplesight/observability";
import { type ConversationDraft, mapDraftToIntake } from "./draft";

export async function checkUsernameAction(projectId: string, username: string) {
  return reserveUsername(projectId, username);
}

/**
 * Finalize the conversation → persist intake → reserve the address → kick off
 * the first dual-model round. Offline the round is fast (deterministic), so we
 * await it; online it is long-running, so we fire it and let the studio screen
 * poll. Either way the customer lands on /studio and watches it build.
 */
export async function submitConversationAction(projectId: string, draft: ConversationDraft) {
  const { style, business } = mapDraftToIntake(draft);
  await saveIntake(projectId, { style, business, referenceUrls: draft.references });
  if (draft.username) {
    const r = await reserveUsername(projectId, draft.username);
    if (!r.ok) return { ok: false as const, error: r.error ?? "That address is taken." };
  }
  await completeIntake(projectId);

  if (isOffline()) {
    await runRound(projectId);
    return { ok: true as const, status: "comparing" as const };
  }
  void runRound(projectId).catch((err) => logger.error("dual round failed", { projectId, error: String(err) }));
  return { ok: true as const, status: "generating" as const };
}
