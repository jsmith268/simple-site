import { z } from 'zod';
import { body, container, heading, section, t } from '../stylekit';
import type { BlockModule } from '../types';

const Stat = z.object({
  value: z.string(),
  label: z.string(),
});

export const statsSchema = z.object({
  headline: z.string().optional(),
  items: z.array(Stat),
  tone: z.enum(['default', 'muted', 'inverted']).optional(),
});
export type StatsProps = z.infer<typeof statsSchema>;

function Stats({ props }: { props: StatsProps; variant: string }) {
  const inverted = props.tone === 'inverted';
  const headColor = inverted ? t.primaryFg : t.fg;
  const valueColor = inverted ? t.primaryFg : t.primary;
  const labelColor = inverted ? t.primaryFg : t.mutedFg;

  return (
    <section style={section(props.tone ?? 'default')}>
      <div style={container()}>
        {props.headline && (
          <h2 style={heading(2, { textAlign: 'center', marginBottom: 40, color: headColor })}>
            {props.headline}
          </h2>
        )}
        <dl
          style={{
            margin: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            // Hairline-bento: a 1px gap on a border-coloured grid renders crisp
            // dividers between cells that each paint the section background.
            gap: 1,
            background: t.border,
            border: `1px solid ${t.border}`,
            borderRadius: t.radiusLg,
            overflow: 'hidden',
          }}
        >
          {props.items.map((item) => (
            <div
              key={`${item.label}:${item.value}`}
              className="ss-card"
              style={{
                textAlign: 'center',
                padding: 32,
                background: inverted ? t.primary : t.bg,
              }}
            >
              <dt
                style={{
                  fontFamily: t.fontHeading,
                  fontWeight: t.weightHeading as unknown as number,
                  fontSize: t.text4xl,
                  lineHeight: 1.05,
                  letterSpacing: '-0.02em',
                  color: valueColor,
                }}
              >
                {item.value}
              </dt>
              <dd style={{ ...body({ marginTop: 8, color: labelColor }), marginInlineStart: 0 }}>
                {item.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export const stats: BlockModule<StatsProps> = {
  type: 'stats',
  schema: statsSchema,
  variants: ['default', 'bordered'],
  Component: Stats,
  sample: (ctx) => ({
    headline: `${ctx.businessName} by the numbers`,
    items: [
      { value: '15+', label: 'Years in business' },
      { value: '2,400', label: 'Projects completed' },
      { value: '98%', label: 'Customer satisfaction' },
      { value: '24/7', label: 'Support availability' },
    ],
  }),
};
