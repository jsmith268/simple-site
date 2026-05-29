import { hasDatabase } from '@simplesight/env';
import { and, eq } from 'drizzle-orm';
import { db } from '../client';
import { customers, payments, processedEvents, projects, refunds, subscriptions } from '../schema/core';
import * as store from '../offline-store';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export interface PurchaseInput {
  email: string;
  /** When present (live Paddle webhook), the project is owned by this Clerk user. */
  clerkUserId?: string;
  paddleCustomerId?: string;
  /** Paddle transaction id — unique, makes fulfillment idempotent on webhook replay. */
  transactionId?: string;
  amountCents: number;
}

export interface ProjectRecord {
  id: string;
  customerId: string;
  email?: string;
  username: string | null;
  status: string;
  refundDeadlineAt: string | null;
  createdAt: string;
}

/**
 * Create (or reuse) a customer and a fresh purchased project. Called from the
 * Paddle webhook on transaction.completed (or the offline instant-purchase).
 *
 * Idempotent: if a payment with the same Paddle transaction id already exists,
 * the existing project is returned instead of creating a duplicate (Paddle
 * delivers webhooks at-least-once).
 */
export async function createPurchasedProject(input: PurchaseInput): Promise<{ projectId: string; customerId: string }> {
  const refundDeadline = new Date(Date.now() + THIRTY_DAYS_MS);

  if (!hasDatabase()) {
    if (input.transactionId) {
      const dup = store.findOne('payments', (p) => p.paddleTransactionId === input.transactionId);
      if (dup) {
        const proj = store.findOne('projects', (r) => r.id === dup.projectId);
        if (proj) return { projectId: proj.id, customerId: proj.customerId };
      }
    }
    const customer = input.clerkUserId
      ? await getOrCreateCustomerByClerkId(input.clerkUserId, input.email)
      : reuseOrInsertCustomerOffline(input.email, input.paddleCustomerId);
    const project = store.insert('projects', {
      customerId: customer.id,
      username: null,
      status: 'purchased',
      buildFeePaidAt: new Date().toISOString(),
      refundDeadlineAt: refundDeadline.toISOString(),
    });
    store.insert('payments', {
      projectId: project.id,
      paddleTransactionId: input.transactionId,
      amountCents: input.amountCents,
      kind: 'build_fee',
    });
    return { projectId: project.id, customerId: customer.id };
  }

  if (input.transactionId) {
    const dup = await db
      .select({ projectId: payments.projectId })
      .from(payments)
      .where(eq(payments.paddleTransactionId, input.transactionId))
      .limit(1);
    if (dup[0]?.projectId) {
      const proj = await db.select().from(projects).where(eq(projects.id, dup[0].projectId)).limit(1);
      if (proj[0]) return { projectId: proj[0].id, customerId: proj[0].customerId };
    }
  }
  if (input.clerkUserId) {
    const c = await getOrCreateCustomerByClerkId(input.clerkUserId, input.email);
    if (input.paddleCustomerId) {
      await db.update(customers).set({ paddleCustomerId: input.paddleCustomerId }).where(eq(customers.id, c.id));
    }
    return insertProjectAndPaymentPg(c.id, input, refundDeadline);
  }

  const existing = await db.select().from(customers).where(eq(customers.email, input.email)).limit(1);
  let customerId = existing[0]?.id;
  if (!customerId) {
    const inserted = await db
      .insert(customers)
      .values({ email: input.email, paddleCustomerId: input.paddleCustomerId })
      .returning({ id: customers.id });
    customerId = inserted[0]?.id as string;
  }
  return insertProjectAndPaymentPg(customerId, input, refundDeadline);
}

function reuseOrInsertCustomerOffline(email: string, paddleCustomerId?: string): { id: string; email: string } {
  const found = email ? store.findOne('customers', (c) => c.email === email) : undefined;
  if (found) return { id: found.id, email: found.email };
  const c = store.insert('customers', { email, paddleCustomerId });
  return { id: c.id, email: c.email };
}

async function insertProjectAndPaymentPg(
  customerId: string,
  input: PurchaseInput,
  refundDeadline: Date,
): Promise<{ projectId: string; customerId: string }> {
  return db.transaction(async (tx) => {
    const proj = await tx
      .insert(projects)
      .values({ customerId, status: 'purchased', buildFeePaidAt: new Date(), refundDeadlineAt: refundDeadline })
      .returning({ id: projects.id });
    const projectId = proj[0]?.id as string;
    await tx.insert(payments).values({
      projectId,
      paddleTransactionId: input.transactionId,
      amountCents: input.amountCents,
      kind: 'build_fee',
    });
    return { projectId, customerId };
  });
}

/** Look up a customer by their Clerk user id (auth identity → domain identity). */
export async function getCustomerByClerkId(
  clerkUserId: string,
): Promise<{ id: string; email: string } | undefined> {
  if (!hasDatabase()) {
    const c = store.findOne('customers', (r) => r.clerkUserId === clerkUserId);
    return c ? { id: c.id, email: c.email } : undefined;
  }
  const rows = await db
    .select({ id: customers.id, email: customers.email })
    .from(customers)
    .where(eq(customers.clerkUserId, clerkUserId))
    .limit(1);
  return rows[0];
}

