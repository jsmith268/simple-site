import { z } from 'zod';
import type { BlockModule } from '../types';
import { body, card, container, heading, section, t } from '../stylekit';

const Item = z.object({
  title: z.string(),
  description: z.string(),
  icon: z.string().optional(),
});

export const servicesSchema = z.object({
  headline: z.string().optional(),
  intro: z.string().optional(),
  items: z.array(Item),
  tone: z.enum(['default', 'muted', 'inverted']).optional(),
});
export type ServicesProps = z.infer<typeof servicesSchema>;

// Clean inline line-icon set, selected by the `icon` string prop. Stroke uses
// currentColor so the tinted square's color drives the icon.
const ICON_PATHS: Record<string, string> = {
  check: 'M4 12l5 5L20 6',
  star: 'M12 3l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 18l-5.8 3 1.1-6.5L2.6 9.8l6.5-.9z',
  clock: 'M12 7v5l3 2 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  shield: 'M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z',
  leaf: 'M5 20c0-8 6-14 14-14 0 8-6 14-14 14z M5 20c4-4 8-6 12-7',
  heart: 'M12 20s-7-4.5-7-9.5A4 4 0 0 1 12 7a4 4 0 0 1 7 3.5C19 15.5 12 20 12 20z',
  tool: 'M14.5 5.5a3.5 3.5 0 0 0 4.6 4.6L21 12l-9 9-3-3 9-9-2.1-2.1A3.5 3.5 0 0 0 14.5 5.5z',
  sparkle: 'M12 3v6 M12 15v6 M3 12h6 M15 12h6 M6 6l3 3 M15 15l3 3 M18 6l-3 3 M9 15l-3 3',
};

function Icon({ name }: { name?: string }) {
  // Tasteful generic fallback when the icon name is unknown/missing.
  const d = (name && ICON_PATHS[name]) || ICON_PATHS.sparkle;
  return (
    <div
      aria-hidden="true"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 44,
        height: 44,
        flexShrink: 0,
        borderRadius: t.radiusMd,
        background: t.muted,
        color: t.primary,
      }}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={d} />
      </svg>
    </div>
  );
}

function Services({ props, variant }: { props: ServicesProps; variant: string }) {
  const list = variant === 'list';

  const Card = (item: ServicesProps['items'][number], i: number) => (
    <div
      key={i}
      className="ss-card"
      style={card({
        display: list ? 'flex' : 'block',
        gap: list ? 16 : undefined,
        alignItems: list ? 'flex-start' : undefined,
        padding: 24,
      })}
    >
      <div style={{ marginBottom: list ? 0 : 16 }}>
        <Icon name={item.icon} />
      </div>
      <div>
        <h3 style={heading(3, { fontSize: t.textLg })}>{item.title}</h3>
        <p style={body({ marginTop: 8 })}>{item.description}</p>
      </div>
    </div>
  );

  return (
    <section style={section(props.tone ?? 'default')}>
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
      { title: 'Consultation', description: 'We listen first, then scope the work so you know exactly what to expect.', icon: 'heart' },
      { title: 'Delivery', description: 'Skilled, vetted people doing the job to a standard we are happy to stand behind.', icon: 'tool' },
      { title: 'Support', description: 'Questions after the work is done? We are still here and easy to reach.', icon: 'shield' },
    ],
  }),
};
