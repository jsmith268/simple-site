import Link from 'next/link';
import { listBespokeBuilds } from '../builds-actions';
import { cardStyle, formatCents, formatTs, Mono, pageStyle, StatusBadge, td, th } from '../ui';

export const dynamic = 'force-dynamic';

function scoreColor(score?: number): string {
  if (score == null) return '#94a3b8';
  if (score >= 80) return '#166534';
  if (score >= 60) return '#9a3412';
  return '#991b1b';
}

export default async function BuildsPage() {
  const builds = await listBespokeBuilds();

  return (
    <main style={pageStyle}>
      <header style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 6 }}>
          <Link href="/admin" style={{ fontSize: 12 }}>
            ← Fleet overview
          </Link>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Bespoke builds</h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
          Every generated site, its design direction, build + visual-critic results, and cost. Click a row to inspect
          the brief, IA, files, and findings — and feed the learning loop.
        </p>
      </header>

      {builds.length === 0 ? (
        <section style={{ ...cardStyle, padding: 16 }}>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
            No builds found under <Mono>{process.env.BESPOKE_BUILDS_ROOT ?? '~/Projects'}</Mono>. Run{' '}
            <Mono>runBespokeBuild()</Mono> (it writes <Mono>.simplesight/run.json</Mono> per build), or set{' '}
            <Mono>BESPOKE_BUILDS_ROOT</Mono>.
          </p>
        </section>
      ) : (
        <section style={{ ...cardStyle, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>Site</th>
                <th style={th}>Status</th>
                <th style={th}>Direction</th>
                <th style={th}>Pages</th>
                <th style={th}>Files</th>
                <th style={th}>Visual</th>
                <th style={th}>Cost</th>
                <th style={th}>Updated</th>
              </tr>
            </thead>
            <tbody>
              {builds.map((b) => (
                <tr key={b.slug}>
                  <td style={td}>
                    <Link href={`/admin/builds/${b.slug}`} style={{ fontWeight: 600 }}>
                      {b.slug}
                    </Link>
                    {b.previewUrl ? (
                      <div style={{ marginTop: 2 }}>
                        <a href={b.previewUrl} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: '#2563eb' }}>
                          {b.previewUrl.replace('https://', '')}
                        </a>
                      </div>
                    ) : null}
                  </td>
                  <td style={td}>
                    <StatusBadge status={b.status} />
                    {b.escalation ? <div style={{ fontSize: 11, color: '#9a3412', marginTop: 3 }}>{b.escalation}</div> : null}
                  </td>
                  <td style={{ ...td, fontSize: 12, color: '#475569', maxWidth: 240 }}>{b.direction ?? '—'}</td>
                  <td style={td}>{b.pages || '—'}</td>
                  <td style={td}>{b.files || '—'}</td>
                  <td style={td}>
                    {b.visualScore != null ? (
                      <span style={{ fontWeight: 700, color: scoreColor(b.visualScore) }}>
                        {b.visualScore}
                        <span style={{ fontSize: 11, fontWeight: 500, color: '#94a3b8' }}> {b.visualVerdict}</span>
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td style={td}>{formatCents(b.costCents)}</td>
                  <td style={{ ...td, fontSize: 12, color: '#64748b' }}>{formatTs(b.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </main>
  );
}
