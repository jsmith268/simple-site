"use server";

import {
  getBillingIdsForProject,
  getProject,
  getProjectEmail,
  hasActiveSubscription,
  listConnectionSteps,
  listDomains,
  recordRefund,
  recordSubscription,
  setProjectStatus,
  unpublishSite,
} from "@simplesight/db";
import { email } from "@simplesight/observability";
import {
  buyDomain,
  connectCustomDomain,
  goLive,
  isBillingLive,
  refundAndCancel,
  searchDomain,
} from "@simplesight/provisioning";
import { requireOwnedProject } from "@/lib/auth";

const ROOT = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "simplesight.localhost";

// The customer can request a refund once their site has actually been built.
const REFUND_ELIGIBLE_STATUSES = new Set(["approved", "finalized", "built", "completed", "live"]);

/**
 * Start the hosting subscription. Live checkout runs CLIENT-SIDE (Paddle.js
 * overlay → subscription.created webhook). Offline, we record the subscription
 * as active so the go-live flow can proceed with no external services.
 */
export async function startHostingAction(projectId: string, plan: "monthly" | "annual" = "monthly") {
  await requireOwnedProject(projectId);
  if (isBillingLive()) return { ok: true as const, live: true as const };
  await recordSubscription({ projectId, plan, status: "active" });
  return { ok: true as const, live: false as const };
}

async function notifyLive(projectId: string, domain: string) {
  try {
    const to = await getProjectEmail(projectId);
    if (to) await email.goingLive(to, domain, `https://${domain}`);
  } catch {
    /* non-fatal */
  }
}

export async function loadGoLive(projectId: string) {
  await requireOwnedProject(projectId);
  const [project, domains, steps, hostingActive] = await Promise.all([
    getProject(projectId),
    listDomains(projectId),
    listConnectionSteps(projectId),
    hasActiveSubscription(projectId),
  ]);
  const subdomain = project?.username ? `${project.username}.${ROOT}` : null;
  const windowOpen = !!project?.refundDeadlineAt && new Date(project.refundDeadlineAt) > new Date();
  // Refund is only offered once the site is actually built (per the guarantee).
  const canRefund = windowOpen && !!project && REFUND_ELIGIBLE_STATUSES.has(project.status);
  return { project: project ?? null, domains, steps, subdomain, hostingActive, canRefund };
}

/** Go live on the free Simple Site subdomain. Requires an active hosting plan. */
export async function goLiveSubdomainAction(projectId: string) {
  await requireOwnedProject(projectId);
  const project = await getProject(projectId);
  if (!project?.username) return { ok: false, error: "Reserve a username first." };
  if (!(await hasActiveSubscription(projectId))) {
    return { ok: false, error: "Start a hosting plan before going live." };
  }
  const domain = `${project.username}.${ROOT}`;
  const result = await goLive(projectId, domain, "subdomain");
  if (result.live) await notifyLive(projectId, domain);
  return { ok: result.live, ...result };
}

/** Attach a customer's existing domain; returns the DNS records to set. */
export async function connectDomainAction(projectId: string, domain: string) {
  await requireOwnedProject(projectId);
  const status = await connectCustomDomain(projectId, domain.trim().toLowerCase());
  return { ok: true, ...status };
}

/** After the customer sets DNS, verify + go live on the custom domain. */
export async function goLiveCustomAction(projectId: string, domain: string) {
  await requireOwnedProject(projectId);
  if (!(await hasActiveSubscription(projectId))) {
    return { ok: false, error: "Start a hosting plan before going live." };
  }
  const d = domain.trim().toLowerCase();
  const result = await goLive(projectId, d, "custom");
  if (result.live) await notifyLive(projectId, d);
  return { ok: result.live, ...result };
}

/** Search + buy a domain through us (Vercel Domains), then attach it. */
export async function buyDomainAction(projectId: string, domain: string) {
  await requireOwnedProject(projectId);
  const d = domain.trim().toLowerCase();
  const avail = await searchDomain(d);
  if (!avail.available) return { ok: false, error: "That domain isn't available." };
  const bought = await buyDomain(d);
  if (!bought.ok) return { ok: false, error: "Purchase failed." };
  const status = await connectCustomDomain(projectId, d);
  return { ok: true, priceUsd: avail.priceUsd, ...status };
}

/**
 * 30-day money-back guarantee. Eligible once the site is built and within 30
 * days of purchase (refundDeadlineAt). Issues the REAL Paddle refund + cancels
 * hosting, then unpublishes and records it. The customer is emailed only after
 * the refund call succeeds. Live Paddle refunds start `pending_approval` and
 * confirm via the adjustment.updated webhook → recordRefund/updateRefundStatus.
 */
export async function refundAction(projectId: string) {
  await requireOwnedProject(projectId);
  const project = await getProject(projectId);
  if (!project) return { ok: false, error: "Project not found." };
  if (project.refundDeadlineAt && new Date(project.refundDeadlineAt) < new Date()) {
    return { ok: false, error: "The 30-day refund window has closed." };
  }
  if (!REFUND_ELIGIBLE_STATUSES.has(project.status)) {
    return { ok: false, error: "You can request a refund once your site has been built." };
  }

  const { transactionId, subscriptionId } = await getBillingIdsForProject(projectId);
  let adjustmentId: string | undefined;
  try {
    const res = await refundAndCancel({
      transactionId,
      subscriptionId,
      reason: "30-day money-back guarantee",
    });
    adjustmentId = res.adjustmentId;
  } catch (err) {
    return { ok: false, error: `We couldn't process the refund: ${String((err as Error)?.message ?? err)}` };
  }

  await recordRefund({ projectId, paddleAdjustmentId: adjustmentId, amountCents: 0, reason: "30-day guarantee" });
  await unpublishSite(projectId);
  await setProjectStatus(projectId, "refunded");
  try {
    const to = await getProjectEmail(projectId);
    if (to) await email.refunded(to);
  } catch {
    /* non-fatal */
  }
  // Live refunds are reviewed by Paddle → "requested"; offline completes instantly.
  return { ok: true as const, status: isBillingLive() ? "requested" : "done" };
}
