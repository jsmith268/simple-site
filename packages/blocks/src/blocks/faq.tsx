import { z } from 'zod';
import type { BlockModule } from '../types';
import { body, container, heading, section, t } from '../stylekit';

const Item = z.object({ question: z.string(), answer: z.string() });

export const faqSchema = z.object({
  headline: z.string().optional(),
  items: z.array(Item),
});
export type FaqProps = z.infer<typeof faqSchema>;

function Faq({ props, variant }: { props: FaqProps; variant: string }) {
  const twoColumn = variant === 'twoColumn';

  return (
    <section style={section({ background: t.bg })}>
      <div style={container()}>
        {props.headline && (
          <div style={{ maxWidth: 720, marginInline: 'auto', textAlign: 'center', marginBottom: 44 }}>
            <h2 style={heading(2)}>{props.headline}</h2>
          </div>
        )}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: twoColumn ? 'repeat(auto-fit, minmax(300px, 1fr))' : undefined,
            gap: twoColumn ? 16 : 12,
            maxWidth: twoColumn ? undefined : 760,
            marginInline: twoColumn ? undefined : 'auto',
          }}
        >
          {props.items.map((item, i) => (
            <details
              key={i}
              style={{
                background: t.card,
                color: t.cardFg,
                border: `1px solid ${t.border}`,
                borderRadius: t.radiusMd,
                padding: '16px 20px',
              }}
            >
              <summary
                style={{
                  ...heading(3, { fontSize: t.textLg }),
                  cursor: 'pointer',
                  listStyle: 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 16,
                  alignItems: 'center',
                }}
              >
                <span>{item.question}</span>
                <span aria-hidden="true" style={{ color: t.mutedFg, fontWeight: 400 }}>
                  +
                </span>
              </summary>
              <p style={body({ marginTop: 12 })}>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export const faq: BlockModule<FaqProps> = {
  type: 'faq',
  schema: faqSchema,
  variants: ['default', 'twoColumn'],
  Component: Faq,
  sample: (ctx) => ({
    headline: 'Frequently asked questions',
    items: [
      {
        question: 'How do I get a quote?',
        answer: `Reach out through the contact form and we will get back to you with a clear estimate for your ${ctx.category} needs.`,
      },
      {
        question: 'What areas do you cover?',
        answer: `${ctx.businessName} serves the local area and surrounding regions. Ask us if you are unsure whether you are in range.`,
      },
      {
        question: 'Are you insured?',
        answer: 'Yes — we are fully insured and happy to provide documentation on request.',
      },
      {
        question: 'How soon can you start?',
        answer: 'Timelines depend on the job, but we will always give you an honest estimate before any work begins.',
      },
    ],
  }),
};
