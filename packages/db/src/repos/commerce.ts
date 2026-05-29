import { hasDatabase } from '@simplesight/env';
import { eq } from 'drizzle-orm';
import { db } from '../client';
import { customers, payments, projects } from '../schema/core';
import * as store from '../offline-store';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export interface PurchaseInput {
  email: string;
  stripeCustomerId?: string;
  paymentIntentId?: string;
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
 * Stripe webhook on checkout.session.completed (or the offline instant-purchase).
 */
export async function createPurchasedProject(input: PurchaseInput): Promise<{ projectId: string; customerId: string }> {
  const refundDeadline = new Date(Date.now() + THIRTY_DAYS_MS);

  if (!hasDatabase()) {
    let customer = store.findOne('customers', (c) => c.email === input.email);
    if (!customer) {
      customer = store.insert('customers', { email: input.email, stripeCustomerId: input.stripeCustomerId });
    }
    const project = store.insert('projects', {
      customerId: customer.id,
      username: null,
      status: 'purchased',
      buildFeePaidAt: new Date().toISOString(),
      refundDeadlineAt: refundDeadline.toISOString(),
    });
    store.insert('payments', {
      projectId: project.id,
      stripePaymentIntentId: input.paymentIntentId,
      amountCents: input.amountCents,
      kind: 'build_fee',
    });
    return { projectId: project.id, customerId: customer.id };
  }

  const existing = await db.select().from(customers).where(eq(customers.email, input.email)).limit(1);
  let customerId = existing[0]?.id;
  if (!customerId) {
    const inserted = await db
      .insert(customers)
      .values({ email: input.email, stripeCustomerId: input.stripeCustomerId })
      .returning({ id: customers.id });
    customerId = inserted[0]?.id as string;
  }
  const proj = await db
    .insert(projects)
    .values({
      customerId,
      status: 'purchased',
      buildFeePaidAt: new Date(),
      refundDeadlineAt: refundDeadline,
    })
    .returning({ id: projects.id });
  const projectId = proj[0]?.id as string;
  await db.insert(payments).values({
    projectId,
    stripePaymentIntentId: input.paymentIntentId,
    amountCents: input.amountCents,
    kind: 'build_fee',
  });
  return { projectId, customerId };
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
