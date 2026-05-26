import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

const now = () => timestamp('created_at', { withTimezone: true }).defaultNow().notNull();

// ── Customers & commerce ──────────────────────────────────────────────────

export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkUserId: text('clerk_user_id').unique(),
  email: text('email').notNull(),
  stripeCustomerId: text('stripe_customer_id'),
  createdAt: now(),
});

export const projects = pgTable(
  'projects',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    customerId: uuid('customer_id')
      .notNull()
      .references(() => customers.id, { onDelete: 'cascade' }),
    // Reserves username.simplesight.co (assigned during onboarding, null until then)
    username: text('username'),
    status: text('status').notNull().default('purchased'),
    buildFeePaidAt: timestamp('build_fee_paid_at', { withTimezone: true }),
    refundDeadlineAt: timestamp('refund_deadline_at', { withTimezone: true }),
    approvedAt: timestamp('approved_at', { withTimezone: true }),
    createdAt: now(),
  },
  (t) => ({
    usernameUq: uniqueIndex('projects_username_uq').on(t.username),
    byCustomer: index('projects_customer_idx').on(t.customerId),
  }),
);

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .notNull()
    .references(() => projects.id, { onDelete: 'cascade' }),
  stripeSubscriptionId: text('stripe_subscription_id'),
  plan: text('plan'), // 'monthly' | 'annual'
  status: text('status'), // stripe subscription status
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }),
  createdAt: now(),
});

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  amountCents: integer('amount_cents').notNull(),
  kind: text('kind').notNull(), // 'build_fee' | 'hosting'
  createdAt: now(),
});

export const refunds = pgTable('refunds', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
  stripeRefundId: text('stripe_refund_id'),
  amountCents: integer('amount_cents').notNull(),
  reason: text('reason'),
  createdAt: now(),
});

// ── Intake & assets ───────────────────────────────────────────────────────

export const intakes = pgTable('intakes', {
  projectId: uuid('project_id')
    .primaryKey()
    .references(() => projects.id, { onDelete: 'cascade' }),
  style: jsonb('style'), // IntakeStyle
  business: jsonb('business'), // BusinessInfo
  referenceUrls: jsonb('reference_urls'),
  crawledContext: jsonb('crawled_context'),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const assets = pgTable(
  'assets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    kind: text('kind').notNull(), // 'photo' | 'logo'
    alt: text('alt'),
    width: integer('width'),
    height: integer('height'),
    dominantColor: text('dominant_color'),
    source: text('source').notNull().default('upload'), // upload | crawl | stock
    createdAt: now(),
  },
  (t) => ({ byProject: index('assets_project_idx').on(t.projectId) }),
);

// ── Site definition (the generated artifact, as data) ───────────────────────

export const sites = pgTable(
  'sites',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    status: text('status').notNull().default('draft'), // draft | staged | published
    brand: jsonb('brand'), // Brand
    theme: jsonb('theme'), // ThemeTokens
    nav: jsonb('nav'), // NavItem[]
    seo: jsonb('seo'),
    previewUsername: text('preview_username'),
    liveDomain: text('live_domain'),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    createdAt: now(),
  },
  (t) => ({ byProject: index('sites_project_idx').on(t.projectId) }),
);

export const pages = pgTable(
  'pages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    siteId: uuid('site_id')
      .notNull()
      .references(() => sites.id, { onDelete: 'cascade' }),
    slug: text('slug').notNull().default(''), // '' = home
    title: text('title').notNull(),
    seo: jsonb('seo'),
    order: integer('order').notNull().default(0),
  },
  (t) => ({ siteSlugUq: uniqueIndex('pages_site_slug_uq').on(t.siteId, t.slug) }),
);

export const pageBlocks = pgTable(
  'page_blocks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    pageId: uuid('page_id')
      .notNull()
      .references(() => pages.id, { onDelete: 'cascade' }),
    blockType: text('block_type').notNull(),
    variant: text('variant').notNull().default('default'),
    props: jsonb('props').notNull(), // validated against the block's zod schema
    order: integer('order').notNull().default(0),
  },
  (t) => ({ byPage: index('page_blocks_page_idx').on(t.pageId) }),
);
