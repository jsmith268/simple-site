import { logger } from '@simplesight/observability';

/**
 * Stripe wrapper. Live when STRIPE_SECRET_KEY is set; otherwise offline mode
 * (no SDK calls), so the purchase → onboarding flow is fully testable locally.
 */
export function isBillingLive(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

async function stripe() {
  const { default: Stripe } = await import('stripe');
  return new Stripe(process.env.STRIPE_SECRET_KEY as string);
}

export interface CheckoutInput {
  email: string;
  plan: 'monthly' | 'annual';
  successUrl: string;
  cancelUrl: string;
}

/**
 * Create a Checkout session for the one-time build fee plus the chosen hosting
 * subscription. Returns the URL to redirect the buyer to. Offline returns null
 * (the caller then runs the instant-purchase path).
 */
export async function createCheckoutSession(input: CheckoutInput): Promise<{ url: string } | null> {
  if (!isBillingLive()) {
    logger.info('billing.offline: skipping Stripe checkout', { email: input.email });
    return null;
  }
  const buildFee = process.env.STRIPE_PRICE_BUILD_FEE;
  const hosting =
    input.plan === 'annual'
      ? process.env.STRIPE_PRICE_HOSTING_ANNUAL
      : process.env.STRIPE_PRICE_HOSTING_MONTHLY;
  const s = await stripe();
  const session = await s.checkout.sessions.create({
    mode: 'subscription',
    customer_email: input.email,
    line_items: [
      ...(buildFee ? [{ price: buildFee, quantity: 1 }] : []),
      ...(hosting ? [{ price: hosting, quantity: 1 }] : []),
    ],
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    subscription_data: { metadata: { product: 'simplesight' } },
  });
  return session.url ? { url: session.url } : null;
}

export interface VerifiedEvent {
  type: string;
  email?: string;
  stripeCustomerId?: string;
  paymentIntentId?: string;
  amountCents?: number;
  subscriptionId?: string;
}

/** Verify a webhook signature and normalize the events we care about. */
export async function constructWebhookEvent(
  rawBody: string,
  signature: string,
): Promise<VerifiedEvent | null> {
  if (!isBillingLive()) return null;
  const secret = process.env.STRIPE_WEBHOOK_SECRET as string;
  const s = await stripe();
  const event = s.webhooks.constructEvent(rawBody, signature, secret);
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Record<string, any>;
    return {
      type: event.type,
      email: session.customer_email ?? session.customer_details?.email,
      stripeCustomerId: typeof session.customer === 'string' ? session.customer : undefined,
      paymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : undefined,
      amountCents: session.amount_total ?? undefined,
      subscriptionId: typeof session.subscription === 'string' ? session.subscription : undefined,
    };
  }
  return { type: event.type };
}

export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string,
): Promise<{ url: string } | null> {
  if (!isBillingLive()) return null;
  const s = await stripe();
  const session = await s.billingPortal.sessions.create({ customer: customerId, return_url: returnUrl });
  return { url: session.url };
}

/** Refund the build fee and cancel hosting (the 30-day money-back guarantee). */
export async function refundAndCancel(opts: {
  paymentIntentId?: string;
  subscriptionId?: string;
}): Promise<void> {
  if (!isBillingLive()) {
    logger.info('billing.offline: would refund + cancel', opts);
    return;
  }
  const s = await stripe();
  if (opts.paymentIntentId) await s.refunds.create({ payment_intent: opts.paymentIntentId });
  if (opts.subscriptionId) await s.subscriptions.cancel(opts.subscriptionId);
}