/**
 * Upsert the customer row for an authenticated Clerk user. If a customer with
 * the same email already exists (e.g. created by the purchase webhook before
 * they signed in), link the Clerk id to it rather than creating a duplicate.
 */
export async function getOrCreateCustomerByClerkId(
  clerkUserId: string,
  email: string,
): Promise<{ id: string; email: string }> {
  const existing = await getCustomerByClerkId(clerkUserId);
  if (existing) return existing;

  if (!hasDatabase()) {
    const byEmail = email ? store.findOne('customers', (r) => r.email === email) : undefined;
    if (byEmail && !byEmail.clerkUserId) {
      store.update('customers', (r) => r.id === byEmail.id, { clerkUserId });
      return { id: byEmail.id, email: byEmail.email };
    }
    const c = store.insert('customers', { email, clerkUserId });
    return { id: c.id, email: c.email };
  }

  if (email) {
    const byEmail = await db.select().from(customers).where(eq(customers.email, email)).limit(1);
    if (byEmail[0] && !byEmail[0].clerkUserId) {
      await db.update(customers).set({ clerkUserId }).where(eq(customers.id, byEmail[0].id));
      return { id: byEmail[0].id, email: byEmail[0].email };
    }
  }
  const inserted = await db
    .insert(customers)
    .values({ clerkUserId, email })
    .returning({ id: customers.id, email: customers.email });
  return inserted[0] as { id: string; email: string };
}

export async function getProject(projectId: string): Promise<ProjectRecord | undefined> {
  if (!hasDatabase()) {
    const p = store.findOne('projects', (r) => r.id === projectId);
    if (!p) return undefined;
    const c = store.findOne('customers', (r) => r.id === p.customerId);
    return { ...(p as ProjectRecord), email: c?.email };
  }
  const rows = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  const p = rows[0];
  if (!p) return undefined;
  return {
    id: p.id,
    customerId: p.customerId,
    username: p.username,
    status: p.status,
    refundDeadlineAt: p.refundDeadlineAt ? p.refundDeadlineAt.toISOString() : null,
    createdAt: p.createdAt.toISOString(),
  };
}

/** The customer email for a project (for transactional notifications). */
export async function getProjectEmail(projectId: string): Promise<string | undefined> {
  if (!hasDatabase()) {
    const p = store.findOne('projects', (r) => r.id === projectId);
    if (!p) return undefined;
    return store.findOne('customers', (r) => r.id === p.customerId)?.email;
  }
  const rows = await db
    .select({ email: customers.email })
    .from(projects)
    .innerJoin(customers, eq(projects.customerId, customers.id))
    .where(eq(projects.id, projectId))
    .limit(1);
  return rows[0]?.email;
}

export async function setProjectStatus(projectId: string, status: string): Promise<void> {
  if (!hasDatabase()) {
    store.update('projects', (r) => r.id === projectId, { status });
    return;
  }
  await db.update(projects).set({ status }).where(eq(projects.id, projectId));
}

export async function listProjects(): Promise<ProjectRecord[]> {
  if (!hasDatabase()) {
    return store.readColl('projects') as ProjectRecord[];
  }
  const rows = await db.select().from(projects);
  return rows.map((p) => ({
    id: p.id,
    customerId: p.customerId,
    username: p.username,
    status: p.status,
    refundDeadlineAt: p.refundDeadlineAt ? p.refundDeadlineAt.toISOString() : null,
    createdAt: p.createdAt.toISOString(),
  }));
}

// ── Webhook idempotency ──────────────────────────────────────────────────────

export async function isEventProcessed(eventId: string): Promise<boolean> {
  if (!hasDatabase()) return !!store.findOne('processed_events', (e) => e.eventId === eventId);
  const rows = await db
    .select({ id: processedEvents.eventId })
    .from(processedEvents)
    .where(eq(processedEvents.eventId, eventId))
    .limit(1);
  return !!rows[0];
}

export async function markEventProcessed(eventId: string, type?: string): Promise<void> {
  if (!hasDatabase()) {
    if (!store.findOne('processed_events', (e) => e.eventId === eventId)) {
      store.insert('processed_events', { eventId, type });
    }
    return;
  }
  await db.insert(processedEvents).values({ eventId, type }).onConflictDoNothing();
}

// ── Hosting subscription persistence ─────────────────────────────────────────

export interface SubscriptionInput {
  projectId: string;
  paddleSubscriptionId?: string;
  plan?: string;
  status?: string;
  currentPeriodEnd?: string;
}

