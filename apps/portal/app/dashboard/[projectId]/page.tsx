import { loadDashboard } from '../actions';
import { ActionsBar } from './actions-bar';

// Warm, reassuring palette for a customer who just paid a lot.
const c = {
  ink: '#2b2420',
  body: '#5c5249',
  muted: '#8a7d72',
  line: '#ece4da',
  card: '#ffffff',
  page: '#faf6f1',
  accent: '#b4520f',
};

type StatusKey =
  | 'purchased'
  | 'onboarding'
  | 'queued'
  | 'building'
  | 'preview'
  | 'changes_requested'
  | 'approved'
  | 'live'
  | 'refunded'
  | 'cancelled';

const STATUS_MAP: Record<
  StatusKey,
  { label: string; blurb: string; fg: string; bg: string; dot: string }
> = {
  purchased: {
    label: 'Welcome aboard',
    blurb: 'Thanks for your purchase. Let’s get your site started.',
    fg: '#7a5a16',
    bg: '#fdf3da',
    dot: '#c8961f',
  },
  onboarding: {
    label: 'Finishing your details',
    blurb: 'Tell us about your business so we can build the perfect site.',
    fg: '#7a5a16',
    bg: '#fdf3da',
    dot: '#c8961f',
  },
  queued: {
    label: 'You’re in the queue',
    blurb: 'Your build is lined up and will start shortly.',
    fg: '#7a5a16',
    bg: '#fdf3da',
    dot: '#c8961f',
  },
  building: {
    label: 'We’re building your site',
    blurb: 'Our team is hard at work crafting your website right now.',
    fg: '#1c4f8f',
    bg: '#e6effb',
    dot: '#2f6fc0',
  },
  preview: {
    label: 'Your site is ready to preview',
    blurb: 'Take a look and let us know what you think.',
    fg: '#0f6b4f',
    bg: '#e3f6ec',
    dot: '#1f9d6e',
  },
  changes_requested: {
    label: 'Working on your changes',
    blurb: 'We received your notes and are updating your site.',
    fg: '#1c4f8f',
    bg: '#e6effb',
    dot: '#2f6fc0',
  },
  approved: {
    label: 'Approved — going live soon',
    blurb: 'Thanks for approving! We’re putting the finishing touches on go-live.',
    fg: '#0f6b4f',
    bg: '#e3f6ec',
    dot: '#1f9d6e',
  },
  live: {
    label: 'Your site is live',
    blurb: 'Congratulations — your website is published and online.',
    fg: '#0f6b4f',
    bg: '#e3f6ec',
    dot: '#1f9d6e',
  },
  refunded: {
    label: 'Refunded',
    blurb: 'This project has been refunded. Reach out if you have questions.',
    fg: '#8a7d72',
    bg: '#f1ece5',
    dot: '#b3a89c',
  },
  cancelled: {
    label: 'Cancelled',
    blurb: 'This project has been cancelled. Reach out if you’d like to restart.',
    fg: '#8a7d72',
    bg: '#f1ece5',
    dot: '#b3a89c',
  },
};

function statusInfo(status: string) {
  return (
    STATUS_MAP[status as StatusKey] ?? {
      label: status,
      blurb: 'We’ll keep you posted on your project here.',
      fg: c.muted,
      bg: '#f1ece5',
      dot: '#b3a89c',
    }
  );
}

const RUN_STATUS_LABEL: Record<string, string> = {
  pending: 'Getting started',
  running: 'In progress',
  succeeded: 'Completed',
  failed: 'Hit a snag — our team is on it',
  cancelled: 'Cancelled',
};

