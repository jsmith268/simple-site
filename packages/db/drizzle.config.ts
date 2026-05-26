import type { Config } from 'drizzle-kit';

// drizzle-kit doesn't auto-load .env; pull DATABASE_URL from repo root.
if (!process.env.DATABASE_URL) {
  try {
    process.loadEnvFile(new URL('../../.env', import.meta.url));
  } catch {
    /* .env missing — drizzle-kit will surface the empty-url error */
  }
}

export default {
  schema: './src/schema/index.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL ?? '' },
  verbose: true,
  strict: true,
} satisfies Config;
