'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { retriggerBuildAction } from './actions';

export function RebuildButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function rebuild() {
    setErr(null);
    startTransition(async () => {
      try {
        await retriggerBuildAction(projectId);
        router.refresh();
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Rebuild failed');
      }
    });
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <button
        type="button"
        onClick={rebuild}
        disabled={pending}
        aria-label={`Rebuild project ${projectId}`}
        style={{
          padding: '4px 10px',
          borderRadius: 6,
          border: '1px solid #cbd5e1',
          background: pending ? '#f1f5f9' : '#fff',
          cursor: pending ? 'wait' : 'pointer',
          fontSize: 12,
          fontWeight: 600,
          color: '#0f172a',
        }}
      >
        {pending ? 'Rebuilding…' : 'Rebuild'}
      </button>
      {err ? <span style={{ fontSize: 11, color: '#991b1b' }}>{err}</span> : null}
    </span>
  );
}
