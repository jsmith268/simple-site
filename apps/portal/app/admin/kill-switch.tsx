'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toggleKillSwitchAction } from './actions';

export function KillSwitch({ engaged }: { engaged: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      await toggleKillSwitchAction(!engaged);
      router.refresh();
    });
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '14px 18px',
        borderRadius: 10,
        border: `1px solid ${engaged ? '#fca5a5' : '#e2e8f0'}`,
        background: engaged ? '#fef2f2' : '#f8fafc',
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Fleet kill switch</div>
        <div style={{ fontSize: 12, color: engaged ? '#991b1b' : '#64748b' }}>
          {engaged
            ? 'ENGAGED — autonomous builds are halted fleet-wide.'
            : 'Disengaged — autonomous builds may run.'}
        </div>
      </div>
      <span
        aria-live="polite"
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: 0.4,
          color: engaged ? '#991b1b' : '#166534',
        }}
      >
        {engaged ? 'Halted' : 'Live'}
      </span>
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-pressed={engaged}
        aria-label={engaged ? 'Disengage fleet kill switch' : 'Engage fleet kill switch'}
        style={{
          padding: '8px 16px',
          borderRadius: 8,
          border: 'none',
          cursor: pending ? 'wait' : 'pointer',
          fontSize: 13,
          fontWeight: 600,
          color: '#fff',
          background: engaged ? '#16a34a' : '#dc2626',
          opacity: pending ? 0.6 : 1,
        }}
      >
        {pending ? 'Working…' : engaged ? 'Disengage' : 'Engage kill switch'}
      </button>
    </div>
  );
}
