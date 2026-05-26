import Link from 'next/link';
import { loadFleet } from './actions';
import { KillSwitch } from './kill-switch';
import { RebuildButton } from './rebuild-button';
import {
  asStr,
  cardStyle,
  formatCents,
  Mono,
  pageStyle,
  pick,
  StatusBadge,
  td,
  th,
} from './ui';

export const dynamic = 'force-dynamic';

export default async function FleetOverviewPage() {
  const { projects, fleet, escalations } = await loadFleet();

  const totalCostCents = projects.reduce(
    (sum, p) => sum + (p.latestRun?.costCents ?? 0),
    0,
  );

  return (
    <main style={pageStyle}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>SimpleSight · Fleet overview</h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
          Operator console — every project, run, and autonomous build control.
        </p>
      </header>

      {/* Fleet controls / summary */}
      <section style={{ ...cardStyle, padding: 16 }}>
        <KillSwitch engaged={fleet.killSwitchEngaged} />
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 24,
            marginTop: 16,
            fontSize: 13,
          }}
        >
          <Stat label="Projects" value={String(projects.length)} />
          <Stat label="Autonomous mode" value={fleet.autonomousMode} />
          <Stat label="Daily budget ceiling" value={formatCents(fleet.dailyBudgetCeilingCents)} />
          <Stat label="Latest-run spend" value={formatCents(totalCostCents)} />
          <Stat label="Open escalations" value={String(escalations.length)} />
        </div>
      </section>

      {/* Escalations */}
      <section style={{ ...cardStyle, padding: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 12px' }}>
          Open escalations{' '}
          <span style={{ color: escalations.length ? '#9a3412' : '#64748b' }}>
            ({escalations.length})
          </span>
        </h2>
        {escalations.length === 0 ? (
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
            No open escalations. The fleet is operating without operator intervention.
          </p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 8 }}>
            {escalations.map((e, i) => {
              const id = asStr(pick(e, 'id'));
              const projectId = asStr(pick(e, 'projectId', 'project_id'));
              const reason = asStr(pick(e, 'reason', 'message', 'kind', 'type'));
              const createdAt = asStr(pick(e, 'createdAt', 'created_at'));
              return (
                <li key={id ?? i} style={{ fontSize: 13 }}>
                  <span style={{ fontWeight: 600 }}>{reason ?? 'Escalation'}</span>{' '}
                  {projectId ? (
                    <Link href={`/admin/projects/${projectId}`}>
                      <Mono>{projectId}</Mono>
                    </Link>
                  ) : null}
                  {createdAt ? (
                    <span style={{ color: '#94a3b8', marginLeft: 8 }}>{createdAt}</span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Projects table */}
      <section style={cardStyle}>
        <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, padding: '14px 16px 4px' }}>
          Projects
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>Username</th>
                <th style={th}>Project</th>
                <th style={th}>Status</th>
                <th style={th}>Latest run</th>
                <th style={th}>Run cost</th>
                <th style={th}># Runs</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr>
                  <td style={td} colSpan={7}>
                    <span style={{ color: '#64748b' }}>No projects yet.</span>
                  </td>
                </tr>
              ) : (
                projects.map(({ project, latestRun, runCount }) => (
                  <tr key={project.id}>
                    <td style={td}>{project.username ?? '—'}</td>
                    <td style={td}>
                      <Mono title={project.id}>{project.id}</Mono>
                    </td>
                    <td style={td}>
                      <StatusBadge status={project.status} />
                    </td>
                    <td style={td}>
                      {latestRun ? (
                        <Link
                          href={`/admin/runs/${latestRun.id}`}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                        >
                          <StatusBadge status={latestRun.status} />
                          <Mono>#{latestRun.attemptNumber}</Mono>
                        </Link>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>no runs</span>
                      )}
                    </td>
                    <td style={td}>{formatCents(latestRun?.costCents)}</td>
                    <td style={td}>{runCount}</td>
                    <td style={td}>
                      <span style={{ display: 'inline-flex', gap: 10, alignItems: 'center' }}>
                        <Link href={`/admin/projects/${project.id}`} style={{ fontSize: 12 }}>
                          View runs
                        </Link>
                        <RebuildButton projectId={project.id} />
                      </span>
                    </td>
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4, color: '#94a3b8' }}>
        {label}
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>{value}</div>
    </div>
  );
}
