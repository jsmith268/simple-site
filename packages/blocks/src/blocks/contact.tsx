import { z } from 'zod';
import { body, button, container, heading, section, t } from '../stylekit';
import type { BlockModule } from '../types';

export const contactSchema = z.object({
  headline: z.string().optional(),
  intro: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  mapEmbedUrl: z.string().optional(),
  showForm: z.boolean().optional(),
});
export type ContactProps = z.infer<typeof contactSchema>;

const fieldLabel = {
  display: 'block',
  marginBottom: 6,
  fontWeight: 600,
  color: t.fg,
};

function inputStyle() {
  return {
    width: '100%',
    boxSizing: 'border-box' as const,
    padding: '11px 14px',
    fontFamily: t.fontBody,
    fontSize: t.text,
    color: t.fg,
    background: t.bg,
    border: `1px solid ${t.border}`,
    borderRadius: t.radiusMd,
  };
}

function Contact({ props, variant }: { props: ContactProps; variant: string }) {
  const split = variant === 'split';

  const Details = (
    <div style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
      {props.email && (
        <div>
          <p style={{ ...body({ fontSize: t.textSm }), fontWeight: 600, color: t.fg, margin: 0 }}>
            Email
          </p>
          <a href={`mailto:${props.email}`} style={{ ...body(), textDecoration: 'none' }}>
            {props.email}
          </a>
        </div>
      )}
      {props.phone && (
        <div>
          <p style={{ ...body({ fontSize: t.textSm }), fontWeight: 600, color: t.fg, margin: 0 }}>
            Phone
          </p>
          <a
            href={`tel:${props.phone.replace(/\s+/g, '')}`}
            style={{ ...body(), textDecoration: 'none' }}
          >
            {props.phone}
          </a>
        </div>
      )}
      {props.address && (
        <div>
          <p style={{ ...body({ fontSize: t.textSm }), fontWeight: 600, color: t.fg, margin: 0 }}>
            Address
          </p>
          <address style={{ ...body(), fontStyle: 'normal' }}>{props.address}</address>
        </div>
      )}
      {props.mapEmbedUrl && (
        <iframe
          title="Location map"
          src={props.mapEmbedUrl}
          loading="lazy"
          style={{
            width: '100%',
            height: 260,
            border: `1px solid ${t.border}`,
            borderRadius: t.radiusLg,
          }}
        />
      )}
    </div>
  );

  const Form = props.showForm ? (
    <form style={{ display: 'grid', gap: 16 }} aria-label="Contact form">
      <div>
        <label htmlFor="contact-name" style={{ ...body({ fontSize: t.textSm }), ...fieldLabel }}>
          Name
        </label>
        <input id="contact-name" name="name" type="text" autoComplete="name" style={inputStyle()} />
      </div>
      <div>
        <label htmlFor="contact-email" style={{ ...body({ fontSize: t.textSm }), ...fieldLabel }}>
          Email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          style={inputStyle()}
        />
      </div>
      <div>
        <label htmlFor="contact-message" style={{ ...body({ fontSize: t.textSm }), ...fieldLabel }}>
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          style={{ ...inputStyle(), resize: 'vertical' }}
        />
      </div>
      <div>
        <button type="submit" style={button('primary')}>
          Send message
        </button>
      </div>
    </form>
  ) : null;

  const Header = (
    <div
      style={{
        maxWidth: 640,
        marginInline: split ? 0 : 'auto',
        textAlign: split ? 'left' : 'center',
      }}
    >
      <h2 style={heading(2)}>{props.headline ?? 'Get in touch'}</h2>
      {props.intro && <p style={body({ fontSize: t.textLg, marginTop: 14 })}>{props.intro}</p>}
    </div>
  );

  return (
    <section id="contact" style={section({ background: t.bg })}>
      <div style={container()}>
        {Header}
        <div
          style={{
            marginTop: 40,
            display: split && Form ? 'grid' : 'block',
            gridTemplateColumns: split && Form ? '1fr 1fr' : undefined,
            gap: 48,
            alignItems: 'start',
          }}
        >
          {Details}
          {Form && <div style={{ marginTop: split ? 0 : 32 }}>{Form}</div>}
        </div>
      </div>
    </section>
  );
}

export const contact: BlockModule<ContactProps> = {
  type: 'contact',
  schema: contactSchema,
  variants: ['default', 'split'],
  Component: Contact,
  sample: (ctx) => ({
    headline: 'Get in touch',
    intro: `Have a question about ${ctx.category}? Reach out and ${ctx.businessName} will get back to you within one business day.`,
    email: 'hello@example.com',
    phone: '(555) 123-4567',
    address: '123 Main Street, Springfield',
    showForm: true,
  }),
};