/** Upsert the hosting subscription for a project (webhook + offline start). */
export async function recordSubscription(input: SubscriptionInput): Promise<void> {
  if (!hasDatabase()) {
    const existing = input.paddleSubscriptionId
      ? store.findOne('subscriptions', (s) => s.paddleSubscriptionId === input.paddleSubscriptionId)
      : store.findOne('subscriptions', (s) => s.projectId === input.projectId);
    if (existing) {
      store.update('subscriptions', (s) => s.id === existing.id, {
        plan: input.plan ?? existing.plan,
        status: input.status ?? existing.status,
        paddleSubscriptionId: input.paddleSubscriptionId ?? existing.paddleSubscriptionId,
        currentPeriodEnd: input.currentPeriodEnd ?? existing.currentPeriodEnd,
      });
    } else {
      store.insert('subscriptions', {
        projectId: input.projectId,
        paddleSubscriptionId: input.paddleSubscriptionId,
        plan: input.plan,
        status: input.status ?? 'active',
        currentPeriodEnd: input.currentPeriodEnd,
      });
    }
    return;
  }
  const periodEnd = input.currentPeriodEnd ? new Date(input.currentPeriodEnd) : undefined;
  if (input.paddleSubscriptionId) {
    await db
      .insert(subscriptions)
      .values({
        projectId: input.projectId,
        paddleSubscriptionId: input.paddleSubscriptionId,
        plan: input.plan,
        status: input.status,
        currentPeriodEnd: periodEnd,
      })
      .onConflictDoUpdate({
        target: subscriptions.paddleSubscriptionId,
        set: { plan: input.plan, status: input.status, currentPeriodEnd: periodEnd },
      });
  } else {
    await db.insert(subscriptions).values({
      projectId: input.projectId,
      plan: input.plan,
      status: input.status ?? 'active',
      currentPeriodEnd: periodEnd,
    });
  }
}

export async function setSubscriptionStatus(paddleSubscriptionId: string, status: string): Promise<void> {
  if (!hasDatabase()) {
    store.update('subscriptions', (s) => s.paddleSubscriptionId === paddleSubscriptionId, { status });
    return;
  }
  await db
    .update(subscriptions)
    .set({ status })
    .where(eq(subscriptions.paddleSubscriptionId, paddleSubscriptionId));
}

/** True when the project has a hosting subscription that is active (gates go-live). */
export async function hasActiveSubscription(projectId: string): Promise<boolean> {
  if (!hasDatabase()) {
    return !!store.findOne(
      'subscriptions',
      (s) => s.projectId === projectId && (s.status === 'active' || s.status === 'trialing'),
    );
  }
  const rows = await db
    .select({ status: subscriptions.status })
    .from(subscriptions)
    .where(eq(subscriptions.projectId, projectId));
  return rows.some((r) => r.status === 'active' || r.status === 'trialing');
}

/** Map a Paddle subscription id back to its project (for status webhooks). */
export async function getProjectIdBySubscription(paddleSubscriptionId: string): Promise<string | undefined> {
  if (!hasDatabase()) {
    return store.findOne('subscriptions', (s) => s.paddleSubscriptionId === paddleSubscriptionId)?.projectId;
  }
  const rows = await db
    .select({ projectId: subscriptions.projectId })
    .from(subscriptions)
    .where(eq(subscriptions.paddleSubscriptionId, paddleSubscriptionId))
    .limit(1);
  return rows[0]?.projectId;
}

/** The Paddle ids needed to refund + cancel (build-fee txn + hosting sub). */
export async function getBillingIdsForProject(
  projectId: string,
): Promise<{ transactionId?: string; subscriptionId?: string }> {
  if (!hasDatabase()) {
    const pay = store.findOne('payments', (p) => p.projectId === projectId && p.kind === 'build_fee');
    const sub = store.findOne('subscriptions', (s) => s.projectId === projectId);
    return { transactionId: pay?.paddleTransactionId, subscriptionId: sub?.paddleSubscriptionId };
  }
  const pay = await db
    .select({ tx: payments.paddleTransactionId })
    .from(payments)
    .where(and(eq(payments.projectId, projectId), eq(payments.kind, 'build_fee')))
    .limit(1);
  const sub = await db
    .select({ sid: subscriptions.paddleSubscriptionId })
    .from(subscriptions)
    .where(eq(subscriptions.projectId, projectId))
    .limit(1);
  return { transactionId: pay[0]?.tx ?? undefined, subscriptionId: sub[0]?.sid ?? undefined };
}

// ── Refunds ──────────────────────────────────────────────────────────────────

export async function recordRefund(input: {
  projectId: string;
  paddleAdjustmentId?: string;
  amountCents: number;
  reason?: string;
  status?: string;
}): Promise<void> {
  const values = {
    projectId: input.projectId,
    paddleAdjustmentId: input.paddleAdjustmentId,
    amountCents: input.amountCents,
    reason: input.reason,
    status: input.status ?? 'pending_approval',
  };
  if (!hasDatabase()) {
    store.insert('refunds', values);
    return;
  }
  await db.insert(refunds).values(values);
}

export async function updateRefundStatus(paddleAdjustmentId: string, status: string): Promise<void> {
  if (!hasDatabase()) {
    store.update('refunds', (r) => r.paddleAdjustmentId === paddleAdjustmentId, { status });
    return;
  }
  await db.update(refunds).set({ status }).where(eq(refunds.paddleAdjustmentId, paddleAdjustmentId));
}
