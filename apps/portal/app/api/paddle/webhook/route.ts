import {
  createPurchasedProject,
  getProjectIdBySubscription,
  isEventProcessed,
  markEventProcessed,
  recordSubscription,
  setSubscriptionStatus,
  unpublishSite,
  updateRefundStatus,
} from "@simplesight/db";
import { email, logger } from "@simplesight/observability";
import { constructWebhookEvent } from "@simplesight/provisioning";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Paddle webhook — the source of truth for fulfillment. Signature-verified
 * (HMAC-SHA256, replay-protected) by the SDK; idempotent via processed_events.
 */
export async function POST(req: Request) {
  const signature = req.headers.get("paddle-signature") ?? "";
  const raw = await req.text();

  let event;
  try {
    event = await constructWebhookEvent(raw, signature);
  } catch (err) {
    logger.warn("paddle webhook: invalid signature", { error: String(err) });
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }
  if (!event) return NextResponse.json({ received: true }); // offline / no key

  // At-least-once delivery → no-op if we've already handled this event id.
  if (await isEventProcessed(event.eventId)) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "transaction.completed": {
        // Only the one-time BUILD FEE creates a project. Hosting is handled by
        // the subscription.* events below.
        if (event.kind === "build_fee") {
          const { projectId } = await createPurchasedProject({
            email: event.email ?? "",
            clerkUserId: event.clerkUserId,
            paddleCustomerId: event.paddleCustomerId,
            transactionId: event.transactionId,
            amountCents: event.amountCents ?? 0,
          });
          logger.info("paddle: build fee paid → project", { projectId });
          if (event.email) await email.purchaseReceived(event.email).catch(() => {});
        }
        break;
      }
      case "subscription.created":
      case "subscription.updated": {
        const projectId =
          event.projectId ??
          (event.subscriptionId ? await getProjectIdBySubscription(event.subscriptionId) : undefined);
        if (projectId) {
          await recordSubscription({
            projectId,
            paddleSubscriptionId: event.subscriptionId,
            plan: event.plan,
            status: event.status,
            currentPeriodEnd: event.currentPeriodEnd,
          });
        } else {
          logger.warn("paddle: subscription event with no resolvable project", {
            subscriptionId: event.subscriptionId,
          });
        }
        break;
      }
      case "subscription.canceled": {
        if (event.subscriptionId) {
          await setSubscriptionStatus(event.subscriptionId, "canceled");
          // Non-payment / cancellation takes the site offline (dunning).
          const projectId = await getProjectIdBySubscription(event.subscriptionId);
          if (projectId) await unpublishSite(projectId).catch(() => {});
        }
        break;
      }
      case "adjustment.created":
      case "adjustment.updated": {
        if (event.adjustmentId && event.status) {
          await updateRefundStatus(event.adjustmentId, event.status);
        }
        break;
      }
    }
    await markEventProcessed(event.eventId, event.type);
  } catch (err) {
    // Don't mark processed → Paddle retries (the handler is idempotent).
    logger.error("paddle webhook handler failed", { type: event.type, error: String(err) });
    return NextResponse.json({ error: "handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
