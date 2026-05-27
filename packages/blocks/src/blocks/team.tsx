import { z } from 'zod';
import { body, card, container, heading, section, t } from '../stylekit';
import type { BlockModule } from '../types';

const Member = z.object({
  name: z.string(),
  role: z.string(),
  photoUrl: z.string().optional(),
  photoAlt: z.string().optional(),
  bio: z.string().optional(),
});

export const teamSchema = z.object({
  headline: z.string().optional(),
  intro: z.string().optional(),
  members: z.array(Member),
  tone: z.enum(['default', 'muted', 'inverted']).optional(),
});
export type TeamProps = z.infer<typeof teamSchema>;

function Photo({ url, alt, size }: { url?: string; alt: string; size: number }) {
  const shared = {
    width: size,
    height: size,
    borderRadius: '50%',
    flexShrink: 0,
  } as const;
  if (url) {
    return (
      <img
        src={url}
        alt={alt}
        style={{ ...shared, objectFit: 'cover', border: `1px solid ${t.border}`, boxShadow: t.shadowSm }}
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      style={{ ...shared, background: t.muted, border: `1px solid ${t.border}` }}
    />
  );
}

function Team({ props, variant }: { props: TeamProps; variant: string }) {
  const list = variant === 'list';
  const inverted = props.tone === 'inverted';
  const headColor = inverted ? t.primaryFg : t.fg;
  const introColor = inverted ? t.primaryFg : t.mutedFg;
  // On non-card grid the name sits on the section bg; on a card it sits on t.card.
  const nameColor = list ? (inverted ? t.primaryFg : t.fg) : t.cardFg;
  const bioColor = list ? introColor : t.mutedFg;

  return (
    <section style={section(props.tone ?? 'default')}>
      <div style={container()}>
        {(props.headline || props.intro) && (
          <div
            style={{ maxWidth: 640, marginInline: 'auto', textAlign: 'center', marginBottom: 44 }}
          >
            {props.headline && <h2 style={heading(2, { color: headColor })}>{props.headline}</h2>}
            {props.intro && (
              <p style={body({ fontSize: t.textLg, marginTop: 16, color: introColor })}>{props.intro}</p>
            )}
          </div>
        )}
        <div
          style={{
            display: list ? 'flex' : 'grid',
            flexDirection: list ? 'column' : undefined,
            gridTemplateColumns: list ? undefined : 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: list ? 28 : 32,
          }}
        >
          {props.members.map((m) => {
            const layout = {
              display: 'flex',
              flexDirection: (list ? 'row' : 'column') as 'row' | 'column',
              alignItems: list ? 'flex-start' : 'center',
              textAlign: (list ? 'left' : 'center') as 'left' | 'center',
              gap: list ? 20 : 16,
            };
            return (
              <div
                key={`${m.name}:${m.role}`}
                style={list ? layout : card({ ...layout, padding: 28 })}
              >
                <Photo url={m.photoUrl} alt={m.photoAlt ?? m.name} size={list ? 72 : 120} />
                <div>
                  <div style={{ fontFamily: t.fontHeading, fontWeight: 600, color: nameColor }}>
                    {m.name}
                  </div>
                  <div style={{ ...body({ fontSize: t.textSm, marginTop: 2 }), color: t.primary }}>
                    {m.role}
                  </div>
                  {m.bio && <p style={body({ marginTop: 10, color: bioColor })}>{m.bio}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export const team: BlockModule<TeamProps> = {
  type: 'team',
  schema: teamSchema,
  variants: ['grid', 'list'],
  Component: Team,
  sample: (ctx) => ({
    headline: 'Meet the team',
    intro: `The people behind ${ctx.businessName}.`,
    members: [
      {
        name: 'Alex Morgan',
        role: 'Founder & Lead',
        bio: `Started ${ctx.businessName} to bring honest, dependable ${ctx.category} to the area.`,
      },
      {
        name: 'Sam Carter',
        role: 'Operations Manager',
        bio: 'Keeps every project on schedule and on budget.',
      },
      {
        name: 'Jordan Lee',
        role: 'Customer Success',
        bio: 'Your first point of contact for anything you need.',
      },
    ],
  }),
};
