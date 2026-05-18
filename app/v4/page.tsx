import type { Metadata } from "next";
import Link from "next/link";
import { FAQS, HERO, PRICING, PRINCIPLES, PROCESS, WORK } from "@/lib/content";

export const metadata: Metadata = {
  title: "Simple Site — Specifications: $995 marketing websites.",
  description:
    "A small studio that builds marketing websites like blueprints. Three original concepts, fixed price, fourteen-day delivery.",
};

// V4 — ARCHITECTURAL / SPEC SHEET.
// IBM Plex Sans body + DM Mono labels. Bone-white paper, deep ink,
// terracotta accent, hairline rules everywhere. Draftsman / spec-sheet feel.

const INK = "#0f1115";
const PAPER = "#f5f3ed";
const PAPER_2 = "#ebe7dd";
const CLAY = "#c95d3e";
const RULE = "#4a6b8a";

export default function V4Page() {
  return (
    <main
      style={{ fontFamily: "var(--font-plex)", background: PAPER, color: INK }}
      className="selection:bg-[#c95d3e] selection:text-white"
    >
      <Nav />
      <Hero />
      <Strip />
      <HowWeWork />
      <Work />
      <Pricing />
      <Faq />
      <FinalCta />
      <Footer />
    </main>
  );
}

function Mono({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span style={{ fontFamily: "var(--font-techmono)", ...style }} className={className}>
      {children}
    </span>
  );
}

