import type { Metadata } from "next";
import Link from "next/link";
import { FAQS, HERO, PRICING, PRINCIPLES, PROCESS, WORK } from "@/lib/content";

export const metadata: Metadata = {
  title: "Simple Site — A website your business deserves. From $995.",
  description:
    "Bold, custom-built websites for service businesses. Three original directions, $995 to start, live in two weeks.",
};

// V3 — BOLD & EXPRESSIVE. Bricolage Grotesque + Instrument Serif italics.
// Cream paper, deep ink, electric lime, hot magenta.

export default function V3Page() {
  return (
    <main
      style={{ fontFamily: "var(--font-sans)" }}
      className="bg-[#fbf6e9] text-[#0d1410] selection:bg-[#d4ff5a] selection:text-[#0d1410] overflow-hidden"
    >
      <Nav />
      <Hero />
      <Pillars />
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
    <header className="sticky top-0 z-40 bg-[#fbf6e9]/85 backdrop-blur border-b border-[#0d1410]/[0.06]">
      <div className="mx-auto max-w-7xl px-6 h-[68px] flex items-center justify-between">
        <Link
          href="/v3"
          style={{ fontFamily: "var(--font-grotesk)" }}
          className="font-bold text-[20px] tracking-[-0.02em] flex items-center gap-2"
        >
          <LogoMark />
          simplesite
        </Link>
        <nav className="hidden md:flex items-center gap-9 text-sm font-medium text-[#0d1410]/65">
          <a href="#how" className="hover:text-[#0d1410]">How we work</a>
          <a href="#work" className="hover:text-[#0d1410]">Work</a>
          <a href="#pricing" className="hover:text-[#0d1410]">Pricing</a>
          <a href="#faq" className="hover:text-[#0d1410]">FAQ</a>
        </nav>
        <Link
          href="/start"
          className="group inline-flex items-center gap-2 rounded-full bg-[#0d1410] text-[#fbf6e9] px-5 py-2.5 text-sm font-semibold hover:bg-[#e92e8f] transition-colors"
        >
          Start
          <ArrowCircle />
        </Link>
      </div>
    </header>
  );
}

function LogoMark() {
  return (
    <span className="relative inline-flex w-7 h-7 rounded-full bg-[#0d1410] items-center justify-center">
      <span className="w-3.5 h-3.5 rounded-full bg-[#d4ff5a]" />
      <span className="absolute right-0.5 bottom-0.5 w-2 h-2 rounded-full bg-[#e92e8f]" />
    </span>
  );
}

function ArrowCircle() {
  return (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#d4ff5a] text-[#0d1410] text-[10px] font-bold group-hover:rotate-[-25deg] transition-transform">
      ↗
    </span>
  );
}

