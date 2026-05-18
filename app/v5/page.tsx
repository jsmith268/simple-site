import type { Metadata } from "next";
import Link from "next/link";
import { FAQS, HERO, PRICING, PRINCIPLES, PROCESS, WORK } from "@/lib/content";

export const metadata: Metadata = {
  title: "Simple Site — $995. Three concepts. Fourteen days. No bullshit.",
  description:
    "Brutally simple websites for service businesses that need to convert. Fixed price. Live in two weeks.",
};

// V5 — BRUTALIST CONFIDENT.
// Stark black / off-white / electric yellow / hot red.
// Space Grotesk (chunky geometric) + Newsreader italic for refined contrast.

const INK = "#0a0a0a";
const PAPER = "#f1efe9";
const ZAP = "#f1ff39";
const HOT = "#ff3b1f";

export default function V5Page() {
  return (
    <main
      style={{ fontFamily: "var(--font-brutalist)", background: PAPER, color: INK }}
      className="selection:bg-[#f1ff39] selection:text-black"
    >
      <Nav />
      <Hero />
      <Marquee />
      <HowWeWork />
      <Work />
      <Pricing />
      <Faq />
      <FinalCta />
      <Footer />
    </main>
  );
}

function Nav() {
  return (
    <header
      className="sticky top-0 z-30 border-b-2"
      style={{ background: PAPER, borderColor: INK }}
    >
      <div className="mx-auto max-w-[1400px] px-6 h-[60px] flex items-center justify-between">
        <Link href="/v5" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <span className="w-7 h-7 flex items-center justify-center" style={{ background: INK, color: ZAP }}>
            S
          </span>
          <span>Simple Site</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <a href="#how" className="hover:text-[#ff3b1f]">How</a>
          <a href="#work" className="hover:text-[#ff3b1f]">Work</a>
          <a href="#pricing" className="hover:text-[#ff3b1f]">Pricing</a>
          <a href="#faq" className="hover:text-[#ff3b1f]">FAQ</a>
        </nav>
        <Link
          href="/start"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold border-2 hover:bg-[#f1ff39] transition-colors"
          style={{ background: INK, color: PAPER, borderColor: INK }}
        >
          Start →
        </Link>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative min-h-[calc(100svh-60px)] flex items-center overflow-hidden">
      <div className="mx-auto max-w-[1400px] px-6 w-full py-10">
        <div className="flex items-center gap-4 mb-8">
          <span
            className="inline-flex items-center gap-2 px-3 py-1 text-[11px] uppercase tracking-[0.18em] font-bold border-2"
            style={{ background: ZAP, color: INK, borderColor: INK }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: INK }} />
            {HERO.eyebrow}
          </span>
          <span className="h-px flex-1" style={{ background: INK }} />
        </div>

        <h1
          style={{ fontFamily: "var(--font-brutalist)" }}
          className="font-bold tracking-[-0.04em] text-[clamp(2.8rem,9vw,8.4rem)] leading-[0.86] uppercase text-balance"
        >
          Most websites are{" "}
          <span className="inline-block px-3 -mx-1" style={{ background: INK, color: ZAP }}>
            boring
          </span>
          .
          <br />
          <span
            style={{ fontFamily: "var(--font-print)", color: HOT }}
            className="italic font-normal normal-case tracking-tight"
          >
            Yours doesn't have to be.
          </span>
        </h1>

        <p className="mt-8 max-w-2xl text-[18px] leading-[1.5] text-pretty" style={{ color: `${INK}cc` }}>
          {HERO.description}{" "}
          <span className="font-bold">No templates. No discovery calls.</span>
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link
            href={HERO.primaryCta.href}
            className="group inline-flex items-center gap-3 px-7 py-4 text-[15px] font-bold border-2 hover:bg-[#ff3b1f] hover:border-[#ff3b1f] transition-colors"
            style={{ background: INK, color: PAPER, borderColor: INK }}
          >
            {HERO.primaryCta.label}
            <span aria-hidden className="text-lg leading-none">→</span>
          </Link>
          <a
            href={HERO.secondaryCta.href}
            className="inline-flex items-center gap-2 px-6 py-4 text-[15px] font-bold border-2 hover:bg-[#0a0a0a] hover:text-[#f1ff39] transition-colors"
            style={{ borderColor: INK }}
          >
            {HERO.secondaryCta.label} ↓
          </a>
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const words = [
    "★ HOME SERVICES",
    "★ WELLNESS STUDIOS",
    "★ TRADES & CONTRACTORS",
    "★ BOUTIQUE RETAIL",
    "★ SOLO FOUNDERS",
    "★ MULTI-LOCATION BRANDS",
    "★ HOLDING COMPANIES",
    "★ LOCAL RESTAURANTS",
  ];
  const doubled = [...words, ...words, ...words];
  return (
    <section className="border-y-2 overflow-hidden" style={{ background: INK, color: ZAP, borderColor: INK }}>
      <div className="flex gap-12 animate-scroll-x whitespace-nowrap py-5">
        {doubled.map((w, i) => (
          <span
            key={i}
            style={{ fontFamily: "var(--font-brutalist)" }}
            className="font-bold text-2xl tracking-[-0.01em]"
          >
            {w}
          </span>
        ))}
      </div>
    </section>
  );
}

function HowWeWork() {
  return (
    <section id="how" className="border-b-2" style={{ borderColor: INK }}>
      <div className="mx-auto max-w-[1400px] px-6 py-24">
        <BigEyebrow>How we work</BigEyebrow>
        <h2
          style={{ fontFamily: "var(--font-brutalist)" }}
          className="font-bold text-[clamp(2.6rem,7vw,6.2rem)] leading-[0.9] tracking-[-0.035em] uppercase mt-6 max-w-5xl text-balance"
        >
          Three steps.{" "}
          <span style={{ fontFamily: "var(--font-print)", color: HOT }} className="italic font-normal normal-case">
            Nothing fancy.
          </span>
        </h2>

        <div className="mt-14 grid md:grid-cols-3 border-2" style={{ borderColor: INK }}>
          {PROCESS.map((p, i, arr) => (
            <article
              key={p.n}
              className={`p-8 ${i < arr.length - 1 ? "border-b-2 md:border-b-0 md:border-r-2" : ""}`}
              style={{
                borderColor: INK,
                background: i === 0 ? ZAP : i === 2 ? INK : PAPER,
                color: i === 2 ? PAPER : INK,
              }}
            >
              <div className="flex items-baseline justify-between mb-8">
                <span
                  style={{ fontFamily: "var(--font-brutalist)" }}
                  className="font-bold text-[80px] leading-none tracking-[-0.04em]"
                >
                  {p.n}
                </span>
                <span
                  className="text-[11px] uppercase tracking-[0.2em] font-bold"
                  style={{ color: i === 2 ? `${PAPER}80` : `${INK}80` }}
                >
                  Step {i + 1}
                </span>
              </div>
              <h3
                style={{ fontFamily: "var(--font-brutalist)" }}
                className="font-bold text-2xl tracking-tight text-balance"
              >
                {p.title}
              </h3>
              <p
                className="mt-3 text-[15px] leading-relaxed text-pretty"
                style={{ color: i === 2 ? `${PAPER}b3` : `${INK}b3` }}
              >
                {p.body}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-print)",
                  borderColor: i === 2 ? `${PAPER}33` : `${INK}33`,
                  color: i === 2 ? `${PAPER}99` : `${INK}99`,
                }}
                className="mt-5 pt-5 border-t-2 text-sm italic"
              >
                — {p.detail}
              </p>
            </article>
          ))}
        </div>

        {/* Principles row */}
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PRINCIPLES.map((p, i) => (
            <div
              key={p.title}
              className="border-2 p-5 transition-colors hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_#0a0a0a]"
              style={{ borderColor: INK, background: PAPER }}
            >
              <p
                className="text-[10px] uppercase tracking-[0.2em] font-bold mb-3"
                style={{ color: i % 2 === 0 ? HOT : INK }}
              >
                ★ {String(i + 1).padStart(2, "0")}
              </p>
              <h4
                style={{ fontFamily: "var(--font-brutalist)" }}
                className="font-bold text-lg tracking-tight"
              >
                {p.title}
              </h4>
              <p className="mt-2 text-[13px] leading-relaxed" style={{ color: `${INK}99` }}>
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Work() {
  return (
    <section id="work">
      <div className="mx-auto max-w-[1400px] px-6 py-24">
        <BigEyebrow>Selected work</BigEyebrow>
        <h2
          style={{ fontFamily: "var(--font-brutalist)" }}
          className="font-bold text-[clamp(2.6rem,7vw,6.2rem)] leading-[0.9] tracking-[-0.035em] uppercase mt-6 max-w-5xl text-balance"
        >
          Real businesses.{" "}
          <span style={{ fontFamily: "var(--font-print)", color: HOT }} className="italic font-normal normal-case">
            Real URLs.
          </span>
        </h2>
      </div>
      <div className="border-y-2" style={{ borderColor: INK }}>
        {WORK.map((w, i) => (
          <ProjectBand key={w.name} project={w} index={i} last={i === WORK.length - 1} />
        ))}
      </div>
    </section>
  );
}

function ProjectBand({
  project: w,
  index,
  last,
}: {
  project: (typeof WORK)[number];
  index: number;
  last: boolean;
}) {
  // Alternate the band style (paper / ink / zap) — keeps Brutalist alternation
  // without inventing a brand palette per project.
  const styles = [
    { bg: PAPER, fg: INK, accent: HOT },
    { bg: INK, fg: PAPER, accent: ZAP },
    { bg: ZAP, fg: INK, accent: HOT },
  ];
  const s = styles[index % styles.length];
  return (
    <a
      href={w.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block transition-colors"
      style={{
        background: s.bg,
        color: s.fg,
        borderBottom: last ? "none" : `2px solid ${INK}`,
      }}
    >
      <div className="mx-auto max-w-[1400px] px-6 py-14 grid md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-1">
          <span
            style={{ fontFamily: "var(--font-brutalist)" }}
            className="font-bold text-[80px] leading-none tracking-[-0.04em]"
          >
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <div className="md:col-span-7">
          <p
            className="text-[10px] uppercase tracking-[0.22em] font-bold mb-3"
            style={{ color: s.accent }}
          >
            ★ {w.tag} · {w.location}
          </p>
          <h3
            style={{ fontFamily: "var(--font-brutalist)" }}
            className="font-bold text-[clamp(2.4rem,5vw,4.4rem)] leading-[0.9] tracking-[-0.035em] uppercase text-balance"
          >
            {w.name}
          </h3>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed" style={{ color: `${s.fg}cc` }}>
            {w.blurb}
          </p>
        </div>
        <div className="md:col-span-4 flex md:flex-col md:items-end gap-4">
          <span
            style={{ fontFamily: "var(--font-print)" }}
            className="italic text-xl"
          >
            {w.site}
          </span>
          <span
            className="inline-flex items-center gap-2 text-sm font-bold border-2 px-5 py-3 transition-transform group-hover:translate-x-1"
            style={{ borderColor: s.fg, color: s.fg }}
          >
            Visit site ↗
          </span>
        </div>
      </div>
    </a>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="border-b-2" style={{ borderColor: INK }}>
      <div className="mx-auto max-w-[1400px] px-6 py-24">
        <BigEyebrow>Transparent pricing</BigEyebrow>
        <h2
          style={{ fontFamily: "var(--font-brutalist)" }}
          className="font-bold text-[clamp(2.6rem,7vw,6.2rem)] leading-[0.9] tracking-[-0.035em] uppercase mt-6 max-w-5xl text-balance"
        >
          One price.{" "}
          <span style={{ fontFamily: "var(--font-print)", color: HOT }} className="italic font-normal normal-case">
            No mystery line items.
          </span>
        </h2>
        <p className="mt-6 max-w-2xl text-[16px] leading-relaxed" style={{ color: `${INK}99` }}>
          Most sites we ship come in between{" "}
          <span className="font-bold" style={{ color: INK }}>$995 and $1,690 total</span>. Here's
          exactly what you pay — and the things that will never appear on your invoice.
        </p>

        <div className="mt-12 border-2 grid lg:grid-cols-12" style={{ borderColor: INK }}>
          <div className="lg:col-span-8 p-8 sm:p-12 lg:border-r-2" style={{ borderColor: INK, background: ZAP }}>
            <div className="flex items-baseline justify-between flex-wrap gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] font-bold">The Custom Website</p>
                <p
                  style={{ fontFamily: "var(--font-brutalist)" }}
                  className="font-bold text-[140px] sm:text-[180px] leading-[0.82] tracking-[-0.05em] mt-2"
                >
                  $995
                </p>
              </div>
            </div>
            <p className="mt-6 max-w-xl text-[16px] leading-relaxed" style={{ color: `${INK}cc` }}>
              {PRICING.base.blurb}
            </p>
            <ul className="mt-8 grid sm:grid-cols-2 gap-2.5">
              {PRICING.base.includes.map((i) => (
                <li key={i} className="flex items-start gap-2 text-[14px] font-medium">
                  <span className="mt-0.5">✓</span>
                  {i}
                </li>
              ))}
            </ul>
            <Link
              href="/start"
              className="mt-10 inline-flex items-center gap-3 px-7 py-4 text-[15px] font-bold border-2 hover:bg-[#ff3b1f] hover:text-white transition-colors"
              style={{ background: INK, color: PAPER, borderColor: INK }}
            >
              Start your intake →
            </Link>
          </div>

          <div className="lg:col-span-4">
            <div className="p-8 border-b-2" style={{ borderColor: INK }}>
              <p className="text-[11px] uppercase tracking-[0.2em] font-bold mb-5">Add-ons</p>
              <ul className="space-y-5">
                {PRICING.addons.map((a) => (
                  <li key={a.name} className="flex items-baseline justify-between gap-3">
                    <div>
                      <p className="font-bold text-[15px]">{a.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: `${INK}80` }}>{a.blurb}</p>
                    </div>
                    <p
                      style={{ fontFamily: "var(--font-brutalist)", color: HOT }}
                      className="font-bold text-2xl whitespace-nowrap"
                    >
                      {a.price ? `+$${a.price}` : "Quote"}
                      {a.unit && <span className="text-[10px] block text-right" style={{ color: `${INK}66` }}>{a.unit}</span>}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-8" style={{ background: INK, color: PAPER }}>
              <p className="text-[11px] uppercase tracking-[0.2em] font-bold mb-4" style={{ color: ZAP }}>
                Never on the invoice
              </p>
              <ul className="space-y-1.5 text-[13px]" style={{ color: `${PAPER}b3` }}>
                {PRICING.notIncluded.map((n) => (
                  <li key={n} className="flex items-baseline gap-2">
                    <span style={{ color: HOT }}>×</span> {n}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section id="faq" className="border-b-2" style={{ borderColor: INK }}>
      <div className="mx-auto max-w-[1400px] px-6 py-24">
        <BigEyebrow>FAQ</BigEyebrow>
        <h2
          style={{ fontFamily: "var(--font-brutalist)" }}
          className="font-bold text-[clamp(2.6rem,7vw,6.2rem)] leading-[0.9] tracking-[-0.035em] uppercase mt-6 max-w-5xl text-balance"
        >
          Questions{" "}
          <span style={{ fontFamily: "var(--font-print)", color: HOT }} className="italic font-normal normal-case">
            we get most.
          </span>
        </h2>
        <div className="mt-12 border-2" style={{ borderColor: INK }}>
          {FAQS.map((f, i, arr) => (
            <details
              key={f.q}
              className={`group ${i < arr.length - 1 ? "border-b-2" : ""} open:bg-[#f1ff39]`}
              style={{ borderColor: INK }}
            >
              <summary className="cursor-pointer list-none p-6 flex items-start justify-between gap-6">
                <div className="flex items-baseline gap-5">
                  <span
                    style={{ fontFamily: "var(--font-brutalist)" }}
                    className="font-bold text-2xl tracking-tight shrink-0"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    style={{ fontFamily: "var(--font-brutalist)" }}
                    className="font-bold text-xl tracking-tight text-balance"
                  >
                    {f.q}
                  </span>
                </div>
                <span className="shrink-0 w-9 h-9 border-2 flex items-center justify-center text-2xl leading-none group-open:bg-[#0a0a0a] group-open:text-[#f1ff39] transition-colors" style={{ borderColor: INK }}>
                  <span className="block group-open:rotate-45 transition-transform">+</span>
                </span>
              </summary>
              <p className="px-6 pb-6 pl-[3.6rem] text-[15px] leading-relaxed text-pretty" style={{ color: `${INK}cc` }}>
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section style={{ background: INK, color: PAPER }}>
      <div className="mx-auto max-w-[1400px] px-6 py-24">
        <div className="flex items-center gap-4 mb-10">
          <span
            className="inline-flex items-center gap-2 px-3 py-1 text-[11px] uppercase tracking-[0.18em] font-bold"
            style={{ background: ZAP, color: INK }}
          >
            Ready when you are
          </span>
          <span className="h-px flex-1" style={{ background: `${PAPER}40` }} />
        </div>
        <h2
          style={{ fontFamily: "var(--font-brutalist)" }}
          className="font-bold text-[clamp(3rem,9vw,8.5rem)] leading-[0.85] tracking-[-0.045em] uppercase text-balance"
        >
          Stop sending people
          <br />
          to a <span style={{ background: ZAP, color: INK }} className="inline-block px-3 -mx-1">boring</span>
          <br />
          <span style={{ fontFamily: "var(--font-print)", color: ZAP }} className="italic font-normal normal-case tracking-tight">
            website.
          </span>
        </h2>
        <div className="mt-12 grid md:grid-cols-12 gap-8 items-end">
          <p className="md:col-span-7 text-[18px] leading-[1.5] max-w-2xl text-pretty" style={{ color: `${PAPER}b3` }}>
            Eight minutes of intake. Five business days. Three concepts. One website that makes
            your phone ring.
          </p>
          <div className="md:col-span-5 flex flex-wrap justify-start md:justify-end gap-3">
            <Link
              href="/start"
              className="inline-flex items-center gap-3 px-7 py-4 text-[16px] font-bold border-2 hover:bg-[#ff3b1f] hover:border-[#ff3b1f] transition-colors"
              style={{ background: ZAP, color: INK, borderColor: ZAP }}
            >
              Start your site — $995 →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t-2" style={{ background: PAPER, borderColor: INK }}>
      <div className="mx-auto max-w-[1400px] px-6 py-10 flex flex-wrap items-center justify-between gap-6">
        <Link href="/v5" className="flex items-center gap-2 font-bold">
          <span className="w-7 h-7 flex items-center justify-center" style={{ background: INK, color: ZAP }}>
            S
          </span>
          Simple Site
        </Link>
        <p className="text-[11px] uppercase tracking-[0.2em] font-bold" style={{ color: `${INK}80` }}>
          © {new Date().getFullYear()} · Calgary, AB
        </p>
        <div className="flex items-center gap-5 text-sm">
          <a href="mailto:hello@simplesite.co" className="hover:text-[#ff3b1f] font-medium">hello@simplesite.co</a>
          <Link href="/" className="hover:text-[#ff3b1f] font-medium">All concepts</Link>
        </div>
      </div>
    </footer>
  );
}

function BigEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="inline-flex items-center gap-3">
      <span className="w-2 h-2 rotate-45" style={{ background: HOT }} />
      <span className="text-[12px] uppercase tracking-[0.22em] font-bold">{children}</span>
      <span className="h-px w-12" style={{ background: INK }} />
    </p>
  );
}
