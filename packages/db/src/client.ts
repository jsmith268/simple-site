import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index';

// Lazy DB client — defers connection until first query so builds stay green
// when DATABASE_URL is configured per-environment (Vercel) or absent (offline).

let _client: ReturnType<typeof postgres> | null = null;
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

function ensureDb() {
  if (_db) return _db;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. Set it in .env / Vercel env, or run in offline mode (no DB).',
    );
  }
  _client = postgres(url, { prepare: false });
  _db = drizzle(_client, { schema });
  return _db;
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_t, prop, recv) {
    const real = ensureDb();
    const value = Reflect.get(real, prop, recv);
    return typeof value === 'function' ? value.bind(real) : value;
  },
});

export type DB = ReturnType<typeof drizzle<typeof schema>>;