function Nav() {
  return (
    <header
      className="sticky top-0 z-30 backdrop-blur"
      style={{ background: `${PAPER}d9`, borderBottom: `1px solid ${INK}1f` }}
    >
      <div className="mx-auto max-w-7xl px-6 h-14 flex items-center justify-between">
        <Link href="/v4" className="flex items-center gap-3">
          <span className="w-6 h-6 border-2 flex items-center justify-center" style={{ borderColor: INK }}>
            <span className="w-2 h-2" style={{ background: CLAY }} />
          </span>
          <span className="font-semibold tracking-tight">Simple Site</span>
          <Mono className="text-[10px] uppercase tracking-[0.2em] hidden sm:inline" >
            &nbsp;/&nbsp;Studio
          </Mono>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {[
            { l: "How", h: "#how" },
            { l: "Work", h: "#work" },
            { l: "Pricing", h: "#pricing" },
            { l: "FAQ", h: "#faq" },
          ].map((n) => (
            <a key={n.l} href={n.h} className="text-sm hover:text-[#c95d3e]" style={{ color: `${INK}b3` }}>
              {n.l}
            </a>
          ))}
        </nav>
        <Link
          href="/start"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border-2 hover:bg-[#c95d3e] hover:text-white hover:border-[#c95d3e] transition-colors"
          style={{ borderColor: INK }}
        >
          <Mono className="text-[10px] uppercase tracking-[0.18em]">Init →</Mono>
          Start
        </Link>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative min-h-[calc(100svh-56px)] flex flex-col">
      {/* Top dimension strip — frames the page, contributes minimal vertical weight */}
      <div className="mx-auto max-w-7xl px-6 pt-6 w-full">
        <div className="border-2 grid grid-cols-2 md:grid-cols-4" style={{ borderColor: INK }}>
          {[
            { l: "Drawing No.", v: "SS-01 / R.005" },
            { l: "Scale", v: "1 : 1" },
            { l: "Issued", v: "May 2026" },
            { l: "Status", v: "● Accepting", accent: true },
          ].map((s, i, arr) => (
            <div
              key={s.l}
              className={`px-4 py-2 ${i < arr.length - 1 ? "border-b-2 md:border-b-0 md:border-r-2" : ""} ${i === 0 || i === 2 ? "border-r-2 md:border-r-2" : ""}`}
              style={{ borderColor: INK }}
            >
              <Mono className="text-[10px] uppercase tracking-[0.2em]" style={{ color: `${INK}80` }}>
                {s.l}
              </Mono>
              <Mono className="block text-sm mt-0.5 font-medium" style={s.accent ? { color: CLAY } : undefined}>
                {s.v}
              </Mono>
            </div>
          ))}
        </div>
      </div>

      {/* Centered hero content */}
      <div className="flex-1 flex items-center">
        <div className="mx-auto max-w-7xl px-6 w-full py-12">
          <Mono className="text-[11px] uppercase tracking-[0.22em] font-medium block mb-6" style={{ color: CLAY }}>
            <span className="inline-block h-px w-8 align-middle mr-3" style={{ background: CLAY }} />
            Section A.01 — Service Overview
          </Mono>

          <h1 className="text-[clamp(2.4rem,6vw,5rem)] leading-[1] tracking-[-0.02em] font-medium text-balance max-w-4xl">
            Marketing websites,
            <br />
            built like{" "}
            <span style={{ color: CLAY }} className="inline-flex items-baseline gap-2">
              blueprints<DiagonalBrackets />
            </span>
            .
          </h1>

          <p className="mt-7 text-[17px] leading-[1.55] max-w-2xl text-pretty" style={{ color: `${INK}b3` }}>
            {HERO.description}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href={HERO.primaryCta.href}
              className="group inline-flex items-center gap-3 px-6 py-3.5 text-[15px] font-medium text-white"
              style={{ background: INK }}
            >
              <Mono className="text-[11px] uppercase tracking-[0.18em] opacity-70">Init</Mono>
              {HERO.primaryCta.label}
              <span className="inline-flex items-center justify-center w-7 h-7 border" style={{ borderColor: "#fff" }}>
                →
              </span>
            </Link>
            <a
              href={HERO.secondaryCta.href}
              className="inline-flex items-center gap-2 px-5 py-3.5 text-[15px] font-medium border-2 hover:bg-[#0f1115] hover:text-white transition-colors"
              style={{ borderColor: INK }}
            >
              {HERO.secondaryCta.label}
              <Mono className="text-[11px] opacity-60">↘</Mono>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function DiagonalBrackets() {
  return (
    <span className="inline-block w-4 h-4 relative" aria-hidden>
      <span className="absolute inset-0 border-l-2 border-t-2" style={{ borderColor: CLAY }} />
      <span className="absolute inset-0 border-r-2 border-b-2 translate-x-1.5 translate-y-1.5" style={{ borderColor: CLAY }} />
    </span>
  );
}

function Strip() {
  const items = ["No discovery decks", "Fixed pricing", "5 free revisions", "Live in 14 days", "No templates"];
  return (
    <section className="border-y-2 my-12" style={{ borderColor: INK, background: PAPER_2 }}>
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between gap-6 flex-wrap">
        {items.map((it, i) => (
          <div key={it} className="flex items-center gap-3">
            <Mono className="text-[10px] uppercase tracking-[0.2em]" style={{ color: CLAY }}>
              0{i + 1}
            </Mono>
            <span className="text-sm font-medium">{it}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowWeWork() {
  return (
    <section id="how" className="mx-auto max-w-7xl px-6 py-24">
      <SpecHeader number="B.01" label="Process" />
      <h2 className="text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.04] tracking-[-0.015em] font-medium mt-5 max-w-3xl text-balance">
        How we work — the spec sheet version.
      </h2>
      <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-pretty" style={{ color: `${INK}99` }}>
        No discovery calls. No 'strategy' decks. The intake form on day one is the only briefing we
        need. Then five days, then fourteen days, then you're live.
      </p>

      <div className="mt-12 border-2 grid md:grid-cols-3" style={{ borderColor: INK }}>
        {PROCESS.map((p, i, arr) => (
          <article
            key={p.n}
            className={`p-8 ${i < arr.length - 1 ? "border-b-2 md:border-b-0 md:border-r-2" : ""}`}
            style={{ borderColor: INK }}
          >
            <div className="flex items-center justify-between mb-7">
              <Mono className="text-2xl font-medium" style={{ color: CLAY }}>{p.n}</Mono>
              <Mono className="text-[10px] uppercase tracking-[0.2em]" style={{ color: `${INK}66` }}>
                Phase {i + 1} / {arr.length}
              </Mono>
            </div>
            <h3 className="text-2xl tracking-tight font-medium leading-tight text-balance">{p.title}</h3>
            <p className="mt-4 text-[15px] leading-relaxed text-pretty" style={{ color: `${INK}99` }}>
              {p.body}
            </p>
            <div className="mt-5 pt-5 border-t-2 border-dashed" style={{ borderColor: `${INK}33` }}>
              <Mono className="text-[10px] uppercase tracking-[0.2em] block mb-1.5" style={{ color: `${INK}66` }}>
                Note
              </Mono>
              <p className="text-[13px]" style={{ color: `${INK}80` }}>{p.detail}</p>
            </div>
          </article>
        ))}
      </div>

      {/* Principles grid as spec annotations */}
      <div className="mt-12 border-2 grid sm:grid-cols-2 lg:grid-cols-4" style={{ borderColor: INK }}>
        {PRINCIPLES.map((p, i, arr) => (
          <div
            key={p.title}
            className={`p-6 ${i < arr.length - 1 ? "border-b-2 sm:border-b-0 lg:border-b-0 sm:border-r-2 lg:border-r-2" : ""} ${
              i % 2 === 1 ? "sm:border-r-0 lg:border-r-2" : ""
            } ${i < 2 ? "sm:border-b-2 lg:border-b-0" : ""}`}
            style={{ borderColor: INK }}
          >
            <Mono className="text-[10px] uppercase tracking-[0.2em]" style={{ color: CLAY }}>
              Annotation 0{i + 1}
            </Mono>
            <h4 className="text-lg font-medium mt-3 tracking-tight">{p.title}</h4>
            <p className="mt-2 text-[13px] leading-relaxed" style={{ color: `${INK}80` }}>{p.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Work() {
  return (
    <section id="work" className="border-t-2" style={{ borderColor: INK, background: PAPER_2 }}>
      <div className="mx-auto max-w-7xl px-6 py-24">
        <SpecHeader number="C.01" label="Selected projects" />
        <div className="flex items-end justify-between gap-8 mt-5 flex-wrap">
          <h2 className="text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.04] tracking-[-0.015em] font-medium max-w-3xl text-balance">
            Real businesses. Real revenue. Themed in their actual brand colors.
          </h2>
          <Mono className="text-[11px] uppercase tracking-[0.18em] mt-2" style={{ color: `${INK}66` }}>
            3 of {WORK.length}+ shipped
          </Mono>
        </div>

        <div className="mt-12 space-y-4">
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
      className="group block border-2 bg-white hover:border-[#c95d3e] transition-colors"
      style={{ borderColor: INK }}
    >
      <div className="grid md:grid-cols-12">
        <div className="md:col-span-3 p-6 md:border-r-2" style={{ borderColor: INK }}>
          <Mono className="text-[10px] uppercase tracking-[0.2em]" style={{ color: CLAY }}>
            Project File
          </Mono>
          <Mono className="block mt-2 text-sm" style={{ color: `${INK}b3` }}>
            № {String(index + 1).padStart(3, "0")} / {String(WORK.length).padStart(3, "0")}
          </Mono>
          <h3 className="text-[26px] mt-6 tracking-tight font-medium leading-[1.05]">
            {w.name}
          </h3>
        </div>
        <div className="md:col-span-7 p-6 md:border-r-2" style={{ borderColor: INK }}>
          <div className="grid grid-cols-2 gap-6 mb-4">
            <div>
              <Mono className="text-[10px] uppercase tracking-[0.2em]" style={{ color: `${INK}80` }}>
                Industry
              </Mono>
              <Mono className="block mt-1 text-sm font-medium">{w.tag}</Mono>
            </div>
            <div>
              <Mono className="text-[10px] uppercase tracking-[0.2em]" style={{ color: `${INK}80` }}>
                Location
              </Mono>
              <Mono className="block mt-1 text-sm font-medium">{w.location}</Mono>
            </div>
          </div>
          <Mono className="text-[10px] uppercase tracking-[0.2em] block mt-5" style={{ color: `${INK}80` }}>
            Brief
          </Mono>
          <p className="mt-2 text-[14px] leading-relaxed text-pretty" style={{ color: `${INK}99` }}>
            {w.blurb}
          </p>
        </div>
        <div className="md:col-span-2 p-6 flex flex-col justify-between" style={{ background: PAPER_2 }}>
          <Mono className="text-[10px] uppercase tracking-[0.2em]" style={{ color: `${INK}80` }}>
            Live URL
          </Mono>
          <div>
            <Mono className="block text-[12px] mb-4 group-hover:text-[#c95d3e] transition-colors" style={{ color: INK }}>
              {w.site}
            </Mono>
            <span
              className="inline-flex items-center justify-center w-10 h-10 border-2 group-hover:bg-[#c95d3e] group-hover:text-white group-hover:border-[#c95d3e] transition-colors"
              style={{ borderColor: INK }}
            >
              ↗
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-6 py-24">
      <SpecHeader number="D.01" label="Bill of materials" />
      <h2 className="text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.04] tracking-[-0.015em] font-medium mt-5 max-w-3xl text-balance">
        Transparent pricing. Every line item, in the open.
      </h2>
      <p className="mt-5 max-w-2xl text-[16px] leading-relaxed" style={{ color: `${INK}99` }}>
        No mystery fees. No 'strategy' invoices. No surprise change orders. Most sites we ship come
        in between <span className="font-medium" style={{ color: INK }}>$995 and $1,690 total</span>.
      </p>

      <div className="mt-12 border-2 grid lg:grid-cols-12" style={{ borderColor: INK }}>
        <div className="lg:col-span-8 p-8 sm:p-12 lg:border-r-2" style={{ borderColor: INK }}>
          <div className="flex items-baseline justify-between border-b-2 pb-6" style={{ borderColor: INK }}>
            <div>
              <Mono className="text-[11px] uppercase tracking-[0.2em]" style={{ color: CLAY }}>
                Line item 001
              </Mono>
              <h3 className="text-2xl mt-2 font-medium">The Custom Website</h3>
            </div>
            <p className="text-[64px] leading-none font-medium tracking-tight">$995</p>
          </div>

          <Mono className="block mt-6 text-[11px] uppercase tracking-[0.2em] mb-4" style={{ color: `${INK}80` }}>
            Included in base
          </Mono>
          <ul>
            {PRICING.base.includes.map((i, idx) => (
              <li
                key={i}
                className="grid grid-cols-12 gap-4 py-3 border-b items-baseline"
                style={{ borderColor: `${INK}1a` }}
              >
                <Mono className="col-span-1 text-[11px]" style={{ color: `${INK}66` }}>
                  {String(idx + 1).padStart(2, "0")}.
                </Mono>
                <span className="col-span-9 text-[15px]">{i}</span>
                <Mono className="col-span-2 text-right text-xs" style={{ color: `${INK}99` }}>
                  Included
                </Mono>
              </li>
            ))}
          </ul>

          <Link
            href="/start"
            className="mt-8 inline-flex items-center gap-3 px-6 py-3.5 text-sm font-medium text-white"
            style={{ background: INK }}
          >
            <Mono className="text-[11px] uppercase tracking-[0.18em] opacity-70">Init →</Mono>
            Start intake
          </Link>
        </div>

        <div className="lg:col-span-4">
          <div className="p-8 border-b-2" style={{ borderColor: INK }}>
            <Mono className="text-[10px] uppercase tracking-[0.2em]" style={{ color: CLAY }}>
              Add-ons (optional)
            </Mono>
            <ul className="mt-5 space-y-4">
              {PRICING.addons.map((a) => (
                <li key={a.name} className="flex items-baseline justify-between gap-3">
                  <div>
                    <p className="font-medium">{a.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: `${INK}80` }}>{a.blurb}</p>
                  </div>
                  <Mono className="text-sm font-medium whitespace-nowrap" style={{ color: CLAY }}>
                    {a.price ? `+$${a.price}` : "Quote"}
                    {a.unit && (
                      <span className="text-[10px] block text-right" style={{ color: `${INK}66` }}>
                        {a.unit}
                      </span>
                    )}
                  </Mono>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-8" style={{ background: PAPER_2 }}>
            <Mono className="text-[10px] uppercase tracking-[0.2em]" style={{ color: `${INK}80` }}>
              Never on the invoice
            </Mono>
            <ul className="mt-4 space-y-1.5 text-[13px]" style={{ color: `${INK}99` }}>
              {PRICING.notIncluded.map((n) => (
                <li key={n} className="flex items-baseline gap-2">
                  <Mono className="text-xs" style={{ color: CLAY }}>×</Mono> {n}
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
    <section id="faq" className="border-t-2" style={{ borderColor: INK }}>
      <div className="mx-auto max-w-5xl px-6 py-24">
        <SpecHeader number="E.01" label="Frequently asked" />
        <h2 className="text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.04] tracking-[-0.015em] font-medium mt-5 max-w-3xl text-balance">
          Questions we get most.
        </h2>

        <div className="mt-12 border-2" style={{ borderColor: INK }}>
          {FAQS.map((f, i, arr) => (
            <details
              key={f.q}
              className={`group ${i < arr.length - 1 ? "border-b-2" : ""}`}
              style={{ borderColor: INK }}
            >
              <summary className="cursor-pointer list-none p-6 flex items-start justify-between gap-6">
                <div className="flex items-baseline gap-5">
                  <Mono className="text-xs pt-1.5 shrink-0" style={{ color: CLAY }}>
                    Q{String(i + 1).padStart(2, "0")}
                  </Mono>
                  <span className="text-lg font-medium text-balance">{f.q}</span>
                </div>
                <span className="shrink-0 w-7 h-7 border-2 flex items-center justify-center group-open:bg-[#c95d3e] group-open:text-white group-open:border-[#c95d3e] transition-colors text-lg leading-none">
                  <span className="block group-open:rotate-45 transition-transform">+</span>
                </span>
              </summary>
              <div className="px-6 pb-6 pl-[3.4rem]">
                <Mono className="text-[10px] uppercase tracking-[0.2em] block mb-2" style={{ color: `${INK}66` }}>
                  Answer
                </Mono>
                <p className="text-[15px] leading-relaxed text-pretty" style={{ color: `${INK}99` }}>{f.a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="border-t-2" style={{ borderColor: INK, background: INK, color: PAPER }}>
      <div className="mx-auto max-w-7xl px-6 py-24">
        <SpecHeader number="F.01" label="Initiate" dark />
        <div className="grid lg:grid-cols-12 gap-10 items-end mt-5">
          <div className="lg:col-span-8">
            <h2 className="text-[clamp(2.4rem,5.5vw,4.4rem)] leading-[0.98] tracking-[-0.02em] font-medium text-balance">
              Sign the intake. Receive three concepts. Pick one.
            </h2>
            <p className="mt-5 text-[17px] max-w-2xl text-pretty" style={{ color: `${PAPER}b3` }}>
              Eight minutes of intake. Five business days. Three completely original directions.
              Live in fourteen days. No commitment until you've seen the concepts.
            </p>
          </div>
          <div className="lg:col-span-4 flex flex-col items-start lg:items-end gap-4">
            <Link
              href="/start"
              className="inline-flex items-center gap-3 px-6 py-3.5 text-[15px] font-medium"
              style={{ background: CLAY, color: "#fff" }}
            >
              <Mono className="text-[11px] uppercase tracking-[0.18em] opacity-80">Init →</Mono>
              Start intake — $995
            </Link>
            <Mono className="text-[11px] uppercase tracking-[0.18em]" style={{ color: `${PAPER}66` }}>
              No card · No call · No commitment
            </Mono>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ background: INK, color: PAPER, borderTop: `1px solid ${PAPER}1a` }}>
      <div className="mx-auto max-w-7xl px-6 py-10 grid md:grid-cols-3 gap-8">
        <div>
          <Link href="/v4" className="flex items-center gap-3">
            <span className="w-6 h-6 border-2 flex items-center justify-center" style={{ borderColor: PAPER }}>
              <span className="w-2 h-2" style={{ background: CLAY }} />
            </span>
            <span className="font-semibold">Simple Site Studio</span>
          </Link>
          <Mono className="block mt-3 text-[11px] uppercase tracking-[0.18em]" style={{ color: `${PAPER}66` }}>
            Calgary, AB · Est. 2026
          </Mono>
        </div>
        <div>
          <Mono className="text-[10px] uppercase tracking-[0.2em]" style={{ color: `${PAPER}66` }}>
            Index
          </Mono>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li><a href="#how" className="hover:text-[#c95d3e]">B.01 · Process</a></li>
            <li><a href="#work" className="hover:text-[#c95d3e]">C.01 · Selected work</a></li>
            <li><a href="#pricing" className="hover:text-[#c95d3e]">D.01 · Bill of materials</a></li>
            <li><a href="#faq" className="hover:text-[#c95d3e]">E.01 · Q&A</a></li>
          </ul>
        </div>
        <div>
          <Mono className="text-[10px] uppercase tracking-[0.2em]" style={{ color: `${PAPER}66` }}>
            Contact
          </Mono>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li><a href="mailto:hello@simplesite.co" className="hover:text-[#c95d3e]">hello@simplesite.co</a></li>
            <li><Link href="/" className="hover:text-[#c95d3e]">All concepts</Link></li>
          </ul>
        </div>
      </div>
      <div style={{ borderTop: `1px solid ${PAPER}1a` }}>
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Mono className="text-[10px] uppercase tracking-[0.2em]" style={{ color: `${PAPER}55` }}>
            © {new Date().getFullYear()} · Simple Site Studio
          </Mono>
          <Mono className="text-[10px] uppercase tracking-[0.2em]" style={{ color: `${PAPER}55` }}>
            Drawing No. SS-01 / Rev. 005
          </Mono>
        </div>
      </div>
    </footer>
  );
}

function SpecHeader({
  number,
  label,
  dark = false,
}: {
  number: string;
  label: string;
  dark?: boolean;
}) {
  return (
    <div className="flex items-center gap-4">
      <Mono
        className="text-[11px] uppercase tracking-[0.22em] font-medium"
        style={{ color: dark ? CLAY : CLAY }}
      >
        {number}
      </Mono>
      <span
        className="h-px w-12"
        style={{ background: dark ? `${PAPER}40` : `${INK}40` }}
      />
      <Mono className="text-[11px] uppercase tracking-[0.22em]" style={{ color: dark ? `${PAPER}99` : `${INK}99` }}>
        {label}
      </Mono>
    </div>
  );
}
