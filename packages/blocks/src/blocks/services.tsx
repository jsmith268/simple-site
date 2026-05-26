import { z } from 'zod';
import type { BlockModule } from '../types';
import { body, container, heading, section, t } from '../stylekit';

const Item = z.object({
  title: z.string(),
  description: z.string(),
  icon: z.string().optional(),
});

export const servicesSchema = z.object({
  headline: z.string().optional(),
  intro: z.string().optional(),
  items: z.array(Item),
});
export type ServicesProps = z.infer<typeof servicesSchema>;

function Services({ props, variant }: { props: ServicesProps; variant: string }) {
  const list = variant === 'list';

  const Card = (item: ServicesProps['items'][number], i: number) => (
    <div
      key={i}
      style={{
        display: list ? 'flex' : 'block',
        gap: list ? 16 : undefined,
        alignItems: list ? 'flex-start' : undefined,
        background: t.card,
        color: t.cardFg,
        border: `1px solid ${t.border}`,
        borderRadius: t.radiusMd,
        padding: 24,
      }}
    >
      {item.icon && (
        <div
          aria-hidden="true"
          style={{
            fontSize: t.textXl,
            lineHeight: 1,
            marginBottom: list ? 0 : 14,
            flexShrink: 0,
          }}
        >
          {item.icon}
        </div>
      )}
      <div>
        <h3 style={heading(3, { fontSize: t.textLg })}>{item.title}</h3>
        <p style={body({ marginTop: 8 })}>{item.description}</p>
      </div>
    </div>
  );

  return (
    <section style={section({ background: t.bg })}>
      <div style={container()}>
        {(props.headline || props.intro) && (
          <div style={{ maxWidth: 720, marginInline: 'auto', textAlign: 'center', marginBottom: 44 }}>
            {props.headline && <h2 style={heading(2)}>{props.headline}</h2>}
            {props.intro && <p style={body({ fontSize: t.textLg, marginTop: 16 })}>{props.intro}</p>}
          </div>
        )}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: list ? '1fr' : 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 20,
            maxWidth: list ? 760 : undefined,
            marginInline: list ? 'auto' : undefined,
          }}
        >
          {props.items.map(Card)}
        </div>
      </div>
    </section>
  );
}

export const services: BlockModule<ServicesProps> = {
  type: 'services',
  schema: servicesSchema,
  variants: ['grid', 'list'],
  Component: Services,
  sample: (ctx) => ({
    headline: 'What we do',
    intro: `Everything you need from a ${ctx.category} partner, under one roof.`,
    items: [
      { title: 'Consultation', description: 'We listen first, then scope the work so you know exactly what to expect.', icon: '💬' },
      { title: 'Delivery', description: 'Skilled, vetted people doing the job to a standard we are happy to stand behind.', icon: '🔧' },
      { title: 'Support', description: 'Questions after the work is done? We are still here and easy to reach.', icon: '🤝' },
    ],
  }),
};
