import { z } from 'zod';
import type { BlockModule } from '../types';
import { body, button, card, container, heading, section, t } from '../stylekit';

const Cta = z.object({ label: z.string(), href: z.string() });

const Tier = z.object({
  name: z.string(),
  price: z.string(),
  period: z.string().optional(),
  features: z.array(z.string()),
  cta: Cta.optional(),
  highlighted: z.boolean().optional(),
});

export const pricingSchema = z.object({
  headline: z.string().optional(),
  intro: z.string().optional(),
  tiers: z.array(Tier),
  tone: z.enum(['default', 'muted', 'inverted']).optional(),
});
export type PricingProps = z.infer<typeof pricingSchema>;

function Pricing({ props }: { props: PricingProps; variant: string }) {
  const headColor = props.tone === 'inverted' ? t.primaryFg : t.fg;
  const introColor = props.tone === 'inverted' ? t.primaryFg : t.mutedFg;
  return (
    <section style={section(props.tone ?? 'default')}>
      <div style={container()}>
        {(props.headline || props.intro) && (
          <div style={{ maxWidth: 720, marginInline: 'auto', textAlign: 'center', marginBottom: 44 }}>
            {props.headline && <h2 style={heading(2, { color: headColor })}>{props.headline}</h2>}
            {props.intro && (
              <p style={body({ fontSize: t.textLg, marginTop: 16, color: introColor })}>{props.intro}</p>
            )}
          </div>
        )}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 24,
            alignItems: 'start',
          }}
        >
          {props.tiers.map((tier, i) => (
            <div
              key={i}
              style={card({
                display: 'flex',
                flexDirection: 'column',
                border: `${tier.highlighted ? 2 : 1}px solid ${tier.highlighted ? t.accent : t.border}`,
                boxShadow: tier.highlighted ? t.shadowLg : t.shadowSm,
                padding: 28,
              })}
            >
              {tier.highlighted && (
                <span
                  style={{
                    ...body({
                      color: t.accent,
                      fontWeight: 600,
                      fontSize: t.textSm,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                    }),
                    marginBottom: 12,
                  }}
                >
                  Most popular
                </span>
              )}
              <h3 style={heading(3, { fontSize: t.textLg })}>{tier.name}</h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 14 }}>
                <span
                  style={{
                    fontFamily: t.fontHeading,
                    fontWeight: t.weightHeading as unknown as number,
                    fontSize: t.text3xl,
                    lineHeight: 1.1,
                    letterSpacing: '-0.02em',
                    color: t.fg,
                  }}
                >
                  {tier.price}
                </span>
                {tier.period && <span style={body({ fontSize: t.textSm })}>{tier.period}</span>}
              </div>
              <ul style={{ listStyle: 'none', margin: '22px 0 0', padding: 0, display: 'grid', gap: 12 }}>
                {tier.features.map((feature, j) => (
                  <li
                    key={j}
                    style={{ ...body(), display: 'flex', gap: 10, alignItems: 'flex-start' }}
                  >
                    <span aria-hidden="true" style={{ color: t.primary, fontWeight: 700 }}>
                      ✓
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              {tier.cta && (
                <a
                  href={tier.cta.href}
                  style={{ ...button(tier.highlighted ? 'primary' : 'outline'), marginTop: 28, width: '100%' }}
                >
                  {tier.cta.label}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export const pricing: BlockModule<PricingProps> = {
  type: 'pricing',
  schema: pricingSchema,
  variants: ['default'],
  Component: Pricing,
  sample: (ctx) => ({
    headline: 'Simple, honest pricing',
    intro: `Clear options for ${ctx.category}. No hidden fees, no surprises.`,
    tiers: [
      {
        name: 'Basic',
        price: '$249',
        period: 'one-time',
        features: ['Initial consultation', 'Standard turnaround', 'Email support'],
        cta: { label: 'Get started', href: '#contact' },
      },
      {
        name: 'Standard',
        price: '$499',
        period: 'one-time',
        features: ['Everything in Basic', 'Priority scheduling', 'Phone & email support', 'Written guarantee'],
        cta: { label: 'Get started', href: '#contact' },
        highlighted: true,
      },
      {
        name: 'Premium',
        price: '$899',
        period: 'one-time',
        features: ['Everything in Standard', 'Dedicated project lead', 'Extended warranty', 'On-call support'],
        cta: { label: 'Contact us', href: '#contact' },
      },
    ],
  }),
};
