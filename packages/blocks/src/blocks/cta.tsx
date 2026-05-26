import { z } from 'zod';
import { body, button, container, heading, section, t } from '../stylekit';
import type { BlockModule } from '../types';

const CtaLink = z.object({ label: z.string(), href: z.string() });

export const ctaSchema = z.object({
  headline: z.string(),
  subtext: z.string().optional(),
  primaryCta: CtaLink,
  secondaryCta: CtaLink.optional(),
});
export type CtaProps = z.infer<typeof ctaSchema>;

function Cta({ props, variant }: { props: CtaProps; variant: string }) {
  const boxed = variant === 'boxed';

  const Inner = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 16,
        ...(boxed
          ? {
              background: t.accent,
              borderRadius: t.radiusLg,
              padding: 'clamp(32px, 6vw, 64px)',
            }
          : {}),
      }}
    >
      <h2 style={heading(2, { maxWidth: 720 })}>{props.headline}</h2>
      {props.subtext && <p style={body({ fontSize: t.textLg, maxWidth: 640 })}>{props.subtext}</p>}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          justifyContent: 'center',
          marginTop: 8,
        }}
      >
        <a href={props.primaryCta.href} style={button('primary')}>
          {props.primaryCta.label}
        </a>
        {props.secondaryCta && (
          <a href={props.secondaryCta.href} style={button('outline')}>
            {props.secondaryCta.label}
          </a>
        )}
      </div>
    </div>
  );

  return (
    <section style={section({ background: t.bg })}>
      <div style={container()}>{Inner}</div>
    </section>
  );
}

export const cta: BlockModule<CtaProps> = {
  type: 'cta',
  schema: ctaSchema,
  variants: ['default', 'boxed'],
  Component: Cta,
  sample: (ctx) => ({
    headline: `Ready to work with ${ctx.businessName}?`,
    subtext: `Get in touch today and see why customers trust us for ${ctx.category}.`,
    primaryCta: { label: 'Get a quote', href: '#contact' },
    secondaryCta: { label: 'Learn more', href: '#about' },
  }),
};
