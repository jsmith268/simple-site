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
