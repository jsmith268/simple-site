import { z } from 'zod';
import { body, button, container, t } from '../stylekit';
import type { BlockModule } from '../types';

const NavItem = z.object({ label: z.string(), href: z.string() });
const NavCta = z.object({ label: z.string(), href: z.string() });

export const navSchema = z.object({
  brandName: z.string(),
  logoUrl: z.string().optional(),
  items: z.array(NavItem),
  cta: NavCta.optional(),
});
export type NavProps = z.infer<typeof navSchema>;

function Nav({ props, variant }: { props: NavProps; variant: string }) {
  const centered = variant === 'centered';

  const Brand = (
    <a
      href="#top"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        textDecoration: 'none',
        color: t.fg,
        fontFamily: t.fontHeading,
        fontWeight: t.weightHeading as unknown as number,
        fontSize: t.textLg,
        letterSpacing: '-0.01em',
      }}
    >
      {props.logoUrl && (
        <img
          src={props.logoUrl}
          alt={`${props.brandName} logo`}
          style={{ height: 28, width: 'auto', display: 'block' }}
        />
      )}
      <span>{props.brandName}</span>
    </a>
  );

  const Links = (
    <ul
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 'clamp(16px, 3vw, 28px)',
        listStyle: 'none',
        margin: 0,
        padding: 0,
      }}
    >
      {props.items.map((item) => (
        <li key={`${item.label}-${item.href}`}>
          <a
            href={item.href}
            style={{
              ...body({ fontSize: t.textSm }),
              color: t.fg,
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: t.bg,
        borderBottom: `1px solid ${t.border}`,
      }}
    >
      <nav
        aria-label="Primary"
        style={container({
          display: 'flex',
          alignItems: 'center',
          justifyContent: centered ? 'center' : 'space-between',
          gap: 24,
          flexWrap: 'wrap',
          paddingBlock: 14,
        })}
      >
        {centered ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              width: '100%',
            }}
          >
            {Brand}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              {Links}
              {props.cta && (
                <a href={props.cta.href} style={button('primary')}>
                  {props.cta.label}
                </a>
              )}
            </div>
          </div>
        ) : (
          <>
            {Brand}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'clamp(16px, 3vw, 28px)',
                flexWrap: 'wrap',
              }}
            >
              {Links}
              {props.cta && (
                <a href={props.cta.href} style={button('primary')}>
                  {props.cta.label}
                </a>
              )}
            </div>
          </>
        )}
      </nav>
    </header>
  );
}

export const nav: BlockModule<NavProps> = {
  type: 'nav',
  schema: navSchema,
  variants: ['default', 'centered'],
  Component: Nav,
  sample: (ctx) => ({
    brandName: ctx.businessName,
    items: [
      { label: 'Services', href: '#services' },
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' },
    ],
    cta: { label: 'Get a quote', href: '#contact' },
  }),
};
