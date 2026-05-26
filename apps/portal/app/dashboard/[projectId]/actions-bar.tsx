'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { approveProjectAction, requestChangesAction } from '../actions';

const c = {
  ink: '#2b2420',
  body: '#5c5249',
  muted: '#8a7d72',
  line: '#ece4da',
  card: '#ffffff',
  accent: '#b4520f',
  accentSoft: '#fbeee2',
  success: '#0f6b4f',
  error: '#b3261e',
};

const cardStyle: React.CSSProperties = {
  background: c.card,
  border: `1px solid ${c.line}`,
  borderRadius: 16,
  padding: 28,
  marginBottom: 20,
  boxShadow: '0 1px 2px rgba(43, 36, 32, 0.04)',
};

const buttonBase: React.CSSProperties = {
  padding: '12px 22px',
  borderRadius: 10,
  fontSize: 15,
  fontWeight: 700,
  cursor: 'pointer',
  border: '1px solid transparent',
  fontFamily: 'inherit',
};

export function ActionsBar({
  projectId,
  canAct,
  status,
}: {
  projectId: string;
  canAct: boolean;
  status: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<'approve' | 'changes' | null>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!canAct) {
    return null;
  }

  const canApprove = status === 'preview' || status === 'changes_requested';

  function handleApprove() {
    setError(null);
    setPendingAction('approve');
    startTransition(async () => {
      try {
        await approveProjectAction(projectId);
        router.refresh();
      } catch {
        setError('Something went wrong approving your site. Please try again.');
      } finally {
        setPendingAction(null);
      }
    });
  }

  function handleRequestChanges() {
    setError(null);
    setPendingAction('changes');
    startTransition(async () => {
      try {
        await requestChangesAction(projectId, notes.trim() || undefined);
        setShowNotes(false);
        setNotes('');
        router.refresh();
      } catch {
        setError('Something went wrong sending your changes. Please try again.');
      } finally {
        setPendingAction(null);
      }
    });
  }

  return (
    <section style={cardStyle} aria-labelledby="actions-heading">
      <h2 id="actions-heading" style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px' }}>
        Happy with your site?
      </h2>
      <p style={{ color: c.body, lineHeight: 1.6, margin: '0 0 20px', fontSize: 15 }}>
        Approve it to go live, or tell us what you’d like changed and we’ll get right on
        it.
      </p>

      {showNotes && (
        <div style={{ marginBottom: 18 }}>
          <label
            htmlFor="change-notes"
            style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 600,
              color: c.ink,
              marginBottom: 6,
            }}
          >
            What would you like changed? <span style={{ color: c.muted }}>(optional)</span>
          </label>
          <textarea
            id="change-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Make the header darker, swap the hero photo, update the phone number…"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              minHeight: 96,
              resize: 'vertical',
              padding: '12px 14px',
              border: `1px solid ${c.line}`,
              borderRadius: 10,
              fontSize: 15,
              fontFamily: 'inherit',
              color: c.ink,
              background: '#fff',
            }}
          />
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <button
          type="button"
          onClick={handleApprove}
          disabled={!canApprove || isPending}
          aria-busy={pendingAction === 'approve'}
          style={{
            ...buttonBase,
            background: canApprove && !isPending ? c.success : '#cfd8d2',
            color: '#fff',
            cursor: canApprove && !isPending ? 'pointer' : 'not-allowed',
          }}
        >
          {pendingAction === 'approve' ? 'Approving…' : 'Approve & continue'}
        </button>

        {showNotes ? (
          <>
            <button
              type="button"
              onClick={handleRequestChanges}
              disabled={isPending}
              aria-busy={pendingAction === 'changes'}
              style={{
                ...buttonBase,
                background: c.accent,
                color: '#fff',
                opacity: isPending ? 0.7 : 1,
                cursor: isPending ? 'not-allowed' : 'pointer',
              }}
            >
              {pendingAction === 'changes' ? 'Sending…' : 'Send my changes'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowNotes(false);
                setError(null);
              }}
              disabled={isPending}
              style={{
                ...buttonBase,
                background: '#fff',
                color: c.body,
                border: `1px solid ${c.line}`,
              }}
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setShowNotes(true)}
            disabled={isPending}
            style={{
              ...buttonBase,
              background: c.accentSoft,
              color: c.accent,
              border: `1px solid #f3dcc6`,
            }}
          >
            Request changes
          </button>
        )}
      </div>

      {error && (
        <p role="alert" style={{ color: c.error, fontSize: 14, margin: '16px 0 0' }}>
          {error}
        </p>
      )}
    </section>
  );
}
