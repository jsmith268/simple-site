'use client';

import { useState, useTransition } from 'react';
import { applySkillProposalAction, proposeSkillFromBuildAction } from '../builds-actions';

interface Proposal {
  name: string;
  summary: string;
  body: string;
  rationale: string;
}

export function ProposeSkill({ slug, disabled }: { slug: string; disabled?: boolean }) {
  const [pending, start] = useTransition();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  const btn: React.CSSProperties = {
    padding: '8px 14px',
    borderRadius: 8,
    border: '1px solid #6366f1',
    background: '#6366f1',
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    cursor: pending ? 'wait' : 'pointer',
  };

  return (
    <div>
      {!proposal ? (
        <button
          type="button"
          style={{ ...btn, opacity: disabled || pending ? 0.6 : 1 }}
          disabled={disabled || pending}
          onClick={() =>
            start(async () => {
              setError(null);
              const res = await proposeSkillFromBuildAction(slug);
              if (res.ok && res.proposal) {
                setProposal(res.proposal);
                setBody(res.proposal.body);
              } else {
                setError(res.error ?? 'Failed to propose a skill update.');
              }
            })
          }
        >
          {pending ? 'Thinking…' : 'Propose skill update from findings'}
        </button>
      ) : (
        <div style={{ border: '1px solid #c7d2fe', borderRadius: 10, background: '#eef2ff', padding: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>
            Proposed: <code>{proposal.name}</code>
          </div>
          <div style={{ fontSize: 12, color: '#475569', marginBottom: 8 }}>{proposal.summary}</div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={12}
            style={{
              width: '100%',
              fontFamily: 'ui-monospace, monospace',
              fontSize: 12,
              padding: 10,
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              boxSizing: 'border-box',
            }}
          />
          <p style={{ fontSize: 12, color: '#6366f1', margin: '6px 0' }}>
            <strong>Why:</strong> {proposal.rationale}
          </p>
          {applied ? (
            <div style={{ fontSize: 13, fontWeight: 600, color: '#166534' }}>
              ✓ Applied fleet-wide — every future build now injects this.
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                style={btn}
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    await applySkillProposalAction(proposal.name, body);
                    setApplied(true);
                  })
                }
              >
                {pending ? 'Applying…' : 'Apply fleet-wide'}
              </button>
              <button
                type="button"
                style={{ ...btn, background: '#fff', color: '#475569', border: '1px solid #cbd5e1' }}
                onClick={() => setProposal(null)}
              >
                Discard
              </button>
            </div>
          )}
        </div>
      )}
      {error ? <p style={{ fontSize: 12, color: '#991b1b', marginTop: 8 }}>{error}</p> : null}
    </div>
  );
}
