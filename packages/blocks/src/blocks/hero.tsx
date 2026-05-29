import { z } from 'zod';
import { body, button, chip, container, display, eyebrow, section, t } from '../stylekit';
import type { BlockModule } from '../types';

const Cta = z.object({ label: z.string(), href: z.string() });

export const heroSchema = z.object({
  eyebrow: z.string().optional(),
  headline: z.string(),
  subheadline: z.string().optional(),
  primaryCta: Cta.optional(),
  secondaryCta: Cta.optional(),
  imageUrl: z.string().optional(),
  imageAlt: z.string().optional(),
  tone: z.enum(['default', 'muted', 'inverted']).optional(),
});
export type HeroProps = z.infer<typeof heroSchema>;

/**
 * Split a headline into its lead text + final emphasis token. An explicit
 * `*marked*` segment wins; otherwise the last word is emphasised. Used by the
 * aurora variant to gradient-clip a single accent fragment.
 */
function splitEmphasis(headline: string): { lead: string; emphasis: string } {
  const marked = headline.match(/^(.*?)\*(.+?)\*(.*)$/);
  if (marked) {
    return { lead: marked[1] ?? '', emphasis: `${marked[2] ?? ''}${marked[3] ?? ''}` };
  }
  const trimmed = headline.replace(/\s+$/, '');
  const idx = trimmed.lastIndexOf(' ');
  if (idx === -1) return { lead: '', emphasis: trimmed };
  return { lead: `${trimmed.slice(0, idx)} `, emphasis: trimmed.slice(idx + 1) };
}

function Hero({ props, variant }: { props: HeroProps; variant: string }) {
  const aurora = variant === 'aurora';
  const overlay = variant === 'overlay' && !!props.imageUrl;
  const split = variant === 'split' && !!props.imageUrl;
  // On overlay, text is always light regardless of tone.
  const onDark = overlay || props.tone === 'inverted';
  // Aurora uses the theme fg (which already contrasts the hero gradient bg).
  const headlineColor = aurora ? t.fg : onDark ? t.primaryFg : t.fg;
  const bodyColor = aurora ? t.mutedFg : onDark ? t.primaryFg : t.mutedFg;
  const eyebrowColor = overlay ? t.primaryFg : t.primary;

  const Ctas = (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 28 }}>
      {props.primaryCta && (
        <a href={props.primaryCta.href} className="ss-cta" style={button('primary')}>
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

  const align = split || overlay ? 'left' : 'center';

  if (aurora) {
    const { lead, emphasis } = splitEmphasis(props.headline);
    return (
      <section
        style={{
          background: 'var(--ss-grad-hero)',
          minHeight: 'clamp(540px, 74vh, 780px)',
          display: 'flex',
          alignItems: 'center',
          paddingBlock: t.sectionPy,
          color: t.fg,
        }}
      >
        <div style={container()}>
          <div style={{ maxWidth: 820, marginInline: 'auto', textAlign: 'center' }}>
            {props.eyebrow ? (
              <p className="ss-eyebrow" style={chip(eyebrow({ marginBottom: 20 }))}>
                <span
                  aria-hidden="true"
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 999,
                    background: t.primary,
                    flexShrink: 0,
                  }}
                />
                {props.eyebrow}
              </p>
            ) : null}
            <h1 style={display({ textAlign: 'center', color: headlineColor })}>
              {lead}
              <span className="ss-grad">{emphasis}</span>
            </h1>
            {props.subheadline && (
              <p
                style={body({
                  fontSize: t.textLg,
                  marginTop: 18,
                  textAlign: 'center',
                  color: bodyColor,
                  maxWidth: 640,
                  marginInline: 'auto',
                })}
              >
                {props.subheadline}
              </p>
            )}
            <div style={{ display: 'flex', justifyContent: 'center' }}>{Ctas}</div>
          </div>
        </div>
      </section>
    );
  }

  const Text = (
    <div style={{ maxWidth: split ? 560 : 760, marginInline: align === 'center' ? 'auto' : 0 }}>
      {props.eyebrow && (
        <p
          className="ss-eyebrow"
          style={eyebrow({
            color: eyebrowColor,
            fontSize: t.textSm,
            marginBottom: 14,
            opacity: overlay ? 0.92 : 1,
          })}
        >
          {props.eyebrow}
        </p>
      )}
      <h1 style={display({ textAlign: align, color: headlineColor })}>{props.headline}</h1>
      {props.subheadline && (
        <p style={body({ fontSize: t.textLg, marginTop: 18, textAlign: align, color: bodyColor })}>
          {props.subheadline}
        </p>
      )}
      <div
        style={{ display: 'flex', justifyContent: align === 'center' ? 'center' : 'flex-start' }}
      >
        {Ctas}
      </div>
    </div>
  );

  if (overlay) {
    return (
      <section
        style={{
          position: 'relative',
          minHeight: 'clamp(520px, 72vh, 760px)',
          display: 'flex',
          alignItems: 'center',
          paddingBlock: t.sectionPy,
          backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url("${props.imageUrl}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: t.primaryFg,
        }}
      >
        <div style={container()}>{Text}</div>
      </section>
    );
  }

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
        {Text}
        {split && props.imageUrl && (
          // biome-ignore lint/a11y/useAltText: alt provided via imageAlt
          <img
            src={props.imageUrl}
            alt={props.imageAlt ?? ''}
            loading="eager"
            fetchPriority="high"
            decoding="async"
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
        )}
      </div>
    </section>
  );
}

export const hero: BlockModule<HeroProps> = {
  type: 'hero',
  schema: heroSchema,
  variants: ['default', 'split', 'overlay', 'aurora'],
  Component: Hero,
  sample: (ctx) => ({
    eyebrow: ctx.category,
    headline: `${ctx.businessName} — ${ctx.tagline ?? 'work you can rely on'}`,
    subheadline: `We help our customers with ${ctx.category}. Clear information, no surprises.`,
    primaryCta: { label: 'Get in touch', href: '#contact' },
    secondaryCta: { label: 'Our services', href: '#services' },
  }),
};
