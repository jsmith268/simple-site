import { index, integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { projects } from './core';

const now = () => timestamp('created_at', { withTimezone: true }).defaultNow().notNull();

// ── Build variants (the dual-model compare flow) ───────────────────────────

export const buildVariants = pgTable(
  'build_variants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    round: integer('round').notNull().default(1),
    slot: text('slot').notNull(), // 'A' | 'B'
    studioLabel: text('studio_label').notNull(),
    model: text('model').notNull(),
    status: text('status').notNull().default('queued'),
    previewUrl: text('preview_url'),
    thumbnailUrl: text('thumbnail_url'),
    runId: text('run_id'),
    buildDir: text('build_dir'),
    designScore: integer('design_score'),
    contentScore: integer('content_score'),
    summary: text('summary'),
    costCents: integer('cost_cents').notNull().default(0),
    error: text('error'),
    // Renderable SiteSpec for block-mode/offline previews (null for deployed bespoke apps).
    spec: jsonb('spec'),
    createdAt: now(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({ byProject: index('build_variants_project_idx').on(t.projectId) }),
);

// ── Generation state (per project) ─────────────────────────────────────────

export const generationState = pgTable('generation_state', {
  projectId: uuid('project_id')
    .primaryKey()
    .references(() => projects.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('idle'),
  currentRound: integer('current_round').notNull().default(0),
  maxRounds: integer('max_rounds').notNull().default(5),
  selectedVariantId: uuid('selected_variant_id'),
  revisionCount: integer('revision_count').notNull().default(0),
  maxRevisions: integer('max_revisions').notNull().default(5),
  feedback: jsonb('feedback'), // RegenFeedback[] history
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── Revision checklist (the refinement workspace) ──────────────────────────

export const revisionItems = pgTable(
  'revision_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    variantId: uuid('variant_id').notNull(),
    revision: integer('revision').notNull().default(0),
    pageSlug: text('page_slug').notNull(),
    pageName: text('page_name'),
    viewport: text('viewport').notNull().default('desktop'),
    comment: text('comment').notNull(),
    category: text('category'),
    status: text('status').notNull().default('open'),
    createdAt: now(),
  },
  (t) => ({ byVariant: index('revision_items_variant_idx').on(t.variantId) }),
);

export const revisionChecklists = pgTable(
  'revision_checklists',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    variantId: uuid('variant_id').notNull(),
    revision: integer('revision').notNull(),
    items: jsonb('items'),
    summary: text('summary'),
    status: text('status').notNull().default('draft'),
    createdAt: now(),
  },
  (t) => ({ byProject: index('revision_checklists_project_idx').on(t.projectId) }),
);
