import { z } from 'zod';
import { body, container, heading, section, t } from '../stylekit';
import type { BlockModule } from '../types';

const Testimonial = z.object({
  quote: z.string(),
  author: z.string(),
  role: z.string().optional(),
  avatarUrl: z.string().optional(),
});

export const testimonialsSchema = z.object({
  headline: z.string().optional(),
  items: z.array(Testimonial),
});
export type TestimonialsProps = z.infer<typeof testimonialsSchema>;

function Avatar({ url, name }: { url?: string; name: string }) {
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          objectFit: 'cover',
          border: `1px solid ${t.border}`,
        }}
      />
    );
  }
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div
      aria-hidden="true"
      style={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        background: t.muted,
        color: t.mutedFg,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: t.fontHeading,
        fontWeight: 600,
        fontSize: t.textSm,
        border: `1px solid ${t.border}`,
      }}
    >
      {initials}
    </div>
  );
}

function Card({ item }: { item: TestimonialsProps['items'][number] }) {
  return (
    <figure
      style={{
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        background: t.card,
        color: t.cardFg,
        border: `1px solid ${t.border}`,
        borderRadius: t.radiusLg,
        padding: 28,
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      <blockquote style={{ ...body({ color: t.cardFg, fontSize: t.textLg }), flex: 1 }}>
        “{item.quote}”
      </blockquote>
      <figcaption style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Avatar url={item.avatarUrl} name={item.author} />
        <div>
          <div style={{ fontFamily: t.fontHeading, fontWeight: 600, color: t.fg }}>
            {item.author}
          </div>
          {item.role && <div style={body({ fontSize: t.textSm })}>{item.role}</div>}
        </div>
      </figcaption>
    </figure>
  );
}

function Testimonials({ props, variant }: { props: TestimonialsProps; variant: string }) {
  const single = variant === 'single';

  return (
    <section style={section({ background: t.bg })}>
      <div style={container()}>
        {props.headline && (
          <h2 style={heading(2, { textAlign: 'center', marginBottom: 40 })}>{props.headline}</h2>
        )}
        <div
          style={{
            display: single ? 'flex' : 'grid',
            flexDirection: single ? 'column' : undefined,
            alignItems: single ? 'center' : undefined,
            gridTemplateColumns: single ? undefined : 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
            maxWidth: single ? 720 : undefined,
            marginInline: single ? 'auto' : undefined,
          }}
        >
          {props.items.map((item) => (
            <Card key={`${item.author}:${item.quote.slice(0, 24)}`} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

export const testimonials: BlockModule<TestimonialsProps> = {
  type: 'testimonials',
  schema: testimonialsSchema,
  variants: ['grid', 'single'],
  Component: Testimonials,
  sample: (ctx) => ({
    headline: `What our customers say about ${ctx.businessName}`,
    items: [
      {
        quote: `Working with ${ctx.businessName} was straightforward from start to finish. They did exactly what they said they would.`,
        author: 'Dana Whitfield',
        role: 'Operations Lead',
      },
      {
        quote: `Reliable, professional, and easy to reach. We trust them with all our ${ctx.category} work now.`,
        author: 'Marcus Reilly',
        role: 'Owner, Reilly & Co.',
      },
      {
        quote: 'Clear pricing and no surprises. Exactly what we were looking for.',
        author: 'Priya Nair',
        role: 'Facilities Manager',
      },
    ],
  }),
};
