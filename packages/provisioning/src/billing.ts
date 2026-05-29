import { logger } from '@simplesight/observability';
import { Environment, EventName, Paddle } from '@paddle/paddle-node-sdk';

/**
 * Paddle (merchant of record) wrapper. Live when PADDLE_API_KEY is set; otherwise
 * offline mode (no SDK calls), so purchase → onboarding is fully testable locally.
 *
 * Checkout itself is CLIENT-SIDE (Paddle.js overlay, see apps/portal/app/buy).
 * The server's job is the source of truth: verifying webhooks and issuing
 * refunds/cancellations. There is no server-created checkout session.
 */
export function isBillingLive(): boolean {
  return !!process.env.PADDLE_API_KEY;
}

function paddleEnv(): Environment {
  return process.env.PADDLE_ENV === 'production' ? Environment.production : Environment.sandbox;
}

let _paddle: Paddle | null = null;
function paddle(): Paddle {
  if (!_paddle) _paddle = new Paddle(process.env.PADDLE_API_KEY as string, { environment: paddleEnv() });
  return _paddle;
}

// Price ids identify which product a transaction/subscription line item is.
const buildFeePrice = () => process.env.PADDLE_PRICE_BUILD_FEE ?? '';
const hostingMonthlyPrice = () => process.env.PADDLE_PRICE_HOSTING_MONTHLY ?? '';
const hostingAnnualPrice = () => process.env.PADDLE_PRICE_HOSTING_ANNUAL ?? '';

function classifyPrices(priceIds: string[]): 'build_fee' | 'hosting' | 'other' {
  if (buildFeePrice() && priceIds.includes(buildFeePrice())) return 'build_fee';
  if (priceIds.includes(hostingMonthlyPrice()) || priceIds.includes(hostingAnnualPrice())) return 'hosting';
  return 'other';
}
function planFromPrices(priceIds: string[]): 'monthly' | 'annual' | undefined {
  if (hostingAnnualPrice() && priceIds.includes(hostingAnnualPrice())) return 'annual';
  if (hostingMonthlyPrice() && priceIds.includes(hostingMonthlyPrice())) return 'monthly';
  return undefined;
}

export interface VerifiedEvent {
  type: string;
  /** Paddle event id — persist this to make webhook handling idempotent. */
  eventId: string;
  kind?: 'build_fee' | 'hosting' | 'other';
  /** From Paddle.js customData — the buyer's Clerk user id. */
  clerkUserId?: string;
  /** From Paddle.js customData — the project a hosting subscription belongs to. */
  projectId?: string;
  email?: string;
  paddleCustomerId?: string;
  transactionId?: string;
  amountCents?: number;
  subscriptionId?: string;
  plan?: 'monthly' | 'annual';
  status?: string;
  adjustmentId?: string;
  currentPeriodEnd?: string;
}

/**
 * Verify a Paddle webhook (HMAC-SHA256 of `ts:body` against the pdl_ntfset_
 * secret, with replay protection) and normalize the events we care about.
 * Returns null only when billing is offline (no key). A bad signature throws.
 */
export async function constructWebhookEvent(
  rawBody: string,
  signature: string,
): Promise<VerifiedEvent | null> {
  if (!isBillingLive()) return null;
  const secret = process.env.PADDLE_WEBHOOK_SECRET as string;
  const event = await paddle().webhooks.unmarshal(rawBody, secret, signature);
  if (!event) return null;
  const data = event.data as Record<string, any>;
  const base: VerifiedEvent = { type: event.eventType, eventId: event.eventId };

  switch (event.eventType) {
    case EventName.TransactionCompleted: {
      const priceIds: string[] = (data.items ?? []).map((i: any) => i.price?.id).filter(Boolean);
      return {
        ...base,
        kind: classifyPrices(priceIds),
        clerkUserId: data.customData?.clerkUserId,
        projectId: data.customData?.projectId,
        email: data.customData?.email,
        paddleCustomerId: data.customerId ?? undefined,
        transactionId: data.id,
        subscriptionId: data.subscriptionId ?? undefined,
        amountCents: data.details?.totals?.total ? Number(data.details.totals.total) : undefined,
      };
    }
    case EventName.SubscriptionCreated:
    case EventName.SubscriptionUpdated:
    case EventName.SubscriptionCanceled: {
      const priceIds: string[] = (data.items ?? []).map((i: any) => i.price?.id).filter(Boolean);
      return {
        ...base,
        kind: 'hosting',
        clerkUserId: data.customData?.clerkUserId,
        projectId: data.customData?.projectId,
        paddleCustomerId: data.customerId ?? undefined,
        subscriptionId: data.id,
        status: data.status,
        plan: planFromPrices(priceIds),
        currentPeriodEnd: data.currentBillingPeriod?.endsAt ?? undefined,
      };
    }
    case EventName.AdjustmentCreated:
    case EventName.AdjustmentUpdated: {
      return {
        ...base,
        adjustmentId: data.id,
        transactionId: data.transactionId ?? undefined,
        status: data.status,
      };
    }
    default:
      return base;
  }
}

/** Hosted Paddle customer portal (manage / cancel subscription, update card). */
export async function createBillingPortalSession(
  customerId: string,
  subscriptionIds: string[] = [],
): Promise<{ url: string } | null> {
  if (!isBillingLive()) return null;
  const session = await paddle().customerPortalSessions.create(customerId, subscriptionIds);
  return { url: session.urls.general.overview };
}

/**
 * Refund the build fee (full) and cancel hosting immediately — the 30-day
 * money-back guarantee. Returns the adjustment id (live refunds start as
 * `pending_approval` and confirm via the adjustment.updated webhook).
 */
export async function refundAndCancel(opts: {
  transactionId?: string;
  subscriptionId?: string;
  reason?: string;
}): Promise<{ adjustmentId?: string }> {
  if (!isBillingLive()) {
    logger.info('billing.offline: would refund + cancel', opts);
    return {};
  }
  const p = paddle();
  let adjustmentId: string | undefined;
  if (opts.transactionId) {
    const adj = await p.adjustments.create({
      action: 'refund',
      type: 'full',
      reason: opts.reason ?? '30-day money-back guarantee',
      transactionId: opts.transactionId,
    });
    adjustmentId = adj.id;
  }
  if (opts.subscriptionId) {
    await p.subscriptions.cancel(opts.subscriptionId, { effectiveFrom: 'immediately' });
  }
  return { adjustmentId };
}
