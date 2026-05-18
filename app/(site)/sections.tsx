"use client";

import Link from "next/link";
import { AUDIENCE, PROCESS, PRINCIPLES, WORK, PRICING, FAQS } from "@/lib/content";
import type { Theme } from "./themes";
import { CtaPrimary } from "./chrome";

// ─── BUILT FOR ────────────────────────────────────────────────────────
export function BuiltFor({ theme }: { theme: Theme }) {
  return (
    <section id="built-for" className="py-24 sm:py-32" style={{ background: theme.bgAlt }}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-end">
          <div className="lg:col-span-7">
            <Eyebrow theme={theme}>Built for</Eyebrow>
            <h2
              className="font-semibold tracking-tight text-[clamp(2.2rem,5vw,4rem)] leading-[1] mt-5 text-balance"
              style={{ fontFamily: theme.fontDisplay, color: theme.ink }}
            >
              Owners.{" "}
              <span style={{ color: theme.inkMuted }}>Not org charts.</span>
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="text-[17px] leading-[1.55] text-pretty" style={{ color: theme.inkSoft }}>
              We work with people who answer their own phone and sign their own invoices. Solo
              founders, small teams, local operators — the kind of business where the website has to
              pull its weight from day one.
            </p>
          </div>
        </div>

        <div
          className={`mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-px ${theme.borderRadius} overflow-hidden`}
          style={{ background: theme.borderStrong, border: `1px solid ${theme.borderStrong}` }}
        >
          {AUDIENCE.map((a, i) => (
            <article
              key={a.name}
              className="p-8 flex flex-col justify-between min-h-[180px] group transition-colors"
              style={{ background: theme.card }}
            >
              <div>
                <p
                  className="text-[10px] uppercase tracking-[0.22em] font-bold mb-5"
                  style={{ color: theme.accent, fontFamily: theme.fontMono }}
                >
                  · 0{i + 1}
                </p>
                <h3
                  className="text-[22px] tracking-tight leading-[1.1] text-balance"
                  style={{ fontFamily: theme.fontDisplay, color: theme.ink, fontWeight: 600 }}
                >
                  {a.name}
                </h3>
              </div>
              <p
                className="mt-6 text-[15px] leading-[1.4] text-pretty"
                style={{ color: theme.inkSoft, fontFamily: theme.fontAccent }}
              >
                {a.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── HOW WE WORK ──────────────────────────────────────────────────────
export function HowWeWork({ theme }: { theme: Theme }) {
  return (
    <section id="how" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <Eyebrow theme={theme}>How we work</Eyebrow>
        <div className="mt-5 grid lg:grid-cols-12 gap-10 lg:gap-16 items-end">
          <div className="lg:col-span-8">
            <h2
              className="font-semibold tracking-tight text-[clamp(2.2rem,5vw,4rem)] leading-[1] text-balance"
              style={{ fontFamily: theme.fontDisplay, color: theme.ink }}
            >
              Three concepts in 24 hours.{" "}
              <span style={{ color: theme.accent, fontFamily: theme.fontAccent }}>Live in 72.</span>
            </h2>
            <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-pretty" style={{ color: theme.inkSoft }}>
              Real designers, transparent process, the fastest delivery in the business. The intake
              form on day one is the brief — no slide decks, no discovery calls, no week-long
              kickoffs.
            </p>
          </div>
          <div
            className={`lg:col-span-4 ${theme.borderRadius} ${theme.borderWidth} p-6 text-center`}
            style={{ background: theme.card, borderColor: theme.border }}
          >
            <p
              className="text-[11px] uppercase tracking-[0.22em] font-semibold"
              style={{ color: theme.accent, fontFamily: theme.fontMono }}
            >
              Intake → live URL
            </p>
            <p
              className="mt-2 text-[88px] leading-none tracking-tight"
              style={{ fontFamily: theme.fontDisplay, color: theme.ink, fontWeight: 600 }}
            >
              72<span style={{ color: theme.accent }}>h</span>
            </p>
            <p className="mt-2 text-[13px]" style={{ color: theme.inkMuted }}>
              Three full days, end to end.
            </p>
          </div>
        </div>

        <ol
          className={`mt-14 grid md:grid-cols-3 gap-px ${theme.borderRadius} overflow-hidden`}
          style={{ background: theme.borderStrong, border: `1px solid ${theme.borderStrong}` }}
        >
          {PROCESS.map((p) => (
            <li key={p.n} className="p-8" style={{ background: theme.card }}>
              <div className="flex items-baseline gap-3 mb-6">
                <span
                  className="font-mono text-[12px] font-semibold"
                  style={{ color: theme.accent, fontFamily: theme.fontMono }}
                >
                  {p.n}
                </span>
                <span className="h-px flex-1" style={{ background: theme.border }} />
              </div>
              <h3
                className="text-[24px] leading-[1.1] tracking-tight text-balance"
                style={{ fontFamily: theme.fontDisplay, color: theme.ink, fontWeight: 600 }}
              >
                {p.title}
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-pretty" style={{ color: theme.inkSoft }}>
                {p.body}
              </p>
              <p
                className="mt-5 pt-5 italic text-[13px] border-t"
                style={{ borderColor: theme.border, color: theme.inkMuted, fontFamily: theme.fontAccent }}
              >
                — {p.detail}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="pl-5" style={{ borderLeft: `2px solid ${theme.accent}` }}>
              <h4
                className="text-lg font-semibold tracking-tight"
                style={{ fontFamily: theme.fontDisplay, color: theme.ink }}
              >
                {p.title}
              </h4>
              <p className="mt-2 text-[13px] leading-relaxed" style={{ color: theme.inkSoft }}>
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── WORK ─────────────────────────────────────────────────────────────
export function Work({ theme }: { theme: Theme }) {
  return (
    <section id="work" className="py-24 sm:py-32" style={{ background: theme.bgAlt }}>
      <div className="mx-auto max-w-7xl px-6">
        <Eyebrow theme={theme}>Recent work</Eyebrow>
        <h2
          className="font-semibold tracking-tight text-[clamp(2rem,4.4vw,3.4rem)] leading-[1.02] mt-5 max-w-3xl text-balance"
          style={{ fontFamily: theme.fontDisplay, color: theme.ink }}
        >
          A few small businesses we've shipped.
        </h2>
        <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-pretty" style={{ color: theme.inkSoft }}>
          Real names, real URLs. Each one started as three custom concepts. The owners picked one.
          Then we built.
        </p>

        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {WORK.map((w, i) => (
            <a
              key={w.name}
              href={w.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group block ${theme.borderRadius} ${theme.borderWidth} p-7 transition-colors hover:-translate-y-0.5 duration-200 flex flex-col`}
              style={{
                background: theme.card,
                borderColor: theme.border,
                color: theme.ink,
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full text-base font-semibold"
                  style={{
                    background: theme.accent,
                    color: theme.accentInk,
                    fontFamily: theme.fontDisplay,
                  }}
                >
                  {w.name.charAt(0)}
                </span>
                <span
                  className="text-[11px] uppercase tracking-[0.18em] font-medium"
                  style={{ color: theme.accent, fontFamily: theme.fontMono }}
                >
                  No. 0{i + 1}
                </span>
              </div>
              <h3
                className="mt-8 text-[28px] leading-[1.02] text-balance"
                style={{ fontFamily: theme.fontDisplay, color: theme.ink, fontWeight: 600 }}
              >
                {w.name}
              </h3>
              <p
                className="mt-2 text-[11px] uppercase tracking-[0.16em] font-medium"
                style={{ color: theme.inkMuted, fontFamily: theme.fontMono }}
              >
                {w.tag} · {w.location}
              </p>
              <p className="mt-5 text-[14px] leading-relaxed text-pretty flex-1" style={{ color: theme.inkSoft }}>
                {w.blurb}
              </p>
              <div
                className="mt-7 pt-5 flex items-center justify-between"
                style={{ borderTop: `1px solid ${theme.border}` }}
              >
                <span className="text-[12px]" style={{ color: theme.inkMuted, fontFamily: theme.fontMono }}>
                  {w.site}
                </span>
                <span
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold group-hover:gap-2.5 transition-all"
                  style={{ color: theme.accent }}
                >
                  Visit ↗
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── PRICING ──────────────────────────────────────────────────────────
export function Pricing({ theme }: { theme: Theme }) {
  return (
    <section id="pricing" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <Eyebrow theme={theme}>Transparent pricing</Eyebrow>
        <h2
          className="font-semibold tracking-tight text-[clamp(2rem,4.4vw,3.4rem)] leading-[1.02] mt-5 max-w-3xl text-balance"
          style={{ fontFamily: theme.fontDisplay, color: theme.ink }}
        >
          Every cost,{" "}
          <span style={{ color: theme.accent, fontFamily: theme.fontAccent }}>on this page.</span>
        </h2>
        <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-pretty" style={{ color: theme.inkSoft }}>
          Full transparency from quote to launch. Here's exactly what you pay — the base build,
          optional add-ons, and the ongoing hosting and domain. Most sites total{" "}
          <span className="font-semibold" style={{ color: theme.ink }}>$995–$1,690</span>{" "}
          to build.
        </p>

        {/* One-time block */}
        <div className="mt-12 grid lg:grid-cols-12 gap-5">
          <div
            className={`lg:col-span-7 ${theme.borderRadius} ${theme.borderWidth} p-8 sm:p-10 relative overflow-hidden`}
            style={{ background: theme.card, borderColor: theme.border }}
          >
            <span
              className="absolute top-0 right-0 px-4 py-1.5 text-[11px] uppercase tracking-[0.16em] font-semibold"
              style={{
                background: theme.accent,
                color: theme.accentInk,
                borderBottomLeftRadius: theme.borderRadius === "rounded-none" ? 0 : "1rem",
              }}
            >
              One-time · starting at
            </span>
            <p
              className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-3"
              style={{ color: theme.accent, fontFamily: theme.fontMono }}
            >
              The Custom Website
            </p>
            <div className="flex items-baseline gap-2">
              <span
                className="text-[88px] leading-none"
                style={{ fontFamily: theme.fontDisplay, color: theme.ink, fontWeight: 600 }}
              >
                $995
              </span>
              <span className="text-sm" style={{ color: theme.inkMuted }}>one-time</span>
            </div>
            <p className="mt-4 text-[15px] leading-relaxed max-w-md" style={{ color: theme.inkSoft }}>
              {PRICING.base.blurb}
            </p>
            <ul className="mt-7 grid sm:grid-cols-2 gap-y-2.5 gap-x-6">
              {PRICING.base.includes.map((i) => (
                <li key={i} className="flex items-start gap-2 text-[14px]" style={{ color: theme.ink }}>
                  <CheckMark color={theme.accent} />
                  {i}
                </li>
              ))}
            </ul>
            <Link
              href="/start"
              className="mt-9 inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold"
              style={{
                background: theme.ink,
                color: theme.bg,
                borderRadius: theme.borderRadius === "rounded-none" ? 0 : 9999,
              }}
            >
              Start your intake
              <span aria-hidden>→</span>
            </Link>
          </div>

          <div className="lg:col-span-5 space-y-3">
            {PRICING.addons.map((a) => (
              <div
                key={a.name}
                className={`${theme.borderRadius} ${theme.borderWidth} p-5`}
                style={{ background: theme.bgAlt, borderColor: theme.border }}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h4
                    className="text-xl"
                    style={{ fontFamily: theme.fontDisplay, color: theme.ink, fontWeight: 600 }}
                  >
                    {a.name}
                  </h4>
                  <span
                    className="text-sm font-semibold whitespace-nowrap"
                    style={{ color: theme.accent, fontFamily: theme.fontMono }}
                  >
                    {a.price ? `+$${a.price}` : "Quoted"}
                    {a.unit && (
                      <span className="text-xs ml-1" style={{ color: theme.inkMuted }}>
                        {a.unit}
                      </span>
                    )}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: theme.inkSoft }}>
                  {a.blurb}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recurring after launch */}
        <div className="mt-12">
          <div className="flex items-baseline justify-between flex-wrap gap-3 mb-5">
            <p
              className="text-[11px] uppercase tracking-[0.22em] font-semibold"
              style={{ color: theme.accent, fontFamily: theme.fontMono }}
            >
              <span className="inline-block h-px w-8 align-middle mr-3" style={{ background: theme.accent }} />
              Ongoing after launch
            </p>
            <p className="text-[13px]" style={{ color: theme.inkMuted }}>
              Optional. Bring your own host & registrar if you'd rather.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {/* Hosting card (spans 2) */}
            <div
              className={`md:col-span-2 ${theme.borderRadius} ${theme.borderWidth} p-7 relative overflow-hidden`}
              style={{ background: theme.card, borderColor: theme.border }}
            >
              <div className="flex items-baseline justify-between flex-wrap gap-3">
                <div>
                  <h4
                    className="text-[26px]"
                    style={{ fontFamily: theme.fontDisplay, color: theme.ink, fontWeight: 600 }}
                  >
                    Hosting
                  </h4>
                  <p className="mt-2 max-w-md text-[14px] leading-relaxed" style={{ color: theme.inkSoft }}>
                    {PRICING.recurring[0].blurb}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className="text-[36px] leading-none"
                    style={{ fontFamily: theme.fontDisplay, color: theme.ink, fontWeight: 600 }}
                  >
                    ${PRICING.recurring[0].annual}
                    <span className="text-sm" style={{ color: theme.inkMuted }}> / year</span>
                  </p>
                  <p className="mt-1 text-[13px]" style={{ color: theme.inkSoft }}>
                    or ${PRICING.recurring[0].monthly}/month
                  </p>
                  <p
                    className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] font-semibold rounded-full"
                    style={{ background: theme.accent, color: theme.accentInk }}
                  >
                    Save ${PRICING.recurring[0].annualSavings} annually
                  </p>
                </div>
              </div>
              <ul className="mt-6 pt-5 grid sm:grid-cols-2 gap-y-1.5 gap-x-6 border-t" style={{ borderColor: theme.border }}>
                {[
                  "Fast global CDN delivery",
                  "Automatic deploys on every update",
                  "SSL certificate included",
                  "99.99% uptime monitoring",
                  "Daily backups",
                  "DDoS protection",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13px]" style={{ color: theme.inkSoft }}>
                    <CheckMark color={theme.accent} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Domain card */}
            <div
              className={`${theme.borderRadius} ${theme.borderWidth} p-7`}
              style={{ background: theme.card, borderColor: theme.border }}
            >
              <h4
                className="text-[26px]"
                style={{ fontFamily: theme.fontDisplay, color: theme.ink, fontWeight: 600 }}
              >
                Domain
              </h4>
              <p className="mt-2 text-[14px] leading-relaxed" style={{ color: theme.inkSoft }}>
                {PRICING.recurring[1].blurb}
              </p>
              <p
                className="mt-6 text-[36px] leading-none"
                style={{ fontFamily: theme.fontDisplay, color: theme.ink, fontWeight: 600 }}
              >
                ${PRICING.recurring[1].annual}
                <span className="text-sm" style={{ color: theme.inkMuted }}> / year</span>
              </p>
              <p className="mt-1 text-[12px]" style={{ color: theme.inkMuted, fontFamily: theme.fontMono }}>
                Standard .com or .ca
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────
export function Faq({ theme }: { theme: Theme }) {
  return (
    <section id="faq" className="py-24 sm:py-32" style={{ background: theme.bgAlt }}>
      <div className="mx-auto max-w-4xl px-6">
        <Eyebrow theme={theme}>FAQ</Eyebrow>
        <h2
          className="font-semibold tracking-tight text-[clamp(2rem,4.4vw,3.4rem)] leading-[1.02] mt-5 max-w-3xl text-balance"
          style={{ fontFamily: theme.fontDisplay, color: theme.ink }}
        >
          The questions we get most.
        </h2>

        <div
          className={`mt-12 ${theme.borderRadius} ${theme.borderWidth} overflow-hidden`}
          style={{ background: theme.card, borderColor: theme.borderStrong }}
        >
          {FAQS.map((f, i) => (
            <details
              key={f.q}
              className="group"
              style={i < FAQS.length - 1 ? { borderBottom: `1px solid ${theme.border}` } : undefined}
            >
              <summary className="cursor-pointer list-none p-6 flex items-start justify-between gap-6">
                <div className="flex items-baseline gap-5 flex-1">
                  <span
                    className="font-mono text-[11px] pt-1.5 shrink-0"
                    style={{ color: theme.accent, fontFamily: theme.fontMono }}
                  >
                    Q{String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="text-[19px] leading-tight text-balance"
                    style={{ fontFamily: theme.fontDisplay, color: theme.ink, fontWeight: 600 }}
                  >
                    {f.q}
                  </span>
                </div>
                <span
                  className="shrink-0 w-7 h-7 rounded-full border flex items-center justify-center transition group-open:rotate-45"
                  style={{
                    borderColor: theme.border,
                    color: theme.inkSoft,
                  }}
                >
                  <span className="block leading-none text-lg">+</span>
                </span>
              </summary>
              <p
                className="pl-[3.4rem] pr-6 pb-6 text-[15px] leading-relaxed text-pretty"
                style={{ color: theme.inkSoft }}
              >
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FINAL CTA ────────────────────────────────────────────────────────
export function FinalCta({ theme }: { theme: Theme }) {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div
          className={`relative overflow-hidden ${theme.borderRadius} p-10 sm:p-16`}
          style={{ background: theme.ink, color: theme.bg }}
        >
          <div
            aria-hidden
            className="absolute -top-1/3 -right-1/4 w-[500px] h-[500px] rounded-full blur-3xl"
            style={{ background: `${theme.accent}33` }}
          />
          <div className="relative max-w-2xl">
            <p
              className="text-[11px] uppercase tracking-[0.22em] font-semibold mb-4"
              style={{ color: theme.accent, fontFamily: theme.fontMono }}
            >
              Ready to start
            </p>
            <h2
              className="font-semibold tracking-tight text-[clamp(2rem,4.5vw,3.6rem)] leading-[1.02] text-balance"
              style={{ fontFamily: theme.fontDisplay }}
            >
              A site you'd actually be proud to send to a customer.
            </h2>
            <p className="mt-5 text-[17px] max-w-prose" style={{ color: `${theme.bg}b3` }}>
              Fill out the intake form. Five business days later, three custom design concepts in
              your inbox — no payment, no commitment.
            </p>
            <Link
              href="/start"
              className="mt-8 inline-flex items-center gap-2 px-7 py-4 text-[15px] font-semibold"
              style={{
                background: theme.accent,
                color: theme.accentInk,
                borderRadius: theme.borderRadius === "rounded-none" ? 0 : 9999,
              }}
            >
              Start your site
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────
export function Footer({ theme }: { theme: Theme }) {
  return (
    <footer className="border-t" style={{ borderColor: theme.border }}>
      <div className="mx-auto max-w-7xl px-6 py-10 flex flex-wrap items-center justify-between gap-4 text-[13px]" style={{ color: theme.inkMuted }}>
        <p>© {new Date().getFullYear()} Simple Site. Built in Calgary, AB.</p>
        <a href="mailto:hello@simplesite.co" style={{ color: theme.inkSoft }} className="hover:opacity-100">
          hello@simplesite.co
        </a>
      </div>
    </footer>
  );
}

// ─── Shared bits ──────────────────────────────────────────────────────
function Eyebrow({ theme, children }: { theme: Theme; children: React.ReactNode }) {
  return (
    <p
      className="text-[11px] uppercase tracking-[0.22em] font-semibold inline-flex items-center gap-3"
      style={{ color: theme.accent, fontFamily: theme.fontMono }}
    >
      <span className="inline-block h-px w-8" style={{ background: theme.accent }} />
      {children}
    </p>
  );
}

function CheckMark({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" className="mt-1 shrink-0" aria-hidden>
      <path
        d="M3 8.5l3.5 3.5L13 5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export { CtaPrimary };
