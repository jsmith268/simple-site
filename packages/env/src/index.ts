import { z } from 'zod';

/**
 * Offline mode is the default whenever the AI/DB keys are absent, or when forced
 * via SIMPLESIGHT_OFFLINE=1. In offline mode every agent returns deterministic
 * mocks and no external service is contacted — the whole product runs locally.
 */
export function isOffline(): boolean {
  if (process.env.SIMPLESIGHT_OFFLINE === '1') return true;
  if (process.env.SIMPLESIGHT_OFFLINE === '0') return false;
  // Auto: offline if we have neither a gateway key nor a direct provider key.
  const hasAi =
    !!process.env.AI_GATEWAY_API_KEY ||
    !!process.env.VERCEL_OIDC_TOKEN ||
    !!process.env.ANTHROPIC_API_KEY ||
    !!process.env.OPENAI_API_KEY;
  return !hasAi;
}

export function hasDatabase(): boolean {
  return !!process.env.DATABASE_URL;
}

const ServerEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  ROOT_DOMAIN: z.string().default('simplesight.localhost'),
  DATABASE_URL: z.string().optional(),
  AI_GATEWAY_API_KEY: z.string().optional(),
  VERCEL_OIDC_TOKEN: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  VERCEL_API_TOKEN: z.string().optional(),
  VERCEL_TEAM_ID: z.string().optional(),
  VERCEL_RENDERER_PROJECT_ID: z.string().optional(),
  FIRECRAWL_API_KEY: z.string().optional(),
  EXA_API_KEY: z.string().optional(),
  UNSPLASH_ACCESS_KEY: z.string().optional(),
  PEXELS_API_KEY: z.string().optional(),
  CRON_SECRET: z.string().optional(),
});

export type ServerEnv = z.infer<typeof ServerEnvSchema>;

let _env: ServerEnv | null = null;

/** Parse + cache the server environment. Never throws on missing optional keys. */
export function serverEnv(): ServerEnv {
  if (_env) return _env;
  _env = ServerEnvSchema.parse(process.env);
  return _env;
}

export function rootDomain(): string {
  return process.env.ROOT_DOMAIN ?? process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'simplesight.localhost';
}

/**
 * Fail fast on incoherent production configuration. Call this at process start
 * (e.g. instrumentation). The dangerous case is "live but no DB": agents would
 * run real LLM calls while every repo silently writes to an ephemeral JSON store
 * that vanishes between serverless invocations.
 */
export function assertLiveConfig(): void {
  if (isOffline()) return; // offline is internally coherent (deterministic + JSON store)
  const problems: string[] = [];
  if (!hasDatabase()) {
    problems.push(
      'Running in LIVE mode (an AI key is set) but DATABASE_URL is missing. ' +
        'Set DATABASE_URL (Neon pooled URL) or force SIMPLESIGHT_OFFLINE=1.',
    );
  }
  if (process.env.PADDLE_API_KEY && !process.env.PADDLE_WEBHOOK_SECRET) {
    problems.push('PADDLE_API_KEY is set but PADDLE_WEBHOOK_SECRET is missing.');
  }
  if (problems.length) {
    throw new Error(`Invalid live configuration:\n  - ${problems.join('\n  - ')}`);
  }
}

/** True when DATABASE_URL is set but offline is forced — a likely misconfig worth warning. */
export function dbWithoutLiveMode(): boolean {
  return hasDatabase() && process.env.SIMPLESIGHT_OFFLINE === '1';
}
