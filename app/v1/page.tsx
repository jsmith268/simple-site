import type { Metadata } from "next";
import Link from "next/link";
import { FAQS, HERO, PRICING, PRINCIPLES, PROCESS, WORK } from "@/lib/content";

export const metadata: Metadata = {
  title: "Simple Site — Custom websites from $995. Live in two weeks.",
  description:
    "We design and build conversion-focused websites for service businesses. Three original concepts, fixed price, live in two weeks.",
};

// V1 — TRUST / WARM MODERN.
// Cream paper, deep moss, clay accent, Fraunces serif for warmth.

export default function V1Page() {
  return (
    <main className="bg-[#f6f2ea] text-[#1c2a23] selection:bg-[#c2410c] selection:text-white">
      <Nav />
      <Hero />
      <TrustStrip />
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
    <header className="sticky top-0 z-30 bg-[#f6f2ea]/85 backdrop-blur border-b border-[#1c2a23]/[0.08]">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <Link href="/v1" className="font-semibold tracking-tight text-[15px] flex items-baseline gap-0.5">
          Simple Site<span className="text-[#c2410c] text-lg leading-none">.</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-[#1c2a23]/70">
          <a href="#how" className="hover:text-[#1c2a23] transition">How it works</a>
          <a href="#work" className="hover:text-[#1c2a23] transition">Work</a>
          <a href="#pricing" className="hover:text-[#1c2a23] transition">Pricing</a>
          <a href="#faq" className="hover:text-[#1c2a23] transition">FAQ</a>
        </nav>
        <Link
          href="/start"
          className="inline-flex items-center gap-1.5 rounded-full bg-[#1c2a23] text-[#f6f2ea] px-4 py-2 text-sm font-medium hover:bg-[#c2410c] transition-colors"
        >
          Start your site
          <span aria-hidden>→</span>
        </Link>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative min-h-[calc(100svh-64px)] flex items-center overflow-hidden">
      <div className="mx-auto max-w-5xl px-6 w-full py-12 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#1c2a23]/15 bg-white/60 px-3 py-1 text-[11px] font-medium tracking-[0.12em] uppercase text-[#1c2a23]/70 mb-7">
          <span className="w-1.5 h-1.5 rounded-full bg-[#c2410c] animate-pulse-dot" />
          {HERO.eyebrow}
        </div>
        <h1 className="font-semibold tracking-[-0.02em] text-[clamp(2.4rem,5.6vw,4.6rem)] leading-[1] text-balance max-w-3xl mx-auto">
          Custom websites for businesses that{" "}
          <span style={{ fontFamily: "var(--font-serif)" }} className="italic font-normal text-[#c2410c]">
            need&nbsp;to&nbsp;sell.
          </span>
        </h1>
        <p className="mt-6 max-w-xl mx-auto text-[17px] leading-[1.55] text-[#1c2a23]/75 text-pretty">
          {HERO.description}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={HERO.primaryCta.href}
            className="group inline-flex items-center gap-2 rounded-full bg-[#1c2a23] text-[#f6f2ea] px-6 py-3.5 text-[15px] font-medium hover:bg-[#c2410c] transition-colors"
          >
            {HERO.primaryCta.label}
            <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
          <a
            href={HERO.secondaryCta.href}
            className="inline-flex items-center gap-2 rounded-full border border-[#1c2a23]/25 bg-white/40 hover:bg-white px-5 py-3.5 text-[15px] font-medium text-[#1c2a23] transition"
          >
            {HERO.secondaryCta.label}
          </a>
        </div>
      </div>
    </section>
  );
}

function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="text-[#c2410c]" aria-hidden>
      <path d="M3 8.5l3.5 3.5L13 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function TrustStrip() {
  return (
    <section className="border-y border-[#1c2a23]/[0.08] bg-[#1c2a23] text-[#f6f2ea]">
      <div className="mx-auto max-w-6xl px-6 py-6 flex items-center gap-8 flex-wrap justify-between">
        <p className="text-[12px] uppercase tracking-[0.22em] font-medium text-[#f6f2ea]/60">
          Shipped for operators across home services, wellness & retail
        </p>
        <div className="flex items-center gap-8 text-sm text-[#f6f2ea]/85" style={{ fontFamily: "var(--font-serif)" }}>
          {WORK.map((w) => (
            <span key={w.name} className="italic whitespace-nowrap">{w.name}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowWeWork() {
  return (
    <section id="how" className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
      <SectionHeader
        eyebrow="How we work"
        title="From intake form to live site in fourteen days."
        sub="No discovery calls. No invoices for 'strategy.' We ask the right questions on day one, then we build."
      />
      <ol className="mt-14 grid md:grid-cols-3 gap-px bg-[#1c2a23]/10 rounded-2xl overflow-hidden border border-[#1c2a23]/10">
        {PROCESS.map((p) => (
          <li key={p.n} className="bg-[#f6f2ea] p-8 sm:p-10">
            <div className="flex items-baseline gap-3 mb-5">
              <span className="font-mono text-[12px] text-[#c2410c] font-semibold">{p.n}</span>
              <span className="h-px flex-1 bg-[#1c2a23]/15" />
            </div>
            <h3 style={{ fontFamily: "var(--font-serif)" }} className="text-2xl text-[#1c2a23] mb-3 text-balance">{p.title}</h3>
            <p className="text-[15px] leading-relaxed text-[#1c2a23]/70 text-pretty">{p.body}</p>
            <p className="mt-4 text-[13px] italic text-[#1c2a23]/55" style={{ fontFamily: "var(--font-serif)" }}>
              — {p.detail}
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {PRINCIPLES.map((p) => (
          <div key={p.title} className="border-l-2 border-[#c2410c] pl-5">
            <h4 style={{ fontFamily: "var(--font-serif)" }} className="text-xl text-[#1c2a23]">{p.title}</h4>
            <p className="mt-2 text-sm text-[#1c2a23]/65 leading-relaxed">{p.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Work() {
  return (
    <section id="work" className="bg-[#1c2a23] text-[#f6f2ea] py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          eyebrow="Recent work"
          title="A handful of small businesses we've shipped."
          sub="Real names, real URLs. Each one started as three custom concepts. The owners picked one. Then we built."
          dark
        />
        <div className="mt-14 grid md:grid-cols-3 gap-5">
          {WORK.map((w) => (
            <ProjectCard key={w.name} project={w} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project: w }: { project: (typeof WORK)[number] }) {
  return (
    <a
      href={w.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-2xl border border-[#f6f2ea]/12 hover:border-[#c2410c] bg-[#243530] hover:bg-[#2a3d37] p-8 transition-colors flex flex-col"
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-[#f6f2ea]/20 text-[#c2410c]" style={{ fontFamily: "var(--font-serif)" }}>
          {w.name.charAt(0)}
        </span>
        <span className="text-[11px] uppercase tracking-[0.18em] text-[#c2410c] font-semibold">
          {w.tag}
        </span>
      </div>
      <h3
        style={{ fontFamily: "var(--font-serif)" }}
        className="mt-8 text-[32px] leading-[1.02] text-[#f6f2ea] text-balance"
      >
        {w.name}
      </h3>
      <p className="mt-2 text-[12px] uppercase tracking-[0.16em] text-[#f6f2ea]/50 font-medium">
        {w.location}
      </p>
      <p className="mt-5 text-[14px] leading-relaxed text-[#f6f2ea]/70 text-pretty flex-1">
        {w.blurb}
      </p>
      <div className="mt-7 pt-5 border-t border-[#f6f2ea]/10 flex items-center justify-between">
        <span className="font-mono text-[12px] text-[#f6f2ea]/55">{w.site}</span>
        <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#c2410c] group-hover:gap-2.5 transition-all">
          Visit ↗
        </span>
      </div>
    </a>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
      <SectionHeader
        eyebrow="Transparent pricing"
        title="One fair price. The one you see."
        sub="No mystery line items. No 'strategy' invoices. No surprise change orders. Here is exactly what you pay."
      />
      <div className="mt-14 grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 rounded-3xl border border-[#1c2a23]/15 bg-white p-8 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 px-4 py-1.5 bg-[#c2410c] text-white text-[11px] uppercase tracking-[0.16em] rounded-bl-2xl font-semibold">
            Starting at
          </div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#c2410c] font-semibold mb-3">
            The Custom Website
          </p>
          <div className="flex items-baseline gap-2">
            <span style={{ fontFamily: "var(--font-serif)" }} className="text-[88px] leading-none text-[#1c2a23]">
              $995
            </span>
            <span className="text-[#1c2a23]/60 text-sm">one-time</span>
          </div>
          <p className="mt-4 text-[#1c2a23]/75 text-[15px] leading-relaxed max-w-md">{PRICING.base.blurb}</p>
          <ul className="mt-8 grid sm:grid-cols-2 gap-y-2.5 gap-x-6">
            {PRICING.base.includes.map((i) => (
              <li key={i} className="flex items-start gap-2 text-[14px] text-[#1c2a23]/85">
                <span className="mt-1.5 shrink-0"><Check /></span>
                {i}
              </li>
            ))}
          </ul>
          <Link
            href="/start"
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-[#1c2a23] text-[#f6f2ea] px-6 py-3.5 text-sm font-medium hover:bg-[#c2410c] transition-colors"
          >
            Start your intake
            <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="lg:col-span-5 space-y-3">
          {PRICING.addons.map((a) => (
            <div key={a.name} className="rounded-2xl border border-[#1c2a23]/12 bg-[#f6f2ea] p-5">
              <div className="flex items-baseline justify-between gap-3">
                <h4 style={{ fontFamily: "var(--font-serif)" }} className="text-xl text-[#1c2a23]">
                  {a.name}
                </h4>
                <span className="font-mono text-sm text-[#c2410c] font-semibold whitespace-nowrap">
                  {a.price ? `+$${a.price}` : "Quoted"}
                  {a.unit && <span className="text-[#1c2a23]/50 text-xs ml-1">{a.unit}</span>}
                </span>
              </div>
              <p className="mt-2 text-sm text-[#1c2a23]/70 leading-relaxed">{a.blurb}</p>
            </div>
          ))}
          <div className="rounded-2xl border border-dashed border-[#1c2a23]/15 p-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#1c2a23]/55 font-semibold mb-3">
              What's not included
            </p>
            <ul className="space-y-1.5 text-[13px] text-[#1c2a23]/65">
              {PRICING.notIncluded.map((n) => (
                <li key={n} className="flex items-baseline gap-2">
                  <span className="text-[#c2410c]">×</span> {n}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-4xl px-6 py-24 sm:py-32">
      <SectionHeader eyebrow="FAQ" title="The questions we get most." />
      <div className="mt-12 divide-y divide-[#1c2a23]/12 border-y border-[#1c2a23]/12">
        {FAQS.map((f) => (
          <details key={f.q} className="group py-6">
            <summary className="cursor-pointer list-none flex items-start justify-between gap-6">
              <span style={{ fontFamily: "var(--font-serif)" }} className="text-xl text-[#1c2a23] text-balance">
                {f.q}
              </span>
              <span className="shrink-0 mt-1 w-6 h-6 rounded-full border border-[#1c2a23]/25 flex items-center justify-center text-[#1c2a23]/60 group-open:bg-[#c2410c] group-open:text-white group-open:border-[#c2410c] transition">
                <span className="block group-open:rotate-45 transition-transform leading-none text-lg">+</span>
              </span>
            </summary>
            <p className="mt-3 text-[15px] leading-relaxed text-[#1c2a23]/75 text-pretty pr-12">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24">
      <div className="relative overflow-hidden rounded-[32px] bg-[#1c2a23] text-[#f6f2ea] p-10 sm:p-16">
        <div className="absolute -top-1/3 -right-1/4 w-[500px] h-[500px] bg-[#c2410c]/20 rounded-full blur-3xl" />
        <div className="relative max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#c2410c] font-semibold mb-4">
            Ready to start
          </p>
          <h2 className="font-semibold tracking-tight text-[clamp(2rem,4.5vw,3.6rem)] leading-[1.02] text-balance">
            A site you'd actually be proud to send to a customer.
          </h2>
          <p className="mt-5 text-[17px] text-[#f6f2ea]/75 max-w-prose">
            Fill out the intake form. Five business days later, three custom design concepts in
            your inbox — no payment, no commitment.
          </p>
          <Link
            href="/start"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#c2410c] text-white px-7 py-4 text-[15px] font-medium hover:bg-[#a8370a] transition-colors"
          >
            Start your site
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[#1c2a23]/[0.08]">
      <div className="mx-auto max-w-6xl px-6 py-10 flex flex-wrap items-center justify-between gap-4 text-[13px] text-[#1c2a23]/55">
        <p>© {new Date().getFullYear()} Simple Site. Built by people, for people.</p>
        <div className="flex items-center gap-5">
          <a href="mailto:hello@simplesite.co" className="hover:text-[#1c2a23]">hello@simplesite.co</a>
          <Link href="/" className="hover:text-[#1c2a23]">All concepts</Link>
        </div>
      </div>
    </footer>
  );
}

function SectionHeader({
  eyebrow,
  title,
  sub,
  dark,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
  dark?: boolean;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-[11px] uppercase tracking-[0.22em] font-semibold mb-4 text-[#c2410c]">
        {eyebrow}
      </p>
      <h2
        className={`font-semibold tracking-tight text-[clamp(2rem,4.2vw,3.4rem)] leading-[1.02] text-balance ${
          dark ? "text-[#f6f2ea]" : "text-[#1c2a23]"
        }`}
      >
        {title}
      </h2>
      {sub && (
        <p className={`mt-4 text-[17px] leading-relaxed max-w-2xl text-pretty ${dark ? "text-[#f6f2ea]/70" : "text-[#1c2a23]/70"}`}>
          {sub}
        </p>
      )}
    </div>
  );
}
