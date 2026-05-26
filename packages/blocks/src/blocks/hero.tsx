import { z } from 'zod';
import type { BlockModule } from '../types';
import { body, button, container, heading, section, t } from '../stylekit';

const Cta = z.object({ label: z.string(), href: z.string() });

export const heroSchema = z.object({
  eyebrow: z.string().optional(),
  headline: z.string(),
  subheadline: z.string().optional(),
  primaryCta: Cta.optional(),
  secondaryCta: Cta.optional(),
  imageUrl: z.string().optional(),
  imageAlt: z.string().optional(),
});
export type HeroProps = z.infer<typeof heroSchema>;

function Hero({ props, variant }: { props: HeroProps; variant: string }) {
  const split = variant === 'split' && !!props.imageUrl;
  const Ctas = (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 28 }}>
      {props.primaryCta && (
        <a href={props.primaryCta.href} style={button('primary')}>
          {props.primaryCta.label}
        </a>
      )}
      {props.secondaryCta && (
        <a href={props.secondaryCta.href} style={button('outline')}>
          {props.secondaryCta.label}
        </a>
      )}
    </div>
  );

  const Text = (
    <div style={{ maxWidth: split ? 560 : 760, marginInline: split ? 0 : 'auto' }}>
      {props.eyebrow && (
        <p
          style={{
            ...body(),
            color: t.primary,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontSize: t.textSm,
            marginBottom: 14,
          }}
        >
          {props.eyebrow}
        </p>
      )}
      <h1 style={heading(1, { textAlign: split ? 'left' : 'center', fontSize: t.text4xl })}>
        {props.headline}
      </h1>
      {props.subheadline && (
        <p
          style={{
            ...body({ fontSize: t.textLg, marginTop: 18, textAlign: split ? 'left' : 'center' }),
          }}
        >
          {props.subheadline}
        </p>
      )}
      <div style={{ display: 'flex', justifyContent: split ? 'flex-start' : 'center' }}>{Ctas}</div>
    </div>
  );

  return (
    <section style={section({ background: t.bg })}>
      <div
        style={container({
          display: split ? 'grid' : 'block',
          gridTemplateColumns: split ? '1fr 1fr' : undefined,
          gap: split ? 56 : undefined,
          alignItems: 'center',
        })}
      >
        {Text}
        {split && props.imageUrl && (
          // biome-ignore lint/a11y/useAltText: alt provided via imageAlt
          <img
            src={props.imageUrl}
            alt={props.imageAlt ?? ''}
            style={{
              width: '100%',
              height: '100%',
              maxHeight: 480,
              objectFit: 'cover',
              borderRadius: t.radiusLg,
              border: `1px solid ${t.border}`,
            }}
          />
        )}
      </div>
    </section>
  );
}

export const hero: BlockModule<HeroProps> = {
  type: 'hero',
  schema: heroSchema,
  variants: ['default', 'split'],
  Component: Hero,
  sample: (ctx) => ({
    eyebrow: ctx.category,
    headline: `${ctx.businessName} — ${ctx.tagline ?? 'work you can rely on'}`,
    subheadline: `We help our customers with ${ctx.category}. Clear information, no surprises.`,
    primaryCta: { label: 'Get in touch', href: '#contact' },
    secondaryCta: { label: 'Our services', href: '#services' },
  }),
};
