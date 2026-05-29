import { createPurchasedProject } from "@simplesight/db";
import { email } from "@simplesight/observability";
import { createCheckoutSession } from "@simplesight/provisioning";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Start a purchase. With Stripe configured, returns a Checkout URL (the webhook
 * later creates the project). Offline, runs the instant-purchase path and
 * returns the onboarding redirect so the full flow is testable with no Stripe.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { email?: string; plan?: "monthly" | "annual" };
  if (!body.email) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }
  const origin = new URL(req.url).origin;
  const session = await createCheckoutSession({
    email: body.email,
    plan: body.plan ?? "monthly",
    successUrl: `${origin}/onboarding/recent`,
    cancelUrl: `${origin}/buy`,
  });
  if (session?.url) {
    return NextResponse.json({ url: session.url });
  }
  // Offline / no Stripe: create the project immediately.
  const { projectId } = await createPurchasedProject({ email: body.email, amountCents: 0 });
  await email.purchaseReceived(body.email).catch(() => {});
  return NextResponse.json({ redirect: `/onboarding/${projectId}` });
}
