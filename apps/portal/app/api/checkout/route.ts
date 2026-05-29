import { createPurchasedProject } from "@simplesight/db";
import { email } from "@simplesight/observability";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * OFFLINE instant-purchase only. Live checkout uses the Paddle.js overlay on
 * /buy (the webhook then creates the project). This route creates the project
 * directly for the signed-in user when Paddle isn't configured, so the full
 * flow stays testable with no external services.
 */
export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const user = await currentUser();
  const addr =
    user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses?.[0]?.emailAddress ?? "";
  const { projectId } = await createPurchasedProject({ email: addr, clerkUserId: userId, amountCents: 0 });
  if (addr) await email.purchaseReceived(addr).catch(() => {});
  return NextResponse.json({ redirect: `/onboarding/${projectId}` });
}
