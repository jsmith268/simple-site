import { logger } from './index';

/**
 * Transactional email. Live when RESEND_API_KEY is set (via dynamic import so
 * `resend` stays optional); otherwise logs offline — no external calls, no
 * Anthropic. Keeps the customer in the loop: purchase → designs ready → changes
 * applied → going live → refund.
 */
export function isEmailLive(): boolean {
  return !!process.env.RESEND_API_KEY;
}

const FROM = process.env.EMAIL_FROM ?? 'Simple Site <hello@simplesight.co>';

export interface EmailInput {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(input: EmailInput): Promise<{ ok: boolean }> {
  if (!input.to) return { ok: false };
  if (!isEmailLive()) {
    logger.info('email.offline', { to: input.to, subject: input.subject });
    return { ok: true };
  }
  try {
    // Variable specifier so TS doesn't require `resend` to be installed — it's
    // an optional peer, dynamically loaded only when RESEND_API_KEY is set.
    const specifier = 'resend';
    const mod = (await import(specifier)) as {
      Resend: new (key: string) => { emails: { send: (o: { from: string; to: string; subject: string; html: string }) => Promise<unknown> } };
    };
    const resend = new mod.Resend(process.env.RESEND_API_KEY as string);
    await resend.emails.send({ from: FROM, to: input.to, subject: input.subject, html: input.html });
    logger.info('email.sent', { to: input.to, subject: input.subject });
    return { ok: true };
  } catch (err) {
    logger.error('email.failed', { to: input.to, error: String((err as Error)?.message ?? err) });
    return { ok: false };
  }
}

/* ── Branded template ────────────────────────────────────────────────────── */

function wrap(heading: string, body: string, cta?: { label: string; url: string }): string {
  const button = cta
    ? `<a href="${cta.url}" style="display:inline-block;background:#c2410c;color:#fffaf5;text-decoration:none;font-weight:600;font-size:15px;padding:12px 22px;border-radius:999px;margin-top:8px">${cta.label}</a>`
    : '';
  return `<!doctype html><html><body style="margin:0;background:#f7f4ee;font-family:-apple-system,Segoe UI,Inter,sans-serif;color:#211d17">
  <div style="max-width:520px;margin:0 auto;padding:40px 24px">
    <div style="font-family:Georgia,serif;font-weight:600;font-size:18px;margin-bottom:24px">Simple Site</div>
    <div style="background:#fffdf9;border:1px solid #e7dfd2;border-radius:16px;padding:28px">
      <h1 style="font-family:Georgia,serif;font-size:22px;margin:0 0 12px">${heading}</h1>
      <div style="font-size:15px;line-height:1.6;color:#4b4439">${body}</div>
      ${button}
    </div>
    <p style="color:#8a8174;font-size:12px;margin-top:20px">You're receiving this because you started a website with Simple Site.</p>
  </div></body></html>`;
}

export const email = {
  purchaseReceived: (to: string) =>
    sendEmail({
      to,
      subject: "You're in — let's build your site",
      html: wrap(
        "Payment received — thank you",
        "<p>Your build is set up. Next, a few quick questions with Avery, your build lead, and we'll generate two complete design directions for you to choose from.</p>",
      ),
    }),
  designsReady: (to: string, url: string) =>
    sendEmail({
      to,
      subject: "Your two designs are ready to compare",
      html: wrap(
        "Two directions, built for you",
        "<p>Both studios finished. Open your studio to compare them side by side, pick the one you love, or ask for changes.</p>",
        { label: "Compare your designs", url },
      ),
    }),
  changesApplied: (to: string, url: string) =>
    sendEmail({
      to,
      subject: "We applied your changes",
      html: wrap(
        "Your updates are in",
        "<p>We made the changes from your checklist and re-checked the quality. Take a look and keep refining, or take it live.</p>",
        { label: "Review your site", url },
      ),
    }),
  goingLive: (to: string, domain: string, url: string) =>
    sendEmail({
      to,
      subject: "Your site is going live 🎉",
      html: wrap(
        "You're live",
        `<p>Your website is publishing now at <strong>${domain}</strong>. SSL and hosting are handled — nothing more for you to do.</p>`,
        { label: "View your live site", url },
      ),
    }),
  refunded: (to: string) =>
    sendEmail({
      to,
      subject: "Your refund is on its way",
      html: wrap(
        "Refund processed",
        "<p>We've issued your full refund and taken the site offline. If there's anything we could have done better, just reply — we read every note.</p>",
      ),
    }),
};
