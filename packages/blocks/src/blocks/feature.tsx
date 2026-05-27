import { z } from 'zod';
import { body, button, card, container, eyebrow, heading, section, t } from '../stylekit';
import type { BlockModule } from '../types';

const Cta = z.object({ label: z.string(), href: z.string() });

export const featureSchema = z.object({
  eyebrow: z.string().optional(),
  headline: z.string(),
  body: z.string(),
  bullets: z.array(z.string()).optional(),
  imageUrl: z.string().optional(),
  imageAlt: z.string().optional(),
  cta: Cta.optional(),
  tone: z.enum(['default', 'muted', 'inverted']).optional(),
});
export type FeatureProps = z.infer<typeof featureSchema>;

function Feature({ props, variant }: { props: FeatureProps; variant: string }) {
  const hasImage = !!props.imageUrl;
  const reverse = variant === 'reverse';
  const inverted = props.tone === 'inverted';
  const headColor = inverted ? t.primaryFg : t.fg;
  const bodyColor = inverted ? t.primaryFg : t.mutedFg;
  const accentColor = inverted ? t.primaryFg : t.primary;

  const Image = hasImage && (
    // biome-ignore lint/a11y/useAltText: alt provided via imageAlt
    <img
      src={props.imageUrl}
      alt={props.imageAlt ?? ''}
      style={{
        width: '100%',
        height: '100%',
        maxHeight: 460,
        aspectRatio: '4 / 3',
        objectFit: 'cover',
        borderRadius: t.radiusLg,
        border: `1px solid ${t.border}`,
        boxShadow: t.shadowMd,
      }}
    />
  );

  const Text = (
    <div style={{ maxWidth: hasImage ? 560 : 760, marginInline: hasImage ? 0 : 'auto' }}>
      {props.eyebrow && (
        <p
          className="ss-eyebrow"
          style={eyebrow({
            color: accentColor,
            fontSize: t.textSm,
            marginBottom: 14,
          })}
        >
          {props.eyebrow}
        </p>
      )}
      <h2 style={heading(2, { textAlign: hasImage ? 'left' : 'center', color: headColor })}>
        {props.headline}
      </h2>
      <p
        style={body({
          fontSize: t.textLg,
          marginTop: 18,
          textAlign: hasImage ? 'left' : 'center',
          color: bodyColor,
        })}
      >
        {props.body}
      </p>
      {props.bullets && props.bullets.length > 0 && (
        <ul
          className="ss-card"
          style={card({
            listStyle: 'none',
            margin: '24px 0 0',
            padding: 20,
            display: 'grid',
            gap: 12,
          })}
        >
          {props.bullets.map((bullet, i) => (
            <li
              key={i}
              style={{
                ...body({ color: bodyColor }),
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
                justifyContent: hasImage ? 'flex-start' : 'center',
              }}
            >
              <span aria-hidden="true" style={{ color: accentColor, fontWeight: 700 }}>
                ✓
              </span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      )}
      {props.cta && (
        <div
          style={{
            display: 'flex',
            justifyContent: hasImage ? 'flex-start' : 'center',
            marginTop: 28,
          }}
        >
          <a href={props.cta.href} className="ss-cta" style={button('primary')}>
            {props.cta.label}
          </a>
        </div>
      )}
    </div>
  );

  return (
    <section style={section(props.tone ?? 'default')}>
      <div
        style={container({
          display: hasImage ? 'grid' : 'block',
          gridTemplateColumns: hasImage ? '1fr 1fr' : undefined,
          gap: hasImage ? 56 : undefined,
          alignItems: 'center',
        })}
      >
        {hasImage && reverse && Image}
        {Text}
        {hasImage && !reverse && Image}
      </div>
    </section>
  );
}

export const feature: BlockModule<FeatureProps> = {
  type: 'feature',
  schema: featureSchema,
  variants: ['default', 'reverse'],
  Component: Feature,
  sample: (ctx) => ({
    eyebrow: 'Why us',
    headline: `Built for ${ctx.category} done right`,
    body: `${ctx.businessName} pairs experienced people with a no-shortcuts process, so the result holds up long after we leave.`,
    bullets: [
      'Upfront, itemised quotes',
      'Work guaranteed in writing',
      'Local team you can actually reach',
    ],
    cta: { label: 'Get a quote', href: '#contact' },
  }),
};
