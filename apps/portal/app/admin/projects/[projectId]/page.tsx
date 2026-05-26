import Link from 'next/link';
import { loadProjectRuns } from '../../actions';
import {
  cardStyle,
  formatCents,
  formatTs,
  Mono,
  pageStyle,
  StatusBadge,
  td,
  th,
} from '../../ui';

export const dynamic = 'force-dynamic';

export default async function ProjectRunsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const runs = await loadProjectRuns(projectId);

  return (
    <main style={pageStyle}>
      <nav style={{ fontSize: 12, marginBottom: 12 }}>
        <Link href="/admin">← Fleet overview</Link>
      </nav>
      <header style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Project runs</h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
          <Mono>{projectId}</Mono> · {runs.length} run{runs.length === 1 ? '' : 's'}
        </p>
      </header>

      <section style={cardStyle}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>Run</th>
                <th style={th}>Attempt</th>
                <th style={th}>Status</th>
                <th style={th}>Cost</th>
                <th style={th}>Started</th>
                <th style={th}>Finished</th>
              </tr>
            </thead>
            <tbody>
              {runs.length === 0 ? (
                <tr>
                  <td style={td} colSpan={6}>
                    <span style={{ color: '#64748b' }}>No runs for this project yet.</span>
                  </td>
                </tr>
              ) : (
                runs.map((run) => (
                  <tr key={run.id}>
                    <td style={td}>
                      <Link href={`/admin/runs/${run.id}`}>
                        <Mono>{run.id}</Mono>
                      </Link>
                    </td>
                    <td style={td}>
                      <Mono>#{run.attemptNumber}</Mono>
                    </td>
                    <td style={td}>
                      <StatusBadge status={run.status} />
                    </td>
                    <td style={td}>{formatCents(run.costCents)}</td>
                    <td style={td}>{formatTs(run.startedAt)}</td>
                    <td style={td}>{formatTs(run.finishedAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
