import type { Metadata } from "next";
import Link from "next/link";
import { FAQS, HERO, PRICING, PRINCIPLES, PROCESS, WORK } from "@/lib/content";

export const metadata: Metadata = {
  title: "Simple Site — Custom websites, fixed price. From $995.",
  description:
    "A small studio building distinctive marketing sites for service businesses. Three original directions, $995 to start.",
};

// V2 — EDITORIAL PREMIUM. Linear / Vercel territory.
// Graphite ink, signature violet, density and asymmetry.
// Instrument Serif for display.

export default function V2Page() {
  return (
    <main className="bg-[#0c0c0e] text-[#e9e6df] selection:bg-[#8b6dff] selection:text-white relative overflow-hidden">
      <BackgroundGrid />
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

function BackgroundGrid() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 opacity-[0.04]"
      style={{
        backgroundImage:
          "linear-gradient(to right, #e9e6df 1px, transparent 1px), linear-gradient(to bottom, #e9e6df 1px, transparent 1px)",
        backgroundSize: "64px 64px",
        maskImage: "radial-gradient(ellipse at 50% 30%, black 50%, transparent 100%)",
      }}
    />
  );
}

function Nav() {
  return (
    <header className="relative z-30 sticky top-0 backdrop-blur-md bg-[#0c0c0e]/70 border-b border-white/[0.06]">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link href="/v2" style={{ fontFamily: "var(--font-display-italic)" }} className="text-[22px] tracking-tight">
          Simple <span className="italic text-[#b8a4ff]">Site</span>
        </Link>
        <nav className="hidden md:flex items-center gap-9 text-[13px] uppercase tracking-[0.14em] text-white/55 font-mono">
          <a href="#how" className="hover:text-white transition">How</a>
          <a href="#work" className="hover:text-white transition">Work</a>
          <a href="#pricing" className="hover:text-white transition">Pricing</a>
          <a href="#faq" className="hover:text-white transition">FAQ</a>
        </nav>
        <Link
          href="/start"
          className="group relative inline-flex items-center gap-2 rounded-full bg-white text-[#0c0c0e] px-4 py-2 text-sm font-medium hover:bg-[#b8a4ff] transition"
        >
          Begin
          <span className="font-mono text-xs opacity-60 group-hover:opacity-100">→</span>
        </Link>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative min-h-[calc(100svh-64px)] flex items-center">
      <div className="mx-auto max-w-6xl px-6 w-full py-12">
        <div className="flex items-center gap-4 mb-10">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">
            Vol. 01 · Issue 005
          </span>
          <span className="h-px flex-1 bg-white/10" />
          <span className="font-mono text-[11px] text-[#b8a4ff]">{HERO.eyebrow}</span>
        </div>

        <h1
          style={{ fontFamily: "var(--font-display-italic)" }}
          className="text-[clamp(3rem,7.5vw,6.4rem)] leading-[0.96] tracking-[-0.02em] text-balance max-w-5xl"
        >
          Websites with
          <br />
          <span className="italic text-[#b8a4ff]">a point of view.</span>
        </h1>

        <p className="mt-8 max-w-2xl text-[18px] leading-[1.55] text-white/70 text-pretty">
          {HERO.description} Fixed price. No retainers. No surprises.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            href={HERO.primaryCta.href}
            className="group inline-flex items-center gap-3 rounded-full bg-[#b8a4ff] text-[#0c0c0e] pl-6 pr-2 py-2 text-[15px] font-medium hover:bg-white transition"
          >
            {HERO.primaryCta.label}
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#0c0c0e] text-[#b8a4ff] group-hover:rotate-45 transition-transform">
              →
            </span>
          </Link>
          <a
            href={HERO.secondaryCta.href}
            className="inline-flex items-center gap-2 text-sm text-white/65 hover:text-white transition border border-white/20 hover:border-[#b8a4ff] rounded-full px-5 py-3"
          >
            {HERO.secondaryCta.label} →
          </a>
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const words = [
    "Service businesses",
    "Wellness studios",
    "Trades & contractors",
    "Boutique retail",
    "Solo founders",
    "Multi-location brands",
    "Holding companies",
    "Local restaurants",
  ];
  const doubled = [...words, ...words];
  return (
    <section className="relative border-y border-white/[0.08] bg-[#0a0a0c] py-7 overflow-hidden">
      <div className="flex gap-12 animate-marquee whitespace-nowrap">
        {doubled.map((w, i) => (
          <span
            key={i}
            style={{ fontFamily: "var(--font-display-italic)" }}
            className="text-3xl text-white/50 flex items-center gap-12"
          >
            {w}
            <span className="text-[#b8a4ff]">✦</span>
          </span>
        ))}
      </div>
    </section>
  );
}

function HowWeWork() {
  return (
    <section id="how" className="relative">
      <div className="mx-auto max-w-7xl px-6 py-32">
        <Eyebrow>How we work</Eyebrow>
        <h2
          style={{ fontFamily: "var(--font-display-italic)" }}
          className="text-[clamp(2.5rem,6vw,5rem)] leading-[0.98] mt-6 max-w-4xl text-balance"
        >
          Three steps. <span className="italic text-[#b8a4ff]">No mystery.</span>
        </h2>

        <div className="mt-16 grid md:grid-cols-3 gap-px bg-white/10">
          {PROCESS.map((p) => (
            <article key={p.n} className="bg-[#0c0c0e] p-10 relative">
              <span className="absolute top-10 right-10 font-mono text-[11px] text-white/30">{p.n}</span>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#b8a4ff] mb-8">
                Step {p.n}
              </p>
              <h3
                style={{ fontFamily: "var(--font-display-italic)" }}
                className="text-[34px] leading-tight text-white mb-4 text-balance"
              >
                {p.title}
              </h3>
              <p className="text-[15px] leading-relaxed text-white/65 text-pretty">{p.body}</p>
              <p className="mt-5 pt-5 border-t border-white/10 text-[13px] italic text-white/45" style={{ fontFamily: "var(--font-display-italic)" }}>
                — {p.detail}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10">
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="bg-[#0c0c0e] p-6">
              <h4 style={{ fontFamily: "var(--font-display-italic)" }} className="text-xl text-white">
                {p.title}
              </h4>
              <p className="mt-2 text-[13px] text-white/60 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Work() {
  return (
    <section id="work" className="relative">
      <div className="relative mx-auto max-w-7xl px-6 py-32">
        <div className="flex items-end justify-between gap-8 mb-16 flex-wrap">
          <div className="max-w-2xl">
            <Eyebrow>Selected work</Eyebrow>
            <h2
              style={{ fontFamily: "var(--font-display-italic)" }}
              className="text-[clamp(2.5rem,6vw,5rem)] leading-[0.98] text-balance mt-6"
            >
              Three businesses,
              <br />
              <span className="italic text-[#b8a4ff]">three distinct sites.</span>
            </h2>
          </div>
          <p className="font-mono text-xs text-white/55 max-w-xs">
            Each of these started as three concepts. The owners picked one. Then we built it in
            fourteen days.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-white/10">
          {WORK.map((w, i) => (
            <ProjectCard key={w.name} project={w} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project: w, index }: { project: (typeof WORK)[number]; index: number }) {
  return (
    <a
      href={w.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-[#0c0c0e] hover:bg-[#13131a] transition-colors p-10 flex flex-col"
    >
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#b8a4ff] font-medium">
          No. 0{index + 1}
        </span>
        <span className="font-mono text-[11px] text-white/35">{w.tag}</span>
      </div>
      <h3
        style={{ fontFamily: "var(--font-display-italic)" }}
        className="mt-10 text-[40px] leading-[0.96] text-white text-balance"
      >
        {w.name}
      </h3>
      <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">
        {w.location}
      </p>
      <p className="mt-6 text-[15px] leading-relaxed text-white/65 text-pretty flex-1">
        {w.blurb}
      </p>
      <div className="mt-10 pt-6 border-t border-white/10 flex items-center justify-between">
        <span className="font-mono text-[12px] text-white/45">{w.site}</span>
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white text-[#0c0c0e] text-sm group-hover:bg-[#b8a4ff] group-hover:rotate-45 transition-all">
          ↗
        </span>
      </div>
    </a>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="relative">
      <div className="mx-auto max-w-7xl px-6 py-32">
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <Eyebrow>Transparent pricing</Eyebrow>
            <h2
              style={{ fontFamily: "var(--font-display-italic)" }}
              className="text-[clamp(2.5rem,6vw,5rem)] leading-[0.98] mt-6 text-balance"
            >
              One number,
              <br />
              <span className="italic text-[#b8a4ff]">honestly priced.</span>
            </h2>
            <p className="mt-7 text-[17px] leading-relaxed text-white/65 max-w-md text-pretty">
              No mystery line items, no 'strategy' invoices, no surprise change orders. Most sites
              we ship come in between <span className="text-white">$995 and $1,690 total</span>.
              Here's exactly what you pay.
            </p>
            <Link
              href="/start"
              className="mt-10 inline-flex items-center gap-3 rounded-full bg-white text-[#0c0c0e] pl-6 pr-2 py-2 text-[15px] font-medium hover:bg-[#b8a4ff] transition group"
            >
              Start your intake
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#0c0c0e] text-white group-hover:rotate-45 transition-transform">
                →
              </span>
            </Link>

            <div className="mt-12 rounded-2xl border border-dashed border-white/20 p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/45 mb-3">
                Never on the invoice
              </p>
              <ul className="space-y-1.5 text-[13px] text-white/65">
                {PRICING.notIncluded.map((n) => (
                  <li key={n} className="flex items-baseline gap-2">
                    <span className="text-[#b8a4ff]">×</span> {n}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-3xl border border-white/12 bg-gradient-to-b from-white/[0.04] to-transparent p-8 sm:p-10 relative overflow-hidden">
              <div
                className="absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-30 blur-3xl"
                style={{ background: "radial-gradient(circle, #b8a4ff 0%, transparent 70%)" }}
              />
              <div className="relative">
                <div className="flex items-baseline justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#b8a4ff]">
                      The Custom Website
                    </p>
                    <p style={{ fontFamily: "var(--font-display-italic)" }} className="mt-3 text-[88px] leading-none">
                      $995
                    </p>
                  </div>
                  <p className="font-mono text-xs text-white/45 max-w-xs">
                    One-time. Everything you need to launch a marketing site that works.
                  </p>
                </div>
                <ul className="mt-10 grid sm:grid-cols-2 gap-y-3 gap-x-8">
                  {PRICING.base.includes.map((i) => (
                    <li key={i} className="flex items-start gap-3 text-[14px] text-white/80">
                      <span className="mt-2 w-1 h-1 rounded-full bg-[#b8a4ff] shrink-0" />
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              {PRICING.addons.map((a) => (
                <div key={a.name} className="rounded-2xl border border-white/10 p-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45 mb-2">
                    Add-on
                  </p>
                  <h4 style={{ fontFamily: "var(--font-display-italic)" }} className="text-xl text-white mb-2">
                    {a.name}
                  </h4>
                  <p style={{ fontFamily: "var(--font-display-italic)" }} className="text-2xl text-[#b8a4ff]">
                    {a.price ? `+$${a.price}` : "Quoted"}
                    {a.unit && <span className="text-[11px] text-white/40 ml-1 font-sans">{a.unit}</span>}
                  </p>
                  <p className="mt-3 text-[12px] text-white/55 leading-snug">{a.blurb}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section id="faq" className="relative">
      <div className="mx-auto max-w-5xl px-6 py-32">
        <Eyebrow>Questions</Eyebrow>
        <h2
          style={{ fontFamily: "var(--font-display-italic)" }}
          className="text-[clamp(2.5rem,6vw,5rem)] leading-[0.98] mt-6 mb-12 text-balance"
        >
          What people <span className="italic text-[#b8a4ff]">always</span> ask.
        </h2>
        <div className="divide-y divide-white/10 border-y border-white/10">
          {FAQS.map((f, i) => (
            <details key={f.q} className="group py-7">
              <summary className="cursor-pointer list-none flex items-start justify-between gap-8">
                <div className="flex items-baseline gap-5 flex-1">
                  <span className="font-mono text-[11px] text-white/30 pt-1.5 shrink-0">0{i + 1}</span>
                  <span
                    style={{ fontFamily: "var(--font-display-italic)" }}
                    className="text-[24px] leading-tight text-white text-balance"
                  >
                    {f.q}
                  </span>
                </div>
                <span className="shrink-0 text-2xl text-white/40 group-open:text-[#b8a4ff] group-open:rotate-45 transition-transform leading-none">
                  +
                </span>
              </summary>
              <p className="mt-4 ml-10 max-w-3xl text-[15px] leading-relaxed text-white/65 text-pretty">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-6 pb-32">
        <div className="relative rounded-[40px] overflow-hidden border border-white/15 bg-gradient-to-br from-[#1a1530] via-[#0c0c0e] to-[#0c0c0e] p-12 sm:p-20">
          <div
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full opacity-40 blur-3xl pointer-events-none"
            style={{ background: "radial-gradient(circle, #8b6dff 0%, transparent 60%)" }}
          />
          <div className="relative max-w-3xl">
            <Eyebrow>Begin</Eyebrow>
            <h2
              style={{ fontFamily: "var(--font-display-italic)" }}
              className="text-[clamp(2.5rem,7vw,6rem)] leading-[0.95] mt-6 text-balance"
            >
              A site that <span className="italic">does the work</span> while you sleep.
            </h2>
            <p className="mt-8 text-[18px] text-white/70 max-w-2xl text-pretty">
              Fill the intake. Eight minutes. Five business days later, three custom concepts in
              your inbox.
            </p>
            <div className="mt-10 flex flex-wrap gap-4 items-center">
              <Link
                href="/start"
                className="group inline-flex items-center gap-3 rounded-full bg-[#b8a4ff] text-[#0c0c0e] pl-7 pr-2 py-2 text-[15px] font-medium hover:bg-white transition"
              >
                Start your intake
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#0c0c0e] text-[#b8a4ff] group-hover:rotate-45 transition-transform">
                  →
                </span>
              </Link>
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">
                · No card · No call · No commitment
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative border-t border-white/10">
      <div className="mx-auto max-w-7xl px-6 py-16 grid md:grid-cols-3 gap-10">
        <div>
          <p style={{ fontFamily: "var(--font-display-italic)" }} className="text-3xl">
            Simple <span className="italic text-[#b8a4ff]">Site</span>
          </p>
          <p className="mt-3 text-[13px] text-white/45 max-w-xs leading-relaxed">
            Custom websites for businesses that want to look like themselves — only better.
          </p>
        </div>
        <div className="space-y-2 font-mono text-[11px] uppercase tracking-[0.16em]">
          <p className="text-white/35 mb-3">Index</p>
          <a href="#how" className="block text-white/70 hover:text-white">01 — How we work</a>
          <a href="#work" className="block text-white/70 hover:text-white">02 — Work</a>
          <a href="#pricing" className="block text-white/70 hover:text-white">03 — Pricing</a>
          <a href="#faq" className="block text-white/70 hover:text-white">04 — FAQ</a>
        </div>
        <div className="space-y-2 font-mono text-[11px] uppercase tracking-[0.16em]">
          <p className="text-white/35 mb-3">Contact</p>
          <a href="mailto:hello@simplesite.co" className="block text-white/70 hover:text-white">hello@simplesite.co</a>
          <Link href="/" className="block text-white/70 hover:text-white">All concepts</Link>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between text-[11px] font-mono text-white/35 uppercase tracking-[0.18em]">
          <p>© {new Date().getFullYear()} Simple Site</p>
          <p>Made in Calgary, AB</p>
        </div>
      </div>
    </footer>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#b8a4ff] font-medium">
      <span className="inline-block w-3 h-px bg-[#b8a4ff] mr-3 align-middle" />
      {children}
    </p>
  );
}
