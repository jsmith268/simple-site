import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

/**
 * Tiny JSON-file collection store used when DATABASE_URL is absent (offline dev).
 * Repos branch on hasDatabase(): Postgres in prod, this store locally — so the
 * whole product (purchase → onboarding → build → preview) runs with no services.
 * Not concurrency-safe; dev only.
 */

function dataDir(): string {
  const dir = process.env.SIMPLESIGHT_DATA_DIR ?? join(process.cwd(), '.data');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

function file(name: string): string {
  return join(dataDir(), `${name}.json`);
}

export type Row = Record<string, any>;

export function readColl(name: string): Row[] {
  const f = file(name);
  if (!existsSync(f)) return [];
  try {
    return JSON.parse(readFileSync(f, 'utf8')) as Row[];
  } catch {
    return [];
  }
}

export function writeColl(name: string, rows: Row[]): void {
  writeFileSync(file(name), JSON.stringify(rows, null, 2));
}

export function insert<T extends Row>(name: string, row: T): T & { id: string; createdAt: string } {
  const rows = readColl(name);
  const withId = {
    id: (row.id as string) ?? randomUUID(),
    createdAt: (row.createdAt as string) ?? new Date().toISOString(),
    ...row,
  };
  rows.push(withId);
  writeColl(name, rows);
  return withId as T & { id: string; createdAt: string };
}

export function findOne(name: string, pred: (r: Row) => boolean): Row | undefined {
  return readColl(name).find(pred);
}

export function findMany(name: string, pred: (r: Row) => boolean): Row[] {
  return readColl(name).filter(pred);
}

export function update(name: string, pred: (r: Row) => boolean, patch: Row): Row | undefined {
  const rows = readColl(name);
  const idx = rows.findIndex(pred);
  if (idx === -1) return undefined;
  rows[idx] = { ...rows[idx], ...patch };
  writeColl(name, rows);
  return rows[idx];
}

export function upsert(name: string, pred: (r: Row) => boolean, row: Row): Row {
  const existing = update(name, pred, row);
  if (existing) return existing;
  return insert(name, row);
}

export function newId(): string {
  return randomUUID();
}
