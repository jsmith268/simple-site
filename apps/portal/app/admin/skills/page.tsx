import Link from 'next/link';
import { loadSkills } from '../skills-actions';
import { cardStyle, Mono, pageStyle } from '../ui';
import { SkillEditor } from './skill-editor';

export const dynamic = 'force-dynamic';

export default async function SkillsPage() {
  const skills = await loadSkills();

  return (
    <main style={pageStyle}>
      <header style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 6 }}>
          <Link href="/admin" style={{ fontSize: 12 }}>
            ← Fleet overview
          </Link>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Skills — agent expertise</h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
          View and edit the expertise the generation agents apply. Edits override the built-in
          defaults fleet-wide.
        </p>
      </header>

      {skills.length === 0 ? (
        <section style={{ ...cardStyle, padding: 16 }}>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>No skills registered.</p>
        </section>
      ) : (
        skills.map((skill) => (
          <section key={skill.name} style={{ ...cardStyle, padding: 16 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                flexWrap: 'wrap',
                gap: 10,
              }}
            >
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
                <Mono>{skill.name}</Mono>
              </h2>
              <KindBadge kind={skill.kind} />
              {skill.overridden ? <EditedBadge /> : null}
            </div>

            <p style={{ fontSize: 13, color: '#475569', margin: '8px 0 0' }}>{skill.summary}</p>

            <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: 0.4,
                  color: '#94a3b8',
                  marginRight: 8,
                }}
              >
                Applies to
              </span>
              {skill.appliesTo.length ? (
                skill.appliesTo.map((agent, i) => (
                  <span key={agent}>
                    {i > 0 ? ', ' : ''}
                    <Mono>{agent}</Mono>
                  </span>
                ))
              ) : (
                <span style={{ color: '#94a3b8' }}>—</span>
              )}
            </div>

            <SkillEditor name={skill.name} body={skill.body} overridden={skill.overridden} />
          </section>
        ))
      )}
    </main>
  );
}

function KindBadge({ kind }: { kind: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 600,
        lineHeight: 1.4,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
        background: '#e0e7ff',
        color: '#3730a3',
        whiteSpace: 'nowrap',
      }}
    >
      {kind}
    </span>
  );
}

function EditedBadge() {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 600,
        lineHeight: 1.4,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
        background: '#fef9c3',
        color: '#854d0e',
        whiteSpace: 'nowrap',
      }}
    >
      Edited
    </span>
  );
}
