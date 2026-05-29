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

// CSS-only responsive menu: a media query hides the desktop links on narrow
// screens and reveals a <details> disclosure. No JS, no 'use client'.
const RESPONSIVE_CSS = `
.ss-nav-desktop { display: flex; }
.ss-nav-mobile { display: none; }
@media (max-width: 720px) {
  .ss-nav-desktop { display: none !important; }
  .ss-nav-mobile { display: block !important; }
}
.ss-nav-mobile > summary { list-style: none; cursor: pointer; }
.ss-nav-mobile > summary::-webkit-details-marker { display: none; }
.ss-nav-mobile[open] .ss-nav-burger-open { display: none; }
.ss-nav-mobile:not([open]) .ss-nav-burger-close { display: none; }
`;

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
          decoding="async"
          style={{ height: 28, width: 'auto', display: 'block' }}
        />
      )}
      <span>{props.brandName}</span>
    </a>
  );

  const linkStyle = {
    ...body({ fontSize: t.textSm }),
    color: t.fg,
    textDecoration: 'none',
    fontWeight: 500,
  };

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
          <a href={item.href} style={linkStyle}>
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  );

  const DesktopActions = (
    <div
      className="ss-nav-desktop"
      style={{ alignItems: 'center', gap: 'clamp(16px, 3vw, 28px)', flexWrap: 'wrap' }}
    >
      {Links}
      {props.cta && (
        <a href={props.cta.href} style={button('primary')}>
          {props.cta.label}
        </a>
      )}
    </div>
  );

  const MobileMenu = (
    <details className="ss-nav-mobile" style={{ position: 'relative' }}>
      <summary
        aria-label="Toggle navigation menu"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 42,
          height: 42,
          borderRadius: t.radiusMd,
          border: `1px solid ${t.border}`,
          color: t.fg,
        }}
      >
        <svg
          className="ss-nav-burger-open"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
        <svg
          className="ss-nav-burger-close"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </summary>
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 'calc(100% + 10px)',
          minWidth: 200,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          background: t.card,
          border: `1px solid ${t.border}`,
          borderRadius: t.radiusMd,
          boxShadow: t.shadowLg,
          padding: 12,
          zIndex: 60,
        }}
      >
        {props.items.map((item) => (
          <a
            key={`${item.label}-${item.href}`}
            href={item.href}
            style={{ ...linkStyle, padding: '8px 10px', borderRadius: t.radiusSm }}
          >
            {item.label}
          </a>
        ))}
        {props.cta && (
          <a href={props.cta.href} style={{ ...button('primary'), marginTop: 6, width: '100%' }}>
            {props.cta.label}
          </a>
        )}
      </div>
    </details>
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
      {/** biome-ignore lint/security/noDangerouslySetInnerHtml: static responsive CSS, no user input */}
      <style dangerouslySetInnerHTML={{ __html: RESPONSIVE_CSS }} />
      <nav
        aria-label="Primary"
        style={container({
          display: 'flex',
          alignItems: 'center',
          justifyContent: centered ? 'center' : 'space-between',
          gap: 24,
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
            <div className="ss-nav-desktop" style={{ alignItems: 'center', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
              {Links}
              {props.cta && (
                <a href={props.cta.href} style={button('primary')}>
                  {props.cta.label}
                </a>
              )}
            </div>
            {MobileMenu}
          </div>
        ) : (
          <>
            {Brand}
            {DesktopActions}
            {MobileMenu}
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
