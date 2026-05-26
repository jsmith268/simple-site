import { createPurchasedProject } from "@simplesight/db";
import { logger } from "@simplesight/observability";
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
  if (event?.type === "checkout.session.completed" && event.email) {
    const { projectId } = await createPurchasedProject({
      email: event.email,
      stripeCustomerId: event.stripeCustomerId,
      paymentIntentId: event.paymentIntentId,
      amountCents: event.amountCents ?? 0,
    });
    logger.info("checkout.completed: project created", { projectId, email: event.email });
  }
  return NextResponse.json({ received: true });
}
