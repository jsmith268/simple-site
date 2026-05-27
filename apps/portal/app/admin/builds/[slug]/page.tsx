import Link from 'next/link';
import { loadBespokeBuild } from '../../builds-actions';
import { cardStyle, formatCents, Mono, pageStyle, StatusBadge, td, th } from '../../ui';
import { ProposeSkill } from '../propose-skill';

export const dynamic = 'force-dynamic';

const sectionH: React.CSSProperties = { fontSize: 15, fontWeight: 700, margin: '0 0 12px' };

function Swatch({ label, hex }: { label: string; hex?: string }) {
  if (!hex) return null;
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: 56, height: 40, borderRadius: 8, background: hex, border: '1px solid #e2e8f0' }} />
      <div style={{ fontSize: 10, color: '#64748b', marginTop: 3 }}>{label}</div>
      <Mono>{hex}</Mono>
    </div>
  );
}

function findingColor(sev: string): { bg: string; fg: string } {
  if (sev === 'block') return { bg: '#fee2e2', fg: '#991b1b' };
  if (sev === 'warn') return { bg: '#ffedd5', fg: '#9a3412' };
  return { bg: '#e5e7eb', fg: '#374151' };
}

export default async function BuildDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = await loadBespokeBuild(slug);

  if (!a) {
    return (
      <main style={pageStyle}>
        <Link href="/admin/builds" style={{ fontSize: 12 }}>
          ← Bespoke builds
        </Link>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Build not found</h1>
        <p style={{ fontSize: 13, color: '#64748b' }}>No build with slug {slug}.</p>
      </main>
    );
  }

  const { run, brief, design, ia, buildReport, visualReport, generatedFiles } = a;

  return (
    <main style={pageStyle}>
      <header style={{ marginBottom: 20 }}>
        <div style={{ marginBottom: 6 }}>
          <Link href="/admin/builds" style={{ fontSize: 12 }}>
            ← Bespoke builds
          </Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{slug}</h1>
          <StatusBadge status={run?.status} />
          {run?.previewUrl ? (
            <a href={run.previewUrl} target="_blank" rel="noreferrer" style={{ fontSize: 13 }}>
              {run.previewUrl.replace('https://', '')} ↗
            </a>
          ) : null}
        </div>
        {run?.escalation ? (
          <p style={{ fontSize: 13, color: '#9a3412', margin: '6px 0 0' }}>⚠ Held for human: {run.escalation}</p>
        ) : null}
      </header>

      {/* Stage trace + cost */}
      {run ? (
        <section style={{ ...cardStyle, padding: 16 }}>
          <h2 style={sectionH}>Run · {formatCents(run.costCents)}{run.costCeilingCents ? ` / ${formatCents(run.costCeilingCents)} ceiling` : ''}</h2>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {run.stages.map((s) => (
              <span key={s.name} title={s.note ?? ''} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 8px', borderRadius: 6, background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: 12 }}>
                <StatusBadge status={s.status} />
                <Mono>{s.name}</Mono>
                <span style={{ color: '#94a3b8' }}>{Math.round(s.ms / 1000)}s{s.attempts > 1 ? ` ×${s.attempts}` : ''}</span>
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {/* Design brief */}
      {brief ? (
        <section style={{ ...cardStyle, padding: 16 }}>
          <h2 style={sectionH}>Design direction</h2>
          <p style={{ fontSize: 13, color: '#334155', margin: '0 0 12px' }}>{brief.direction}</p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 12 }}>
            <Swatch label="bg" hex={brief.palette.background} />
            <Swatch label="fg" hex={brief.palette.foreground} />
            <Swatch label="primary" hex={brief.palette.primary} />
            <Swatch label="accent" hex={brief.palette.accent} />
            <Swatch label="muted" hex={brief.palette.muted} />
          </div>
          <div style={{ fontSize: 12, color: '#475569' }}>
            <div>
              <strong>Fonts:</strong>{' '}
              {design ? `${design.fonts.display.name} / ${design.fonts.accent.name} / ${design.fonts.body.name} / ${design.fonts.mono.name}` : `${brief.fonts.display} / ${brief.fonts.body}`}
            </div>
            <div style={{ marginTop: 6 }}>
              <strong>Signature devices:</strong>
              <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
                {brief.signatureDevices.map((d, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: static list
                  <li key={i} style={{ marginBottom: 2 }}>{d}</li>
                ))}
              </ul>
            </div>
            {design?.warnings?.length ? (
              <div style={{ marginTop: 8, color: '#9a3412' }}>
                <strong>Validator:</strong> {design.warnings.join(' · ')}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* IA */}
      {ia ? (
        <section style={{ ...cardStyle, padding: 16 }}>
          <h2 style={sectionH}>Information architecture · {ia.pages.length} pages</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>Page</th>
                <th style={th}>Slug</th>
                <th style={th}>Sections</th>
                <th style={th}>Components</th>
              </tr>
            </thead>
            <tbody>
              {ia.pages.map((p) => (
                <tr key={p.slug}>
                  <td style={td}>{p.name}</td>
                  <td style={td}><Mono>{p.slug}</Mono></td>
                  <td style={td}>{p.sections.length}</td>
                  <td style={{ ...td, fontSize: 11, color: '#64748b' }}>
                    {[...new Set(p.sections.flatMap((s) => s.components))].join(', ') || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      {/* Build report */}
      {buildReport ? (
        <section style={{ ...cardStyle, padding: 16 }}>
          <h2 style={sectionH}>
            Code-critic · <StatusBadge status={buildReport.ok ? 'passed' : 'failed'} />
          </h2>
          <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>
            {buildReport.attempts} build attempt(s).{buildReport.filesFixed.length ? ` Fixed: ${buildReport.filesFixed.join(', ')}.` : ' No fixes needed.'}
          </p>
          {!buildReport.ok && buildReport.errors.length ? (
            <pre style={{ fontSize: 11, background: '#0f172a', color: '#e2e8f0', padding: 12, borderRadius: 8, overflow: 'auto', marginTop: 8 }}>
              {buildReport.errors.slice(-1)[0]}
            </pre>
          ) : null}
        </section>
      ) : null}

      {/* Visual critic + learning loop */}
      <section style={{ ...cardStyle, padding: 16 }}>
        <h2 style={sectionH}>Visual critic & learning loop</h2>
        {visualReport ? (
          <>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: visualReport.score >= 80 ? '#166534' : visualReport.score >= 60 ? '#9a3412' : '#991b1b' }}>
                {visualReport.score}
              </span>
              <StatusBadge status={visualReport.verdict === 'pass' ? 'passed' : visualReport.verdict === 'reject' ? 'rejected' : 'pending'} />
              <span style={{ fontSize: 13, color: '#475569' }}>{visualReport.summary}</span>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
              {Object.entries(visualReport.dimensions).map(([k, v]) => (
                <div key={k} style={{ fontSize: 11, color: '#475569', minWidth: 96 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{k}</span>
                    <strong>{v}</strong>
                  </div>
                  <div style={{ height: 5, background: '#e2e8f0', borderRadius: 3, marginTop: 2 }}>
                    <div style={{ width: `${v}%`, height: '100%', borderRadius: 3, background: v >= 80 ? '#22c55e' : v >= 60 ? '#f59e0b' : '#ef4444' }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 14 }}>
              {visualReport.findings.map((f, i) => {
                const c = findingColor(f.severity);
                return (
                  // biome-ignore lint/suspicious/noArrayIndexKey: static list
                  <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: 12 }}>
                    <span style={{ flexShrink: 0, padding: '1px 6px', borderRadius: 5, background: c.bg, color: c.fg, fontWeight: 600, height: 'fit-content' }}>{f.severity}</span>
                    <span style={{ color: '#334155' }}>
                      <strong>{f.area}:</strong> {f.message}
                      {f.fix ? <span style={{ color: '#6366f1' }}> → {f.fix}</span> : null}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 12px' }}>
            No visual-critic report yet. Run the build with <Mono>visualCritic: true</Mono> (after a deploy) or run{' '}
            <Mono>runVisualCritic</Mono> against the preview URL.
          </p>
        )}
        <ProposeSkill slug={slug} disabled={!visualReport} />
      </section>

      {/* Generated files */}
      <section style={{ ...cardStyle, padding: 16 }}>
        <h2 style={sectionH}>Generated files · {generatedFiles.length}</h2>
        <div style={{ columnWidth: 280, fontSize: 12 }}>
          {generatedFiles.map((f) => (
            <div key={f.path} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
              <Mono>{f.path}</Mono>
              <span style={{ color: '#94a3b8' }}>{(f.bytes / 1024).toFixed(1)}k</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
