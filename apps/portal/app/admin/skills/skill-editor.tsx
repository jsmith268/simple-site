'use client';

import { useRouter } from 'next/navigation';
import { useId, useState, useTransition } from 'react';
import { resetSkillAction, saveSkillAction } from '../skills-actions';

export function SkillEditor({
  name,
  body,
  overridden,
}: {
  name: string;
  body: string;
  overridden: boolean;
}) {
  const router = useRouter();
  const textareaId = useId();
  const [draft, setDraft] = useState(body);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const dirty = draft !== body;

  function save() {
    setErr(null);
    setSaved(false);
    startTransition(async () => {
      try {
        await saveSkillAction(name, draft);
        setSaved(true);
        router.refresh();
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Save failed');
      }
    });
  }

  function revert() {
    setErr(null);
    setSaved(false);
    startTransition(async () => {
      try {
        await resetSkillAction(name);
        router.refresh();
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Revert failed');
      }
    });
  }

  return (
    <div style={{ marginTop: 12 }}>
      <label
        htmlFor={textareaId}
        style={{
          display: 'block',
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: 0.4,
          color: '#475569',
          marginBottom: 6,
        }}
      >
        Skill body
      </label>
      <textarea
        id={textareaId}
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          setSaved(false);
        }}
        spellCheck={false}
        style={{
          width: '100%',
          minHeight: 240,
          boxSizing: 'border-box',
          padding: '10px 12px',
          borderRadius: 8,
          border: '1px solid #cbd5e1',
          background: '#f8fafc',
          color: '#0f172a',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
          fontSize: 12,
          lineHeight: 1.5,
          resize: 'vertical',
        }}
      />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginTop: 10,
        }}
      >
        <button
          type="button"
          onClick={save}
          disabled={pending || !dirty}
          style={{
            padding: '6px 14px',
            borderRadius: 8,
            border: 'none',
            cursor: pending ? 'wait' : !dirty ? 'default' : 'pointer',
            fontSize: 13,
            fontWeight: 600,
            color: '#fff',
            background: '#2563eb',
            opacity: pending || !dirty ? 0.5 : 1,
          }}
        >
          {pending ? 'Saving…' : 'Save'}
        </button>
        {overridden ? (
          <button
            type="button"
            onClick={revert}
            disabled={pending}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              border: '1px solid #cbd5e1',
              background: pending ? '#f1f5f9' : '#fff',
              cursor: pending ? 'wait' : 'pointer',
              fontSize: 13,
              fontWeight: 600,
              color: '#0f172a',
            }}
          >
            Revert to default
          </button>
        ) : null}
        <span aria-live="polite" style={{ fontSize: 12, color: '#64748b' }}>
          {err ? (
            <span style={{ color: '#991b1b' }}>{err}</span>
          ) : pending ? (
            'Working…'
          ) : saved && !dirty ? (
            <span style={{ color: '#166534', fontWeight: 600 }}>Saved</span>
          ) : dirty ? (
            'Unsaved changes'
          ) : (
            ''
          )}
        </span>
      </div>
    </div>
  );
}
