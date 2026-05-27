import { z } from 'zod';
import { body, card, container, heading, section, t } from '../stylekit';
import type { BlockModule } from '../types';

const HoursRow = z.object({ days: z.string(), open: z.string(), close: z.string() });

export const hoursSchema = z.object({
  headline: z.string().optional(),
  rows: z.array(HoursRow),
  note: z.string().optional(),
  tone: z.enum(['default', 'muted', 'inverted']).optional(),
});
export type HoursProps = z.infer<typeof hoursSchema>;

function Hours({ props, variant }: { props: HoursProps; variant: string }) {
  const carded = variant === 'card';
  const inverted = props.tone === 'inverted';
  const headColor = inverted ? t.primaryFg : t.fg;
  const bodyColor = inverted ? t.primaryFg : t.mutedFg;

  // Inside the card the surface is t.card, so default text colors apply.
  const cellHead = carded ? t.fg : headColor;
  const cellBody = carded ? t.mutedFg : bodyColor;

  const Table = (
    <table
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontFamily: t.fontBody,
      }}
    >
      <caption
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          overflow: 'hidden',
          clip: 'rect(0 0 0 0)',
        }}
      >
        Business hours
      </caption>
      <thead>
        <tr>
          <th
            scope="col"
            style={{
              ...body({ fontSize: t.textSm }),
              color: cellHead,
              fontWeight: 600,
              textAlign: 'left',
              paddingBottom: 12,
            }}
          >
            Days
          </th>
          <th
            scope="col"
            style={{
              ...body({ fontSize: t.textSm }),
              color: cellHead,
              fontWeight: 600,
              textAlign: 'right',
              paddingBottom: 12,
            }}
          >
            Hours
          </th>
        </tr>
      </thead>
      <tbody>
        {props.rows.map((row, i) => (
          <tr key={`${row.days}-${i}`} style={{ borderTop: `1px solid ${t.border}` }}>
            <th
              scope="row"
              style={{
                ...body(),
                color: cellHead,
                fontWeight: 500,
                textAlign: 'left',
                paddingBlock: 14,
              }}
            >
              {row.days}
            </th>
            <td style={{ ...body({ color: cellBody }), textAlign: 'right', paddingBlock: 14 }}>
              {row.open} – {row.close}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <section id="hours" style={section(props.tone ?? 'default')}>
      <div style={container()}>
        <div style={{ maxWidth: 560, marginInline: 'auto', textAlign: 'center', marginBottom: 36 }}>
          <h2 style={heading(2, { color: headColor })}>{props.headline ?? 'Opening hours'}</h2>
        </div>
        <div
          style={{
            maxWidth: 560,
            marginInline: 'auto',
            ...(carded
              ? card({ padding: 'clamp(20px, 4vw, 36px)' })
              : {}),
          }}
        >
          {Table}
          {props.note && (
            <p style={body({ fontSize: t.textSm, marginTop: 20, textAlign: 'center', color: carded ? t.mutedFg : bodyColor })}>
              {props.note}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export const hours: BlockModule<HoursProps> = {
  type: 'hours',
  schema: hoursSchema,
  variants: ['default', 'card'],
  Component: Hours,
  sample: () => ({
    headline: 'Opening hours',
    rows: [
      { days: 'Monday – Friday', open: '8:00 AM', close: '6:00 PM' },
      { days: 'Saturday', open: '9:00 AM', close: '2:00 PM' },
      { days: 'Sunday', open: 'Closed', close: 'Closed' },
    ],
    note: 'Holiday hours may vary. Call ahead to confirm.',
  }),
};
