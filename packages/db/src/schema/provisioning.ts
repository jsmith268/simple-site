import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  integer,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { sites } from './core';

const now = () => timestamp('created_at', { withTimezone: true }).defaultNow().notNull();

export const deployments = pgTable(
  'deployments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    siteId: uuid('site_id')
      .notNull()
      .references(() => sites.id, { onDelete: 'cascade' }),
    vercelProjectId: text('vercel_project_id'),
    vercelDeploymentId: text('vercel_deployment_id'),
    deployUrl: text('deploy_url'),
    readyState: text('ready_state'), // QUEUED | BUILDING | READY | ERROR
    isProduction: boolean('is_production').notNull().default(false),
    createdAt: now(),
  },
  (t) => ({ bySite: index('deployments_site_idx').on(t.siteId) }),
);

export const domains = pgTable('domains', {
  id: uuid('id').primaryKey().defaultRandom(),
  siteId: uuid('site_id')
    .notNull()
    .references(() => sites.id, { onDelete: 'cascade' }),
  domain: text('domain').notNull(),
  type: text('type').notNull().default('subdomain'), // subdomain | custom
  verified: boolean('verified').notNull().default(false),
  verification: jsonb('verification'), // required A/CNAME/TXT records to show the customer
  sslStatus: text('ssl_status'),
  attachedAt: timestamp('attached_at', { withTimezone: true }),
  createdAt: now(),
});

export const connectionSteps = pgTable(
  'connection_steps',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    siteId: uuid('site_id')
      .notNull()
      .references(() => sites.id, { onDelete: 'cascade' }),
    stepName: text('step_name').notNull(),
    status: text('status').notNull().default('pending'),
    attemptNumber: integer('attempt_number').notNull().default(1),
    metadata: jsonb('metadata'),
    errorMessage: text('error_message'),
    createdAt: now(),
  },
  (t) => ({
    siteStepUq: uniqueIndex('connection_site_step_uq').on(t.siteId, t.stepName, t.attemptNumber),
  }),
);
