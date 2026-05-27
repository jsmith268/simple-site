import { z } from 'zod';
import type { BlockModule } from '../types';
import { body, container, heading, section, t } from '../stylekit';

const Stat = z.object({ value: z.string(), label: z.string() });

export const aboutSchema = z.object({
  headline: z.string(),
  /** One or more paragraphs of body copy. */
  body: z.union([z.string(), z.array(z.string())]),
  imageUrl: z.string().optional(),
  imageAlt: z.string().optional(),
  stats: z.array(Stat).optional(),
  tone: z.enum(['default', 'muted', 'inverted']).optional(),
});
export type AboutProps = z.infer<typeof aboutSchema>;

function paragraphs(value: string | string[]): string[] {
  return Array.isArray(value) ? value : [value];
}

function About({ props, variant }: { props: AboutProps; variant: string }) {
  const hasImage = !!props.imageUrl;
  const split = (variant === 'split' || variant === 'imageLeft') && hasImage;
  const imageFirst = variant === 'imageLeft' && hasImage;
  const paras = paragraphs(props.body);
  const inverted = props.tone === 'inverted';
  const headColor = inverted ? t.primaryFg : t.fg;
  const bodyColor = inverted ? t.primaryFg : t.mutedFg;

  const Image = hasImage && (
    // biome-ignore lint/a11y/useAltText: alt provided via imageAlt
    <img
      src={props.imageUrl}
      alt={props.imageAlt ?? ''}
      style={{
        width: '100%',
        height: '100%',
        maxHeight: 480,
        aspectRatio: '4 / 3',
        objectFit: 'cover',
        borderRadius: t.radiusLg,
        border: `1px solid ${t.border}`,
        boxShadow: t.shadowMd,
      }}
    />
  );

  const Text = (
    <div style={{ maxWidth: split ? 560 : 760, marginInline: split ? 0 : 'auto' }}>
      <h2 style={heading(2, { textAlign: split ? 'left' : 'center', color: headColor })}>
        {props.headline}
      </h2>
      <div style={{ display: 'grid', gap: 16, marginTop: 20 }}>
        {paras.map((para, i) => (
          <p key={i} style={body({ fontSize: t.textLg, textAlign: split ? 'left' : 'center', color: bodyColor })}>
            {para}
          </p>
        ))}
      </div>
      {props.stats && props.stats.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(props.stats.length, 3)}, 1fr)`,
            gap: 24,
            marginTop: 36,
          }}
        >
          {props.stats.map((stat, i) => (
            <div key={i} style={{ textAlign: split ? 'left' : 'center' }}>
              <div
                style={{
                  fontFamily: t.fontHeading,
                  fontWeight: t.weightHeading as unknown as number,
                  fontSize: t.text3xl,
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                  color: inverted ? t.primaryFg : t.primary,
                }}
              >
                {stat.value}
              </div>
              <div style={body({ fontSize: t.textSm, marginTop: 6, color: bodyColor })}>{stat.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <section style={section(props.tone ?? 'default')}>
      <div
        style={container({
          display: split ? 'grid' : 'block',
          gridTemplateColumns: split ? '1fr 1fr' : undefined,
          gap: split ? 56 : undefined,
          alignItems: 'center',
        })}
      >
        {imageFirst && Image}
        {Text}
        {split && !imageFirst && Image}
      </div>
    </section>
  );
}

export const about: BlockModule<AboutProps> = {
  type: 'about',
  schema: aboutSchema,
  variants: ['default', 'split', 'imageLeft'],
  Component: About,
  sample: (ctx) => ({
    headline: `About ${ctx.businessName}`,
    body: [
      `${ctx.businessName} is a ${ctx.category} business built on doing the work properly the first time.`,
      `${ctx.tagline ?? 'We keep things straightforward'} — clear pricing, honest timelines, and a team that picks up the phone.`,
    ],
    stats: [
      { value: '10+ yrs', label: 'In business' },
      { value: '500+', label: 'Happy customers' },
      { value: '4.9★', label: 'Average rating' },
    ],
  }),
};
