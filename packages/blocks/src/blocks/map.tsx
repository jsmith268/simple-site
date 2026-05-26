import { z } from 'zod';
import { body, container, heading, section, t } from '../stylekit';
import type { BlockModule } from '../types';

export const mapSchema = z.object({
  headline: z.string().optional(),
  embedUrl: z.string().optional(),
  address: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});
export type MapProps = z.infer<typeof mapSchema>;

function MapBlock({ props, variant }: { props: MapProps; variant: string }) {
  const withAddress = variant === 'withAddress';
  const title = props.address ? `Map showing ${props.address}` : 'Location map';

  const MapArea = props.embedUrl ? (
    <iframe
      title={title}
      src={props.embedUrl}
      loading="lazy"
      style={{
        width: '100%',
        height: 420,
        border: `1px solid ${t.border}`,
        borderRadius: t.radiusLg,
        display: 'block',
      }}
    />
  ) : (
    <div
      role="img"
      aria-label={title}
      style={{
        width: '100%',
        height: 420,
        background: t.muted,
        border: `1px solid ${t.border}`,
        borderRadius: t.radiusLg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        textAlign: 'center',
        padding: 24,
        boxSizing: 'border-box',
      }}
    >
      <span style={{ fontFamily: t.fontHeading, fontWeight: 600, color: t.fg }}>Find us here</span>
      {props.address && <span style={body()}>{props.address}</span>}
      {!props.address && props.lat != null && props.lng != null && (
        <span style={body({ fontSize: t.textSm })}>
          {props.lat.toFixed(4)}, {props.lng.toFixed(4)}
        </span>
      )}
    </div>
  );

  return (
    <section style={section({ background: t.bg })}>
      <div style={container()}>
        {props.headline && (
          <h2 style={heading(2, { textAlign: 'center', marginBottom: 40 })}>{props.headline}</h2>
        )}
        {withAddress && props.address ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(220px, 1fr) 2fr',
              gap: 32,
              alignItems: 'start',
            }}
          >
            <address
              style={{
                ...body({ fontSize: t.textLg }),
                fontStyle: 'normal',
                lineHeight: 1.6,
                color: t.fg,
              }}
            >
              <div style={{ fontFamily: t.fontHeading, fontWeight: 600, marginBottom: 8 }}>
                Visit us
              </div>
              {props.address}
            </address>
            {MapArea}
          </div>
        ) : (
          MapArea
        )}
      </div>
    </section>
  );
}

export const map: BlockModule<MapProps> = {
  type: 'map',
  schema: mapSchema,
  variants: ['default', 'withAddress'],
  Component: MapBlock,
  sample: (ctx) => ({
    headline: `Visit ${ctx.businessName}`,
    address: '123 Main Street, Suite 200, Springfield, IL 62701',
  }),
};
