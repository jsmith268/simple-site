"use server";

import { runIntakeTurn } from "@simplesight/agents";
import type { ChatMessage, IntakeCollected } from "@simplesight/contracts";
import { logger } from "@simplesight/observability";

/** One turn of the live "Avery" intake. Stateless — the client holds the history + collected. */
export async function intakeTurnAction(history: ChatMessage[], collected: IntakeCollected) {
  try {
    const turn = await runIntakeTurn({ history, collected });
    return { ok: true as const, turn };
  } catch (e) {
    logger.error("intake turn failed", { error: String((e as Error)?.message ?? e) });
    return { ok: false as const, error: "Avery hit a snag — try again." };
  }
}
