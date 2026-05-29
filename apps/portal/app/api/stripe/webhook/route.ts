import { createPurchasedProject } from "@simplesight/db";
import { email, logger } from "@simplesight/observability";
import { constructWebhookEvent } from "@simplesight/provisioning";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** Stripe webhook — the source of truth for fulfillment. */
export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature") ?? "";
  const raw = await req.text();
  let event;
  try {
    event = await constructWebhookEvent(raw, signature);
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }
  // Only the one-time BUILD FEE (mode 'payment') creates a project. The hosting
  // subscription (mode 'subscription', started at go-live) must NOT create a
  // duplicate project.
  if (event?.type === "checkout.session.completed" && event.mode !== "subscription" && event.email) {
    const { projectId } = await createPurchasedProject({
      email: event.email,
      stripeCustomerId: event.stripeCustomerId,
      paymentIntentId: event.paymentIntentId,
      amountCents: event.amountCents ?? 0,
    });
    logger.info("checkout.completed: project created", { projectId, email: event.email });
    await email.purchaseReceived(event.email).catch(() => {});
  } else if (event?.type === "checkout.session.completed") {
    logger.info("hosting subscription started", { email: event.email });
  }
  return NextResponse.json({ received: true });
}
