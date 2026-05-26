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
});
export type StatsProps = z.infer<typeof statsSchema>;

function Stats({ props, variant }: { props: StatsProps; variant: string }) {
  const bordered = variant === 'bordered';

  return (
    <section style={section({ background: t.bg })}>
      <div style={container()}>
        {props.headline && (
          <h2 style={heading(2, { textAlign: 'center', marginBottom: 40 })}>{props.headline}</h2>
        )}
        <dl
          style={{
            margin: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: bordered ? 0 : 24,
            border: bordered ? `1px solid ${t.border}` : undefined,
            borderRadius: bordered ? t.radiusLg : undefined,
            overflow: bordered ? 'hidden' : undefined,
          }}
        >
          {props.items.map((item, i) => (
            <div
              key={`${item.label}:${item.value}`}
              style={{
                textAlign: 'center',
                padding: bordered ? 32 : '8px 16px',
                borderLeft: bordered && i > 0 ? `1px solid ${t.border}` : undefined,
              }}
            >
              <dt
                style={{
                  fontFamily: t.fontHeading,
                  fontWeight: t.weightHeading as unknown as number,
                  fontSize: t.text4xl,
                  lineHeight: 1.05,
                  letterSpacing: '-0.02em',
                  color: t.primary,
                }}
              >
                {item.value}
              </dt>
              <dd style={{ ...body({ marginTop: 8 }), marginInlineStart: 0 }}>{item.label}</dd>
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