function Hero() {
  return (
    <section className="relative min-h-[calc(100svh-68px)] flex items-center overflow-hidden">
      <div
        aria-hidden
        className="absolute top-10 -right-32 w-[420px] h-[420px] rounded-full opacity-70 blur-2xl animate-float-slow"
        style={{ background: "radial-gradient(circle, #d4ff5a 0%, transparent 65%)" }}
      />
      <div
        aria-hidden
        className="absolute bottom-0 -left-32 w-[480px] h-[480px] rounded-full opacity-55 blur-2xl animate-float-slow"
        style={{
          background: "radial-gradient(circle, #ffb3d9 0%, transparent 65%)",
          animationDelay: "-7s",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 w-full py-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0d1410] text-[#fbf6e9] text-[11px] uppercase tracking-[0.16em] font-semibold mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#d4ff5a] animate-pulse-dot" />
          {HERO.eyebrow}
        </div>

        <h1
          style={{ fontFamily: "var(--font-grotesk)" }}
          className="font-bold tracking-[-0.035em] text-[clamp(3rem,8.5vw,7.4rem)] leading-[0.9] text-balance max-w-5xl"
        >
          A website
          <br />
          your business{" "}
          <span className="relative inline-block">
            <em
              style={{ fontFamily: "var(--font-display-italic)" }}
              className="italic font-normal text-[#e92e8f]"
            >
              deserves
            </em>
            <Squiggle />
          </span>
          <span className="text-[#0d1410]/30">.</span>
        </h1>

        <p className="mt-8 text-[18px] leading-[1.5] text-[#0d1410]/75 max-w-2xl text-pretty">
          {HERO.description}
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Link
            href={HERO.primaryCta.href}
            className="group inline-flex items-center gap-3 rounded-full bg-[#0d1410] text-[#fbf6e9] pl-7 pr-2 py-2 text-[16px] font-semibold hover:bg-[#e92e8f] transition-colors"
          >
            {HERO.primaryCta.label}
            <span className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#d4ff5a] text-[#0d1410]">
              →
            </span>
          </Link>
          <a
            href={HERO.secondaryCta.href}
            className="inline-flex items-center gap-2 rounded-full border-2 border-[#0d1410] px-6 py-3 text-[15px] font-semibold hover:bg-[#0d1410] hover:text-[#fbf6e9] transition-colors"
          >
            {HERO.secondaryCta.label}
          </a>
        </div>
      </div>
    </section>
  );
}

function Squiggle() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 220 14"
      className="absolute -bottom-1 sm:-bottom-2 left-0 w-full h-3 text-[#d4ff5a]"
      preserveAspectRatio="none"
    >
      <path
        d="M2 8 Q 30 -2, 60 6 T 120 6 T 180 6 T 218 8"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function Pillars() {
  const items = [
    { k: "01", t: "Original", b: "No templates. Every concept hand-designed for your business." },
    { k: "02", t: "Fixed", b: "$995 base. The price you see is what you pay." },
    { k: "03", t: "Fast", b: "Live in fourteen days. Three concepts in five." },
    { k: "04", t: "Honest", b: "Five free revisions. No surprise scope-creep invoices." },
  ];
  return (
    <section className="border-y-2 border-[#0d1410] bg-[#0d1410] text-[#fbf6e9]">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((it) => (
            <div key={it.k} className="border-l-2 border-[#d4ff5a] pl-5">
              <p className="font-mono text-[11px] text-[#d4ff5a] uppercase tracking-[0.2em] font-bold">
                {it.k}
              </p>
              <p style={{ fontFamily: "var(--font-grotesk)" }} className="text-3xl font-bold mt-2 tracking-[-0.02em]">
                {it.t}
              </p>
              <p className="text-sm text-[#fbf6e9]/65 mt-2 leading-relaxed">{it.b}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowWeWork() {
  return (
    <section id="how" className="py-28 sm:py-36 relative">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-end justify-between gap-8 mb-14 flex-wrap">
          <div className="max-w-2xl">
            <Eyebrow>How we work</Eyebrow>
            <h2
              style={{ fontFamily: "var(--font-grotesk)" }}
              className="font-bold text-[clamp(2.8rem,6vw,5.5rem)] leading-[0.92] tracking-[-0.03em] mt-5 text-balance"
            >
              From{" "}
              <em style={{ fontFamily: "var(--font-display-italic)" }} className="italic font-normal text-[#e92e8f]">
                idea
              </em>{" "}
              to live{" "}
              <em style={{ fontFamily: "var(--font-display-italic)" }} className="italic font-normal text-[#e92e8f]">
                in two weeks
              </em>
              .
            </h2>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {PROCESS.map((p, i) => (
            <div
              key={p.n}
              className="relative rounded-3xl bg-white border-2 border-[#0d1410] p-7 hover:-translate-y-1 transition-transform"
              style={{ rotate: i === 0 ? "-1deg" : i === 2 ? "1deg" : "0deg" }}
            >
              <div className="flex items-start justify-between">
                <span
                  style={{ fontFamily: "var(--font-grotesk)" }}
                  className="font-black text-7xl text-[#0d1410] leading-none"
                >
                  {p.n}
                </span>
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                  style={{
                    background: ["#d4ff5a", "#ffb3d9", "#0d1410"][i],
                    color: i === 2 ? "#d4ff5a" : "#0d1410",
                  }}
                >
                  {i + 1}
                </span>
              </div>
              <h3
                style={{ fontFamily: "var(--font-grotesk)" }}
                className="font-bold text-2xl mt-6 tracking-tight text-balance"
              >
                {p.title}
              </h3>
              <p className="mt-3 text-[15px] text-[#0d1410]/70 leading-relaxed text-pretty">{p.body}</p>
              <p
                style={{ fontFamily: "var(--font-display-italic)" }}
                className="mt-4 pt-4 border-t border-[#0d1410]/10 text-sm italic text-[#0d1410]/55"
              >
                — {p.detail}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PRINCIPLES.map((p, i) => (
            <div
              key={p.title}
              className="rounded-2xl p-5"
              style={{ background: ["#d4ff5a", "#ffb3d9", "#fbf6e9", "#0d1410"][i], color: i === 3 ? "#fbf6e9" : "#0d1410" }}
            >
              <h4 style={{ fontFamily: "var(--font-grotesk)" }} className="text-lg font-bold tracking-tight">
                {p.title}
              </h4>
              <p className="mt-2 text-[13px] leading-relaxed opacity-80">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Work() {
  return (
    <section id="work" className="py-28 sm:py-36 relative bg-[#f3eedb]">
      <div
        aria-hidden
        className="absolute top-1/3 right-10 w-72 h-72 rounded-full opacity-60 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #d4ff5a 0%, transparent 65%)" }}
      />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="flex items-end justify-between gap-8 mb-14 flex-wrap">
          <div>
            <Eyebrow>Recent work</Eyebrow>
            <h2
              style={{ fontFamily: "var(--font-grotesk)" }}
              className="font-bold text-[clamp(2.8rem,6vw,5.5rem)] leading-[0.92] tracking-[-0.03em] mt-5 text-balance"
            >
              Real businesses.
              <br />
              <span className="text-[#0d1410]/40">Real URLs.</span>
            </h2>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {WORK.map((w, i) => (
            <ProjectCard key={w.name} project={w} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project: w, index }: { project: (typeof WORK)[number]; index: number }) {
  const accent = ["#d4ff5a", "#ffb3d9", "#fbf6e9"][index];
  return (
    <a
      href={w.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-[28px] overflow-hidden border-2 border-[#0d1410] bg-white hover:-translate-y-1 transition-transform flex flex-col"
      style={{ rotate: index === 1 ? "0.4deg" : index === 2 ? "-0.4deg" : "0deg" }}
    >
      <div className="p-6 flex items-center justify-between border-b-2 border-[#0d1410]" style={{ background: accent }}>
        <span
          style={{ fontFamily: "var(--font-grotesk)" }}
          className="font-black text-[40px] leading-none tracking-[-0.04em] text-[#0d1410]"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#0d1410]/75">
          {w.tag}
        </span>
      </div>
      <div className="p-7 flex-1 flex flex-col">
        <h3
          style={{ fontFamily: "var(--font-grotesk)" }}
          className="font-bold text-[28px] leading-[0.95] tracking-[-0.03em] text-balance"
        >
          {w.name}
        </h3>
        <p className="mt-2 text-[11px] uppercase tracking-[0.18em] font-bold text-[#e92e8f]">
          {w.location}
        </p>
        <p className="mt-5 text-[14px] leading-relaxed text-[#0d1410]/70 text-pretty flex-1">
          {w.blurb}
        </p>
        <div className="mt-7 pt-5 border-t-2 border-dashed border-[#0d1410]/15 flex items-center justify-between">
          <span className="font-mono text-[12px] text-[#0d1410]/60">{w.site}</span>
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#0d1410] text-[#d4ff5a] text-sm group-hover:bg-[#e92e8f] group-hover:text-white group-hover:rotate-[-25deg] transition-all">
            ↗
          </span>
        </div>
      </div>
    </a>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="py-28 sm:py-36 relative">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Eyebrow centered>Transparent pricing</Eyebrow>
          <h2
            style={{ fontFamily: "var(--font-grotesk)" }}
            className="font-bold text-[clamp(2.8rem,6vw,5.5rem)] leading-[0.92] tracking-[-0.03em] mt-5 text-balance"
          >
            One price.
            <br />
            <em style={{ fontFamily: "var(--font-display-italic)" }} className="italic font-normal text-[#e92e8f]">
              No surprises.
            </em>
          </h2>
          <p className="mt-6 text-[17px] leading-relaxed text-[#0d1410]/70 max-w-2xl mx-auto">
            No mystery line items, no 'strategy' invoices, no surprise change orders. Most sites we
            ship come in between <span className="font-semibold text-[#0d1410]">$995 and $1,690 total</span>.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 relative rounded-[32px] bg-[#0d1410] text-[#fbf6e9] p-8 sm:p-12 overflow-hidden">
            <div
              aria-hidden
              className="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-30"
              style={{ background: "radial-gradient(circle, #d4ff5a 0%, transparent 60%)" }}
            />
            <div className="relative">
              <div className="flex items-baseline justify-between flex-wrap gap-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#d4ff5a] font-bold">
                  The Custom Website
                </p>
                <span className="text-[11px] font-mono text-[#fbf6e9]/50">starting at</span>
              </div>
              <p
                style={{ fontFamily: "var(--font-grotesk)" }}
                className="font-bold text-[140px] sm:text-[180px] leading-[0.85] tracking-[-0.04em] mt-4"
              >
                $995
              </p>
              <p className="mt-5 text-[16px] text-[#fbf6e9]/75 max-w-md leading-relaxed">
                {PRICING.base.blurb}
              </p>
              <ul className="mt-8 grid sm:grid-cols-2 gap-y-2 gap-x-6">
                {PRICING.base.includes.map((i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[14px] text-[#fbf6e9]/80">
                    <span className="mt-1 shrink-0 w-4 h-4 rounded-full bg-[#d4ff5a] text-[#0d1410] flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </span>
                    {i}
                  </li>
                ))}
              </ul>
              <Link
                href="/start"
                className="group mt-10 inline-flex items-center gap-3 rounded-full bg-[#d4ff5a] text-[#0d1410] pl-7 pr-2 py-2 text-[15px] font-bold hover:bg-[#fbf6e9] transition-colors"
              >
                Start your intake
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#0d1410] text-[#d4ff5a]">
                  →
                </span>
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            {PRICING.addons.map((a, i) => (
              <div
                key={a.name}
                className="rounded-2xl bg-white border-2 border-[#0d1410] p-6"
                style={{ rotate: i === 1 ? "0.5deg" : "0deg" }}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h4 style={{ fontFamily: "var(--font-grotesk)" }} className="font-bold text-xl tracking-tight">
                    {a.name}
                  </h4>
                  <span
                    style={{
                      fontFamily: "var(--font-grotesk)",
                      color: ["#e92e8f", "#0d1410", "#e92e8f"][i],
                    }}
                    className="font-bold text-xl"
                  >
                    {a.price ? `+$${a.price}` : "Quoted"}
                  </span>
                </div>
                {a.unit && <p className="text-[11px] text-[#0d1410]/50 mt-0.5">{a.unit}</p>}
                <p className="mt-3 text-sm text-[#0d1410]/70 leading-relaxed">{a.blurb}</p>
              </div>
            ))}
            <div className="rounded-2xl border-2 border-dashed border-[#0d1410]/30 p-5">
              <p
                style={{ fontFamily: "var(--font-grotesk)" }}
                className="text-[11px] uppercase tracking-[0.18em] font-bold text-[#0d1410]/65 mb-3"
              >
                Never on the invoice
              </p>
              <ul className="space-y-1.5 text-[13px] text-[#0d1410]/65">
                {PRICING.notIncluded.map((n) => (
                  <li key={n} className="flex items-baseline gap-2">
                    <span className="text-[#e92e8f] font-bold">×</span> {n}
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
    <section id="faq" className="py-28 sm:py-36">
      <div className="mx-auto max-w-4xl px-6">
        <div className="text-center mb-14">
          <Eyebrow centered>Questions</Eyebrow>
          <h2
            style={{ fontFamily: "var(--font-grotesk)" }}
            className="font-bold text-[clamp(2.8rem,6vw,5.5rem)] leading-[0.92] tracking-[-0.03em] mt-5 text-balance"
          >
            What people{" "}
            <em style={{ fontFamily: "var(--font-display-italic)" }} className="italic font-normal text-[#e92e8f]">
              always
            </em>{" "}
            ask.
          </h2>
        </div>
        <div className="space-y-3">
          {FAQS.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl border-2 border-[#0d1410] bg-white open:bg-[#fff8d4] transition-colors"
            >
              <summary className="cursor-pointer list-none p-6 flex items-start justify-between gap-6">
                <span style={{ fontFamily: "var(--font-grotesk)" }} className="font-bold text-[19px] tracking-tight text-balance">
                  {f.q}
                </span>
                <span className="shrink-0 w-8 h-8 rounded-full bg-[#0d1410] text-[#d4ff5a] flex items-center justify-center font-bold text-lg group-open:bg-[#e92e8f] group-open:text-[#fbf6e9] group-open:rotate-45 transition-all">
                  +
                </span>
              </summary>
              <p className="px-6 pb-6 text-[15px] leading-relaxed text-[#0d1410]/75 text-pretty -mt-1">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="pb-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative rounded-[40px] bg-[#d4ff5a] text-[#0d1410] p-12 sm:p-20 overflow-hidden">
          <div
            aria-hidden
            className="absolute -bottom-32 -right-20 w-96 h-96 rounded-full opacity-70 blur-2xl"
            style={{ background: "radial-gradient(circle, #ffb3d9 0%, transparent 65%)" }}
          />
          <div className="relative max-w-3xl">
            <h2
              style={{ fontFamily: "var(--font-grotesk)" }}
              className="font-bold text-[clamp(2.6rem,8vw,6.5rem)] leading-[0.9] tracking-[-0.035em] text-balance"
            >
              Ready when
              <br />
              <em style={{ fontFamily: "var(--font-display-italic)" }} className="italic font-normal">
                you are.
              </em>
            </h2>
            <p className="mt-7 text-[19px] text-[#0d1410]/75 max-w-xl text-pretty">
              Eight minutes of intake. Five business days. Three concepts. One website that makes
              your phone ring.
            </p>
            <Link
              href="/start"
              className="group mt-10 inline-flex items-center gap-3 rounded-full bg-[#0d1410] text-[#d4ff5a] pl-8 pr-2 py-2 text-[17px] font-bold hover:bg-[#e92e8f] hover:text-[#fbf6e9] transition-colors"
            >
              Start now — $995
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#d4ff5a] text-[#0d1410] group-hover:bg-[#fbf6e9]">
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t-2 border-[#0d1410] bg-[#0d1410] text-[#fbf6e9]">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <Link
              href="/v3"
              style={{ fontFamily: "var(--font-grotesk)" }}
              className="font-bold text-2xl tracking-tight flex items-center gap-2"
            >
              <LogoMark />
              simplesite
            </Link>
            <p className="mt-3 text-sm text-[#fbf6e9]/55 max-w-xs leading-relaxed">
              Bold, custom websites for businesses that actually need to sell something.
            </p>
          </div>
          <div className="flex flex-col sm:items-end gap-3 text-sm">
            <a href="mailto:hello@simplesite.co" className="text-[#fbf6e9]/70 hover:text-[#d4ff5a]">
              hello@simplesite.co
            </a>
            <Link href="/" className="text-[#fbf6e9]/70 hover:text-[#d4ff5a]">
              See all concepts
            </Link>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-[#fbf6e9]/15 flex items-center justify-between text-[12px] text-[#fbf6e9]/40 font-mono uppercase tracking-[0.16em]">
          <p>© {new Date().getFullYear()} Simple Site</p>
          <p>Built in Calgary, AB</p>
        </div>
      </div>
    </footer>
  );
}

function Eyebrow({ children, centered }: { children: React.ReactNode; centered?: boolean }) {
  return (
    <p
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] bg-[#0d1410] text-[#d4ff5a] ${centered ? "" : ""}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#e92e8f]" />
      {children}
    </p>
  );
}
