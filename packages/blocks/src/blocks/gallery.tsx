import { z } from 'zod';
import { container, heading, section, t } from '../stylekit';
import type { BlockModule } from '../types';

const GalleryImage = z.object({
  url: z.string(),
  alt: z.string(),
});

export const gallerySchema = z.object({
  headline: z.string().optional(),
  images: z.array(GalleryImage),
  tone: z.enum(['default', 'muted', 'inverted']).optional(),
});
export type GalleryProps = z.infer<typeof gallerySchema>;

function Gallery({ props, variant }: { props: GalleryProps; variant: string }) {
  const masonry = variant === 'masonry';
  const headColor = props.tone === 'inverted' ? t.primaryFg : t.fg;

  return (
    <section style={section(props.tone ?? 'default')}>
      <div style={container()}>
        {props.headline && (
          <h2 style={heading(2, { textAlign: 'center', marginBottom: 40, color: headColor })}>
            {props.headline}
          </h2>
        )}
        {masonry ? (
          <div
            style={{
              columnWidth: 260,
              columnGap: 16,
            }}
          >
            {props.images.map((img) => (
              <img
                key={img.url}
                src={img.url}
                alt={img.alt}
                style={{
                  width: '100%',
                  display: 'block',
                  marginBottom: 16,
                  borderRadius: t.radiusLg,
                  border: `1px solid ${t.border}`,
                  boxShadow: t.shadowSm,
                  breakInside: 'avoid',
                }}
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 16,
            }}
          >
            {props.images.map((img) => (
              <img
                key={img.url}
                src={img.url}
                alt={img.alt}
                style={{
                  width: '100%',
                  height: 220,
                  aspectRatio: '4 / 3',
                  objectFit: 'cover',
                  display: 'block',
                  borderRadius: t.radiusLg,
                  border: `1px solid ${t.border}`,
                  boxShadow: t.shadowSm,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export const gallery: BlockModule<GalleryProps> = {
  type: 'gallery',
  schema: gallerySchema,
  variants: ['grid', 'masonry'],
  Component: Gallery,
  sample: (ctx) => ({
    headline: `Our work at ${ctx.businessName}`,
    images: [
      {
        url: 'https://placehold.co/600x400?text=1',
        alt: `${ctx.category} project — exterior view`,
      },
      { url: 'https://placehold.co/600x500?text=2', alt: `${ctx.category} project — detail` },
      {
        url: 'https://placehold.co/600x450?text=3',
        alt: `${ctx.category} project — finished result`,
      },
      { url: 'https://placehold.co/600x600?text=4', alt: `${ctx.category} project — in progress` },
      { url: 'https://placehold.co/600x400?text=5', alt: `${ctx.category} project — site` },
      { url: 'https://placehold.co/600x520?text=6', alt: `${ctx.category} project — close up` },
    ],
  }),
};
