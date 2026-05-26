import { z } from 'zod';
import { body, container, t } from '../stylekit';
import type { BlockModule } from '../types';

const FooterLink = z.object({ label: z.string(), href: z.string() });
const FooterColumn = z.object({ title: z.string(), links: z.array(FooterLink) });
const Social = z.object({ platform: z.string(), url: z.string() });

export const footerSchema = z.object({
  brandName: z.string(),
  tagline: z.string().optional(),
  columns: z.array(FooterColumn).optional(),
  socials: z.array(Social).optional(),
  legal: z.string().optional(),
});
export type FooterProps = z.infer<typeof footerSchema>;

function Footer({ props, variant }: { props: FooterProps; variant: string }) {
  const minimal = variant === 'minimal';
  const hasColumns = !minimal && !!props.columns && props.columns.length > 0;

  const Brand = (
    <div style={{ maxWidth: 320 }}>
      <p
        style={{
          fontFamily: t.fontHeading,
          fontWeight: t.weightHeading as unknown as number,
          fontSize: t.textLg,
          color: t.fg,
          margin: 0,
          letterSpacing: '-0.01em',
        }}
      >
        {props.brandName}
      </p>
      {props.tagline && <p style={body({ fontSize: t.textSm, marginTop: 10 })}>{props.tagline}</p>}
      {props.socials && props.socials.length > 0 && (
        <ul
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 16,
            listStyle: 'none',
            margin: '16px 0 0',
            padding: 0,
          }}
        >
          {props.socials.map((s) => (
            <li key={`${s.platform}-${s.url}`}>
              <a
                href={s.url}
                style={{
                  ...body({ fontSize: t.textSm }),
                  color: t.fg,
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                {s.platform}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <footer style={{ background: t.bg, borderTop: `1px solid ${t.border}` }}>
      <div style={container({ paddingBlock: 'clamp(32px, 6vw, 56px)' })}>
        <div
          style={{
            display: hasColumns ? 'grid' : 'flex',
            gridTemplateColumns: hasColumns ? 'minmax(220px, 1fr) 2fr' : undefined,
            flexWrap: hasColumns ? undefined : 'wrap',
            alignItems: hasColumns ? 'start' : 'center',
            justifyContent: hasColumns ? undefined : 'space-between',
            gap: 40,
          }}
        >
          {Brand}
          {hasColumns && props.columns && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: 32,
              }}
            >
              {props.columns.map((col) => (
                <nav key={col.title} aria-label={col.title}>
                  <p
                    style={{
                      ...body({ fontSize: t.textSm }),
                      color: t.fg,
                      fontWeight: 600,
                      margin: '0 0 12px',
                    }}
                  >
                    {col.title}
                  </p>
                  <ul
                    style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10 }}
                  >
                    {col.links.map((link) => (
                      <li key={`${link.label}-${link.href}`}>
                        <a
                          href={link.href}
                          style={{ ...body({ fontSize: t.textSm }), textDecoration: 'none' }}
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>
          )}
        </div>
        <div
          style={{
            marginTop: 32,
            paddingTop: 20,
            borderTop: `1px solid ${t.border}`,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <p style={body({ fontSize: t.textSm })}>
            {props.legal ??
              `© ${new Date().getFullYear()} ${props.brandName}. All rights reserved.`}
          </p>
        </div>
      </div>
    </footer>
  );
}

export const footer: BlockModule<FooterProps> = {
  type: 'footer',
  schema: footerSchema,
  variants: ['default', 'minimal'],
  Component: Footer,
  sample: (ctx) => ({
    brandName: ctx.businessName,
    tagline: ctx.tagline ?? `Trusted ${ctx.category} for our community.`,
    columns: [
      {
        title: 'Company',
        links: [
          { label: 'About', href: '#about' },
          { label: 'Services', href: '#services' },
          { label: 'Contact', href: '#contact' },
        ],
      },
      {
        title: 'Resources',
        links: [
          { label: 'Hours', href: '#hours' },
          { label: 'FAQ', href: '#faq' },
        ],
      },
    ],
    socials: [
      { platform: 'Facebook', url: '#' },
      { platform: 'Instagram', url: '#' },
    ],
  }),
};
