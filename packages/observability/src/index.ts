type Level = 'debug' | 'info' | 'warn' | 'error';
const ORDER: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };

function threshold(): number {
  return ORDER[(process.env.LOG_LEVEL as Level) ?? 'info'] ?? 20;
}

const SECRET_KEYS = /token|secret|key|password|authorization/i;
function redact(meta: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(meta)) {
    out[k] = SECRET_KEYS.test(k) ? '[redacted]' : v;
  }
  return out;
}

function emit(level: Level, msg: string, meta?: Record<string, unknown>) {
  if (ORDER[level] < threshold()) return;
  const line = { t: new Date().toISOString(), level, msg, ...(meta ? redact(meta) : {}) };
  // Single-line JSON — friendly to Vercel log drains.
  const sink = level === 'error' || level === 'warn' ? console.error : console.log;
  sink(JSON.stringify(line));
}

export const logger = {
  debug: (msg: string, meta?: Record<string, unknown>) => emit('debug', msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) => emit('info', msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => emit('warn', msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => emit('error', msg, meta),
  child: (bound: Record<string, unknown>) => ({
    debug: (msg: string, meta?: Record<string, unknown>) => emit('debug', msg, { ...bound, ...meta }),
    info: (msg: string, meta?: Record<string, unknown>) => emit('info', msg, { ...bound, ...meta }),
    warn: (msg: string, meta?: Record<string, unknown>) => emit('warn', msg, { ...bound, ...meta }),
    error: (msg: string, meta?: Record<string, unknown>) => emit('error', msg, { ...bound, ...meta }),
  }),
};

export function captureException(err: unknown, context?: Record<string, unknown>) {
  const e = err instanceof Error ? { name: err.name, message: err.message, stack: err.stack } : { err };
  emit('error', 'exception', { ...e, ...context });
}

export interface Trace {
  end(extra?: Record<string, unknown>): number;
}

/** Start a timed span. `end()` logs the duration and returns elapsed ms. */
export function startTrace(name: string, meta?: Record<string, unknown>): Trace {
  const start = Date.now();
  emit('debug', `trace.start ${name}`, meta);
  return {
    end(extra) {
      const ms = Date.now() - start;
      emit('debug', `trace.end ${name}`, { ms, ...extra });
      return ms;
    },
  };
}

export { sendEmail, isEmailLive, email, type EmailInput } from './notify';
