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
  plan?: 'monthly' | 'annual';
  successUrl: string;
  cancelUrl: string;
}

/**
 * Purchase = the ONE-TIME build fee only (mode: 'payment'). Hosting is a separate
 * subscription started at go-live, after the customer picks a design — see
 * `createHostingCheckout`. Offline returns null (caller runs instant-purchase).
 */
export async function createCheckoutSession(input: CheckoutInput): Promise<{ url: string } | null> {
  if (!isBillingLive()) {
    logger.info('billing.offline: skipping Stripe checkout', { email: input.email });
    return null;
  }
  const buildFee = process.env.STRIPE_PRICE_BUILD_FEE;
  const s = await stripe();
  const session = await s.checkout.sessions.create({
    mode: 'payment',
    customer_email: input.email,
    line_items: buildFee ? [{ price: buildFee, quantity: 1 }] : [],
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    payment_intent_data: { metadata: { product: 'simplesight', kind: 'build_fee' } },
  });
  return session.url ? { url: session.url } : null;
}

export interface HostingCheckoutInput {
  email: string;
  plan: 'monthly' | 'annual';
  successUrl: string;
  cancelUrl: string;
  customerId?: string;
}

/**
 * Hosting subscription checkout — created at GO-LIVE, once the customer has
 * chosen a design. Offline returns null (the go-live flow proceeds without it).
 */
export async function createHostingCheckout(input: HostingCheckoutInput): Promise<{ url: string } | null> {
  if (!isBillingLive()) {
    logger.info('billing.offline: skipping hosting subscription', { email: input.email, plan: input.plan });
    return null;
  }
  const hosting = input.plan === 'annual' ? process.env.STRIPE_PRICE_HOSTING_ANNUAL : process.env.STRIPE_PRICE_HOSTING_MONTHLY;
  if (!hosting) return null;
  const s = await stripe();
  const session = await s.checkout.sessions.create({
    mode: 'subscription',
    ...(input.customerId ? { customer: input.customerId } : { customer_email: input.email }),
    line_items: [{ price: hosting, quantity: 1 }],
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    subscription_data: { metadata: { product: 'simplesight', kind: 'hosting' } },
  });
  return session.url ? { url: session.url } : null;
}

export interface VerifiedEvent {
  type: string;
  /** Checkout mode: 'payment' = build fee (create the project); 'subscription' = hosting. */
  mode?: 'payment' | 'subscription';
  kind?: string; // metadata.kind: 'build_fee' | 'hosting'
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
      mode: session.mode === 'subscription' ? 'subscription' : 'payment',
      kind: session.metadata?.kind ?? session.subscription_data?.metadata?.kind,
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
