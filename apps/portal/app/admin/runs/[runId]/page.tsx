import Link from 'next/link';
import type { StepView } from '@simplesight/db';
import { loadRun } from '../../actions';
import {
  asNum,
  asStr,
  cardStyle,
  formatCents,
  formatTs,
  Mono,
  pageStyle,
  pick,
  StatusBadge,
} from '../../ui';

export const dynamic = 'force-dynamic';

export default async function RunDetailPage({
  params,
}: {
  params: Promise<{ runId: string }>;
}) {
  const { runId } = await params;
  const { run, steps, verdicts, decisions, invocations } = await loadRun(runId);

  return (
    <main style={pageStyle}>
      <nav style={{ fontSize: 12, marginBottom: 12 }}>
        <Link href="/admin">← Fleet overview</Link>
      </nav>

      <header style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Run detail</h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
          <Mono>{runId}</Mono>
        </p>
      </header>

      {/* Run summary */}
      <section style={{ ...cardStyle, padding: 16 }}>
        {run ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, fontSize: 13 }}>
            <Field label="Status">
              <StatusBadge status={run.status} />
            </Field>
            <Field label="Attempt">
              <Mono>#{run.attemptNumber}</Mono>
            </Field>
            <Field label="Cost">{formatCents(run.costCents)}</Field>
            <Field label="Started">{formatTs(run.startedAt)}</Field>
            <Field label="Finished">{formatTs(run.finishedAt)}</Field>
            <Field label="Steps">{String(steps.length)}</Field>
            <Field label="Decisions">{String(decisions.length)}</Field>
            <Field label="Invocations">{String(invocations.length)}</Field>
          </div>
        ) : (
          <p style={{ fontSize: 13, color: '#991b1b', margin: 0 }}>
            Run <Mono>{runId}</Mono> was not found.
          </p>
        )}
      </section>

      {/* Steps */}
      <h2 style={{ fontSize: 16, fontWeight: 700, margin: '8px 0 12px' }}>
        Pipeline steps ({steps.length})
      </h2>
      {steps.length === 0 ? (
        <p style={{ fontSize: 13, color: '#64748b' }}>No steps recorded for this run.</p>
      ) : (
        steps.map((step, idx) => (
          <StepCard
            key={`${step.stepName}-${idx}`}
            index={idx}
            step={step}
            decisions={decisions.filter(
              (d) => asStr(pick(d, 'stepName', 'step_name')) === step.stepName,
            )}
            invocations={invocations.filter(
              (i) => asStr(pick(i, 'stepName', 'step_name')) === step.stepName,
            )}
            verdicts={verdicts}
          />
        ))
      )}

      {/* Verdicts not bound to a step's criticVerdictId — show all so nothing is hidden */}
      {verdicts.length > 0 ? (
        <section style={{ ...cardStyle, padding: 16, marginTop: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 12px' }}>
            All critic verdicts ({verdicts.length})
          </h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {verdicts.map((v, i) => (
              <VerdictRow key={asStr(pick(v, 'id')) ?? i} verdict={v} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4, color: '#94a3b8' }}>
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{children}</div>
    </div>
  );
}

function StepCard({
  index,
  step,
  decisions,
  invocations,
  verdicts,
}: {
  index: number;
  step: StepView;
  decisions: Record<string, unknown>[];
  invocations: Record<string, unknown>[];
  verdicts: Record<string, unknown>[];
}) {
  const matchedVerdict = step.criticVerdictId
    ? verdicts.find((v) => asStr(pick(v, 'id', 'criticVerdictId')) === step.criticVerdictId)
    : undefined;

  return (
    <section style={{ ...cardStyle, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <span
          style={{
            fontFamily: 'ui-monospace, monospace',
            fontSize: 12,
            color: '#94a3b8',
            minWidth: 24,
          }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{step.stepName}</h3>
        <StatusBadge status={step.status} />
        <Mono>attempt #{step.attemptNumber}</Mono>
        {step.artifactId ? (
          <span style={{ fontSize: 12, color: '#64748b' }}>
            artifact <Mono>{step.artifactId}</Mono>
          </span>
        ) : null}
      </div>

      {step.errorMessage ? (
        <pre style={errPre}>{step.errorMessage}</pre>
      ) : null}

      {/* Supervisor decisions for this step */}
      {decisions.length > 0 ? (
        <div style={{ marginTop: 10 }}>
          <div style={subHeading}>Supervisor decisions ({decisions.length})</div>
          <div style={{ display: 'grid', gap: 6 }}>
            {decisions.map((d, i) => {
              const action = asStr(pick(d, 'action', 'decision', 'verdict', 'outcome'));
              const rationale = asStr(pick(d, 'rationale', 'reason', 'notes', 'message'));
              return (
                <div
                  key={asStr(pick(d, 'id')) ?? i}
                  style={{
                    fontSize: 12,
                    padding: '6px 10px',
                    background: '#f8fafc',
                    borderRadius: 6,
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <strong>{action ?? 'decision'}</strong>
                  {rationale ? <span style={{ color: '#475569' }}> — {rationale}</span> : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Critic verdict matched to this step */}
      {matchedVerdict ? (
        <div style={{ marginTop: 10 }}>
          <div style={subHeading}>Critic verdict</div>
          <VerdictRow verdict={matchedVerdict} />
        </div>
      ) : null}

      {/* Agent invocations (expandable) */}
      {invocations.length > 0 ? (
        <details style={{ marginTop: 12 }}>
          <summary style={{ cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#1e40af' }}>
            Agent invocations ({invocations.length}) — model calls, prompts &amp; raw output
          </summary>
          <div style={{ display: 'grid', gap: 14, marginTop: 12 }}>
            {invocations.map((inv, i) => (
              <InvocationCard key={asStr(pick(inv, 'id')) ?? i} inv={inv} />
            ))}
          </div>
        </details>
      ) : (
        <div style={{ marginTop: 10, fontSize: 12, color: '#94a3b8' }}>No agent invocations.</div>
      )}
    </section>
  );
}

function InvocationCard({ inv }: { inv: Record<string, unknown> }) {
  const model = asStr(pick(inv, 'model', 'modelId', 'model_id'));
  const mode = asStr(pick(inv, 'mode'));
  const tokensIn = asNum(pick(inv, 'tokensIn', 'tokens_in', 'inputTokens'));
  const tokensOut = asNum(pick(inv, 'tokensOut', 'tokens_out', 'outputTokens'));
  const costCents = asNum(pick(inv, 'costCents', 'cost_cents'));
  const ms = asNum(pick(inv, 'ms', 'durationMs', 'latencyMs'));
  const systemPrompt = asStr(pick(inv, 'systemPrompt', 'system_prompt'));
  const userMessage = asStr(pick(inv, 'userMessage', 'user_message'));
  const rawOutput = asStr(pick(inv, 'rawOutput', 'raw_output', 'output'));

  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 14,
          padding: '8px 12px',
          background: '#f8fafc',
          fontSize: 12,
          alignItems: 'center',
        }}
      >
        <span>
          <Mono>{model ?? 'unknown-model'}</Mono>
        </span>
        {mode ? <Meta label="mode" value={mode} /> : null}
        <Meta label="in" value={tokensIn != null ? String(tokensIn) : '—'} />
        <Meta label="out" value={tokensOut != null ? String(tokensOut) : '—'} />
        <Meta label="cost" value={formatCents(costCents)} />
        <Meta label="latency" value={ms != null ? `${ms}ms` : '—'} />
      </div>
      <div style={{ padding: '10px 12px', display: 'grid', gap: 8 }}>
        <PromptBlock label="System prompt" text={systemPrompt} />
        <PromptBlock label="User message" text={userMessage} />
        <PromptBlock label="Raw output" text={rawOutput} />
      </div>
    </div>
  );
}

function PromptBlock({ label, text }: { label: string; text?: string }) {
  return (
    <div>
      <div style={subHeading}>{label}</div>
      {text ? <pre style={codePre}>{text}</pre> : <div style={{ fontSize: 12, color: '#94a3b8' }}>—</div>}
    </div>
  );
}

function VerdictRow({ verdict }: { verdict: Record<string, unknown> }) {
  const id = asStr(pick(verdict, 'id'));
  const verdictVal = asStr(pick(verdict, 'verdict', 'status', 'result', 'passed'));
  const score = asNum(pick(verdict, 'score'));
  const feedback = asStr(pick(verdict, 'feedback', 'rationale', 'reason', 'notes', 'message'));

  return (
    <div
      style={{
        fontSize: 12,
        padding: '8px 10px',
        background: '#fffbeb',
        border: '1px solid #fde68a',
        borderRadius: 6,
      }}
    >
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        {verdictVal ? <StatusBadge status={verdictVal} /> : null}
        {score != null ? <Mono>score {score}</Mono> : null}
        {id ? (
          <span style={{ color: '#94a3b8' }}>
            <Mono>{id}</Mono>
          </span>
        ) : null}
      </div>
      {feedback ? <div style={{ marginTop: 6, color: '#475569' }}>{feedback}</div> : null}
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <span style={{ color: '#64748b' }}>
      {label}: <strong style={{ color: '#334155' }}>{value}</strong>
    </span>
  );
}

const subHeading: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: 0.4,
  color: '#64748b',
  marginBottom: 4,
};

const codePre: React.CSSProperties = {
  margin: 0,
  padding: '8px 10px',
  background: '#0f172a',
  color: '#e2e8f0',
  borderRadius: 6,
  fontSize: 11.5,
  lineHeight: 1.5,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  maxHeight: 360,
  overflow: 'auto',
};

const errPre: React.CSSProperties = {
  ...codePre,
  background: '#fef2f2',
  color: '#991b1b',
  border: '1px solid #fecaca',
  marginTop: 8,
};
