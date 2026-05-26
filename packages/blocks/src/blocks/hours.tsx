import { z } from 'zod';
import { body, container, heading, section, t } from '../stylekit';
import type { BlockModule } from '../types';

const HoursRow = z.object({ days: z.string(), open: z.string(), close: z.string() });

export const hoursSchema = z.object({
  headline: z.string().optional(),
  rows: z.array(HoursRow),
  note: z.string().optional(),
});
export type HoursProps = z.infer<typeof hoursSchema>;

function Hours({ props, variant }: { props: HoursProps; variant: string }) {
  const card = variant === 'card';

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
              color: t.fg,
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
              color: t.fg,
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
                color: t.fg,
                fontWeight: 500,
                textAlign: 'left',
                paddingBlock: 14,
              }}
            >
              {row.days}
            </th>
            <td style={{ ...body(), textAlign: 'right', paddingBlock: 14 }}>
              {row.open} – {row.close}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <section id="hours" style={section({ background: t.bg })}>
      <div style={container()}>
        <div style={{ maxWidth: 560, marginInline: 'auto', textAlign: 'center', marginBottom: 36 }}>
          <h2 style={heading(2)}>{props.headline ?? 'Opening hours'}</h2>
        </div>
        <div
          style={{
            maxWidth: 560,
            marginInline: 'auto',
            ...(card
              ? {
                  background: t.card,
                  border: `1px solid ${t.border}`,
                  borderRadius: t.radiusLg,
                  padding: 'clamp(20px, 4vw, 36px)',
                }
              : {}),
          }}
        >
          {Table}
          {props.note && (
            <p style={body({ fontSize: t.textSm, marginTop: 20, textAlign: 'center' })}>
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
