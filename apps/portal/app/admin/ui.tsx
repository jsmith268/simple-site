// Shared presentational helpers for the operator console. Server-safe (no hooks).

const STATUS_COLORS: Record<string, { bg: string; fg: string }> = {
  // run / step statuses
  succeeded: { bg: '#dcfce7', fg: '#166534' },
  completed: { bg: '#dcfce7', fg: '#166534' },
  passed: { bg: '#dcfce7', fg: '#166534' },
  published: { bg: '#dcfce7', fg: '#166534' },
  running: { bg: '#dbeafe', fg: '#1e40af' },
  in_progress: { bg: '#dbeafe', fg: '#1e40af' },
  queued: { bg: '#e0e7ff', fg: '#3730a3' },
  pending: { bg: '#fef9c3', fg: '#854d0e' },
  building: { bg: '#dbeafe', fg: '#1e40af' },
  purchased: { bg: '#f3e8ff', fg: '#6b21a8' },
  failed: { bg: '#fee2e2', fg: '#991b1b' },
  errored: { bg: '#fee2e2', fg: '#991b1b' },
  error: { bg: '#fee2e2', fg: '#991b1b' },
  rejected: { bg: '#fee2e2', fg: '#991b1b' },
  blocked: { bg: '#fee2e2', fg: '#991b1b' },
  escalated: { bg: '#ffedd5', fg: '#9a3412' },
  skipped: { bg: '#e5e7eb', fg: '#374151' },
};

export function StatusBadge({ status }: { status?: string | null }) {
  const key = (status ?? 'unknown').toLowerCase();
  const c = STATUS_COLORS[key] ?? { bg: '#e5e7eb', fg: '#374151' };
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 600,
        lineHeight: 1.4,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
        background: c.bg,
        color: c.fg,
        whiteSpace: 'nowrap',
      }}
    >
      {status ?? 'unknown'}
    </span>
  );
}

export function Mono({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <code
      title={title}
      style={{
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
        fontSize: 12,
        color: '#334155',
      }}
    >
      {children}
    </code>
  );
}

export function formatCents(cents?: number | null): string {
  if (cents == null) return '—';
  return `$${(cents / 100).toFixed(2)}`;
}

export function formatTs(ts?: string | null): string {
  if (!ts) return '—';
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return String(ts);
  return d.toLocaleString();
}

// Shared style constants for dense, operator-grade tables.
export const td: React.CSSProperties = {
  padding: '8px 12px',
  borderBottom: '1px solid #e5e7eb',
  fontSize: 13,
  verticalAlign: 'top',
};
export const th: React.CSSProperties = {
  padding: '8px 12px',
  borderBottom: '2px solid #cbd5e1',
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: 0.4,
  color: '#475569',
  textAlign: 'left',
};

export const pageStyle: React.CSSProperties = {
  maxWidth: 1200,
  margin: '0 auto',
  padding: '24px 28px 80px',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  color: '#0f172a',
};

export const cardStyle: React.CSSProperties = {
  border: '1px solid #e2e8f0',
  borderRadius: 10,
  background: '#fff',
  marginBottom: 20,
};

/** Pull a value out of a loosely-typed record under any of several keys. */
export function pick(row: Record<string, unknown>, ...keys: string[]): unknown {
  for (const k of keys) {
    if (row[k] != null) return row[k];
  }
  return undefined;
}

export function asStr(v: unknown): string | undefined {
  if (v == null) return undefined;
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

export function asNum(v: unknown): number | undefined {
  if (typeof v === 'number') return v;
  if (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v))) return Number(v);
  return undefined;
}