function formatCost(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

const shell: React.CSSProperties = {
  minHeight: '100vh',
  background: c.page,
  fontFamily: 'system-ui, -apple-system, sans-serif',
  color: c.ink,
};

const container: React.CSSProperties = {
  maxWidth: 680,
  margin: '0 auto',
  padding: '56px 24px 96px',
};

const cardStyle: React.CSSProperties = {
  background: c.card,
  border: `1px solid ${c.line}`,
  borderRadius: 16,
  padding: 28,
  marginBottom: 20,
  boxShadow: '0 1px 2px rgba(43, 36, 32, 0.04)',
};

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const data = await loadDashboard(projectId);

  if (!data.project) {
    return (
      <main style={shell}>
        <div style={{ ...container, textAlign: 'center', paddingTop: 120 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }} aria-hidden>
            🔍
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 12px' }}>
            We couldn’t find that project
          </h1>
          <p style={{ color: c.body, lineHeight: 1.6, maxWidth: 420, margin: '0 auto' }}>
            Double-check your link, or reach out to support and we’ll help you find it
            right away.
          </p>
        </div>
      </main>
    );
  }

  const { project, businessName, preview, latestRun } = data;
  const info = statusInfo(project.status);
  const showPreview =
    !!preview && ['preview', 'approved', 'live'].includes(project.status);
  const canAct = ['preview', 'changes_requested'].includes(project.status);

  return (
    <main style={shell}>
      <div style={container}>
        {/* Header */}
        <header style={{ marginBottom: 32 }}>
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: 0.4,
              textTransform: 'uppercase',
              color: c.accent,
              margin: '0 0 8px',
            }}
          >
            Your SimpleSight project
          </p>
          <h1 style={{ fontSize: 32, fontWeight: 800, margin: '0 0 16px', lineHeight: 1.15 }}>
            {businessName ?? 'Your website'}
          </h1>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 999,
              background: info.bg,
              color: info.fg,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            <span
              aria-hidden
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: info.dot,
                display: 'inline-block',
              }}
            />
            {info.label}
          </div>
          <p style={{ color: c.body, lineHeight: 1.6, margin: '14px 0 0', fontSize: 16 }}>
            {info.blurb}
          </p>
        </header>

        {/* Preview card (prominent when ready) */}
        {showPreview && preview && (
          <section
            style={{
              ...cardStyle,
              background: 'linear-gradient(135deg, #fff7ef 0%, #ffffff 70%)',
              borderColor: '#f3dcc6',
            }}
            aria-labelledby="preview-heading"
          >
            <h2
              id="preview-heading"
              style={{ fontSize: 18, fontWeight: 700, margin: '0 0 6px' }}
            >
              Your website is ready
            </h2>
            <p style={{ color: c.body, lineHeight: 1.6, margin: '0 0 18px', fontSize: 15 }}>
              Open it in a new tab to see exactly how it looks to your visitors.
            </p>
            <a
              href={preview}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                background: c.accent,
                color: '#fff',
                fontSize: 15,
                fontWeight: 700,
                padding: '12px 22px',
                borderRadius: 10,
                textDecoration: 'none',
              }}
            >
              View your website →
            </a>
            {project.username && (
              <p style={{ marginTop: 16, fontSize: 14, color: c.muted }}>
                Lives at{' '}
                <span style={{ color: c.ink, fontWeight: 600 }}>
                  {project.username}.simplesight.co
                </span>
              </p>
            )}
          </section>
        )}

        {/* Build progress / status card */}
        <section style={cardStyle} aria-labelledby="progress-heading">
          <h2
            id="progress-heading"
            style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}
          >
            Build progress
          </h2>
          {latestRun ? (
            <dl style={{ margin: 0 }}>
              <Row
                label="Latest build"
                value={RUN_STATUS_LABEL[latestRun.status] ?? latestRun.status}
              />
              {latestRun.attemptNumber > 1 && (
                <Row label="Attempt" value={`#${latestRun.attemptNumber}`} />
              )}
              <Row label="Build cost so far" value={formatCost(latestRun.costCents)} />
            </dl>
          ) : (
            <p style={{ color: c.body, lineHeight: 1.6, margin: 0, fontSize: 15 }}>
              No build has run yet. Once your site starts building, you’ll see live
              progress here.
            </p>
          )}
        </section>

        {/* Actions */}
        <ActionsBar projectId={project.id} canAct={canAct} status={project.status} />
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 16,
        padding: '8px 0',
        borderTop: `1px solid ${c.line}`,
        fontSize: 15,
      }}
    >
      <dt style={{ color: c.muted }}>{label}</dt>
      <dd style={{ margin: 0, fontWeight: 600, color: c.ink, textAlign: 'right' }}>
        {value}
      </dd>
    </div>
  );
}
