"use server";

import { runRound } from "@simplesight/agents";
import { completeIntake, reserveUsername, saveIntake, setGenerationState } from "@simplesight/db";
import { logger } from "@simplesight/observability";
import { type ConversationDraft, mapDraftToIntake } from "./draft";

export async function checkUsernameAction(projectId: string, username: string) {
  return reserveUsername(projectId, username);
}

/**
 * Finalize the conversation → persist intake → reserve the address → kick off
 * the first dual-model round. We set 'generating' and fire the build WITHOUT
 * awaiting (online and offline alike) so the customer always lands on the
 * "Generating…" screen and watches it build, rather than seeing sites pop in.
 */
export async function submitConversationAction(projectId: string, draft: ConversationDraft) {
  const { style, business } = mapDraftToIntake(draft);
  await saveIntake(projectId, { style, business, referenceUrls: draft.references });
  if (draft.username) {
    const r = await reserveUsername(projectId, draft.username);
    if (!r.ok) return { ok: false as const, error: r.error ?? "That address is taken." };
  }
  await completeIntake(projectId);

  // Show progress immediately, then build in the background; the studio polls.
  await setGenerationState(projectId, { status: "generating" });
  void runRound(projectId).catch(async (err) => {
    logger.error("dual round failed", { projectId, error: String(err) });
    // Never strand the customer on the generating screen.
    await setGenerationState(projectId, { status: "comparing" }).catch(() => {});
  });

  return { ok: true as const, status: "generating" as const };
}
