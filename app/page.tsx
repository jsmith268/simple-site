import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Simple Site — Five concepts. Pick one.",
  description: "Five completely distinct directions for the Simple Site agency website. Pick the one that fits.",
};

const CONCEPTS = [
  {
    slug: "v6",
    name: "Concept VI",
    direction: "Combined · cycle-on-demand",
    summary:
      "All five designs unified into one site. Hero CTA 'Update site design' triggers a band-sweep animation that swaps the entire site to the next theme. Same copy, five visual identities — the demo IS the pitch.",
    closest: "Combined master · production target",
    palette: ["#f6f2ea", "#0c0c0e", "#fbf6e9", "#c2410c", "#b8a4ff"],
    type: "All five typefaces, scoped to one route",
    featured: true,
  },
  {
    slug: "v1",
    name: "Concept I",
    direction: "Trust / Warm modern",
    summary:
      "Restrained, operator-grade. Cream paper, deep moss, clay accent. Fraunces serif italics for warmth. Built for trust at a glance.",
    closest: "Ambient Home Services × Hunter Doors",
    palette: ["#f6f2ea", "#1c2a23", "#c2410c"],
    type: "Inter + Fraunces serif italics",
  },
  {
    slug: "v2",
    name: "Concept II",
    direction: "Editorial premium",
    summary:
      "Linear / Vercel territory. Graphite, signature violet, density and asymmetry. Instrument Serif for confidence, mono for precision.",
    closest: "Linear · Stripe · NYT R&D",
    palette: ["#0c0c0e", "#b8a4ff", "#f4f1e8"],
    type: "Instrument Serif display + Inter",
  },
  {
    slug: "v3",
    name: "Concept III",
    direction: "Bold & expressive",
    summary:
      "Cream + lime + magenta. Big chunky Bricolage Grotesque, blob shapes, slight playfulness. Loud, confident, conversion-driven.",
    closest: "Awakened Pilates × Mercury",
    palette: ["#fbf6e9", "#0d1410", "#d4ff5a", "#e92e8f"],
    type: "Bricolage Grotesque + serif italics",
  },
  {
    slug: "v4",
    name: "Concept IV",
    direction: "Architectural / Spec sheet",
    summary:
      "Draftsman's title block. Bone paper, deep ink, terracotta accent. Hairline rules, dimension callouts, monospace labels. Precise, technical, premium.",
    closest: "Stripe docs × Spec sheet × Bauhaus",
    palette: ["#f5f3ed", "#0f1115", "#c95d3e", "#4a6b8a"],
    type: "IBM Plex Sans + DM Mono",
  },
  {
    slug: "v5",
    name: "Concept V",
    direction: "Brutalist confident",
    summary:
      "Stark off-white + black + electric yellow + hot red. Oversized chunky type, full-bleed bands, no soft shadows. Maximum confidence.",
    closest: "MSCHF × Read Max × Off-White",
    palette: ["#f1efe9", "#0a0a0a", "#f1ff39", "#ff3b1f"],
    type: "Space Grotesk + Newsreader italics",
  },
];

export default function Home() {
  return (
    <main className="min-h-dvh bg-[#0a0a0c] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 h-14 flex items-center justify-between">
          <p className="font-medium tracking-tight">
            Simple Site<span className="text-violet-300">.</span>{" "}
            <span className="text-white/40 font-mono text-xs ml-2">/ internal preview</span>
          </p>
          <p className="text-xs text-white/40 hidden sm:block">Pick a direction</p>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 pt-20 pb-12">
        <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-violet-300 mb-6">
          For: pranay@hunterdoors.ca
        </p>
        <h1 className="font-semibold tracking-tight text-[clamp(2.4rem,6vw,4.6rem)] leading-[0.98] text-balance max-w-4xl">
          Six concepts. One combined.
        </h1>
        <p className="mt-6 max-w-2xl text-[17px] text-white/65 leading-relaxed text-pretty">
          The five individual designs (V1–V5) are still available for reference. The new{" "}
          <span className="text-violet-300 font-medium">V6 combines all five</span> into one site
          where visitors can literally click a button to redesign it themselves — every theme
          available, rotating on demand.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 items-center">
          <Link
            href="/v6"
            className="inline-flex items-center gap-2 rounded-full bg-violet-300 text-black px-6 py-3 text-sm font-semibold hover:bg-violet-200 transition"
          >
            Open V6 — the combined site →
          </Link>
          <Link
            href="/start"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 text-white px-5 py-2.5 text-sm font-medium hover:bg-white/5 transition"
          >
            See the intake form
          </Link>
        </div>
      </section>

      <section id="concepts" className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
          {CONCEPTS.map((c, i) => (
            <Link
              key={c.slug}
              href={`/${c.slug}` as never}
              className="group rounded-3xl border border-white/10 hover:border-violet-300/50 bg-white/[0.02] hover:bg-white/[0.04] transition-all overflow-hidden flex flex-col"
            >
              <Preview slug={c.slug} />
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-violet-300/80">
                    {c.name}
                  </p>
                  <span className="font-mono text-[11px] text-white/35">0{i + 1} / 0{CONCEPTS.length}</span>
                </div>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight">{c.direction}</h2>
                <p className="mt-3 text-[14px] text-white/65 leading-relaxed flex-1">{c.summary}</p>
                <div className="mt-5 flex items-center gap-1.5">
                  {c.palette.map((p) => (
                    <span
                      key={p}
                      className="w-6 h-6 rounded-full ring-1 ring-white/15"
                      style={{ background: p }}
                      title={p}
                    />
                  ))}
                </div>
                <div className="mt-5 pt-5 border-t border-white/10 grid grid-cols-2 gap-3 text-[11px] font-mono">
                  <div>
                    <p className="text-white/35 uppercase tracking-wider">Closest to</p>
                    <p className="mt-1 text-white/80">{c.closest}</p>
                  </div>
                  <div>
                    <p className="text-white/35 uppercase tracking-wider">Type</p>
                    <p className="mt-1 text-white/80">{c.type}</p>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-sm font-medium text-white">View concept</span>
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white text-black group-hover:bg-violet-300 group-hover:rotate-[-25deg] transition-all">
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-wrap items-center justify-between gap-3 text-xs text-white/40 font-mono uppercase tracking-[0.16em]">
          <p>Simple Site · concept review · v2</p>
          <p>
            {new Date().toLocaleDateString("en-CA", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      </footer>
    </main>
  );
}

function Preview({ slug }: { slug: string }) {
  if (slug === "v6") {
    return (
      <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-[#f6f2ea] via-[#fbf6e9] to-[#0c0c0e]">
        <div className="absolute inset-0 grid grid-cols-5">
          <div className="bg-[#c2410c]/80" />
          <div className="bg-[#b8a4ff]/80" />
          <div className="bg-[#e92e8f]/80" />
          <div className="bg-[#c95d3e]/80" />
          <div className="bg-[#f1ff39]/80" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="text-center text-white">
            <p className="text-[10px] font-mono uppercase tracking-[0.22em] opacity-70 mb-1">
              ↻ Update site design
            </p>
            <p className="font-semibold text-lg">5 themes · 1 site</p>
          </div>
        </div>
      </div>
    );
  }
  if (slug === "v1") {
    return (
      <div className="aspect-[4/3] bg-[#f6f2ea] text-[#1c2a23] p-5 flex flex-col">
        <div className="flex items-center justify-between text-[8px] font-mono">
          <span>Simple Site.</span>
          <span className="text-[#c2410c]">Start →</span>
        </div>
        <div className="mt-4 flex-1 flex flex-col justify-end">
          <p className="text-[18px] leading-[0.95] italic">
            actually need to <span className="text-[#c2410c]">sell.</span>
          </p>
          <div className="mt-3 flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full bg-[#1c2a23] text-[#f6f2ea] text-[8px]">$995</span>
            <span className="px-2 py-0.5 rounded-full border border-[#1c2a23]/20 text-[8px]">Work</span>
          </div>
        </div>
      </div>
    );
  }
  if (slug === "v2") {
    return (
      <div className="aspect-[4/3] bg-[#0c0c0e] text-[#e9e6df] p-5 flex flex-col relative overflow-hidden">
        <div
          aria-hidden
          className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-50 blur-2xl"
          style={{ background: "radial-gradient(circle, #b8a4ff 0%, transparent 70%)" }}
        />
        <div className="flex items-center justify-between text-[8px] font-mono relative">
          <span className="text-sm">
            Simple <em className="text-[#b8a4ff]">Site</em>
          </span>
          <span className="text-[#b8a4ff]">→</span>
        </div>
        <div className="mt-4 flex-1 flex flex-col justify-end relative">
          <p className="text-[24px] leading-[0.92]">
            Websites with
            <br />
            <em className="italic text-[#b8a4ff]">a point of view.</em>
          </p>
          <p className="mt-2 font-mono text-[8px] text-white/40 uppercase tracking-wider">
            Vol. 01 · est. 2026
          </p>
        </div>
      </div>
    );
  }
  if (slug === "v3") {
    return (
      <div className="aspect-[4/3] bg-[#fbf6e9] text-[#0d1410] p-5 flex flex-col relative overflow-hidden">
        <div
          aria-hidden
          className="absolute top-6 -right-12 w-32 h-32 rounded-full opacity-60 blur-xl"
          style={{ background: "radial-gradient(circle, #d4ff5a 0%, transparent 65%)" }}
        />
        <div
          aria-hidden
          className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full opacity-50 blur-xl"
          style={{ background: "radial-gradient(circle, #ffb3d9 0%, transparent 65%)" }}
        />
        <div className="flex items-center justify-between text-[8px] font-bold relative">
          <span>simplesite</span>
          <span className="px-1.5 py-0.5 rounded-full bg-[#0d1410] text-[#d4ff5a]">Start</span>
        </div>
        <div className="mt-4 flex-1 flex flex-col justify-end relative">
          <p className="font-extrabold text-[26px] leading-[0.88] tracking-[-0.03em]">
            A website your business{" "}
            <em className="italic font-normal text-[#e92e8f]">deserves</em>
          </p>
        </div>
      </div>
    );
  }
  if (slug === "v4") {
    return (
      <div className="aspect-[4/3] bg-[#f5f3ed] text-[#0f1115] p-3 flex flex-col">
        <div className="border-2 border-[#0f1115] grid grid-cols-3 text-[7px] font-mono uppercase tracking-wider">
          <div className="border-r border-[#0f1115] px-2 py-1">SS-01 / R.005</div>
          <div className="border-r border-[#0f1115] px-2 py-1">1:1</div>
          <div className="px-2 py-1 text-[#c95d3e]">● Accepting</div>
        </div>
        <div className="flex-1 border-x-2 border-b-2 border-[#0f1115] p-3 flex flex-col justify-between">
          <p className="text-[6px] font-mono uppercase tracking-[0.2em] text-[#c95d3e]">
            Section A.01
          </p>
          <p className="text-[18px] leading-[0.95] tracking-[-0.01em] font-medium">
            Built like <span className="text-[#c95d3e]">blueprints.</span>
          </p>
          <div className="flex items-center justify-between text-[7px] font-mono">
            <span>$995</span>
            <span>× 3 concepts</span>
            <span>14d</span>
          </div>
        </div>
      </div>
    );
  }
  // v5
  return (
    <div className="aspect-[4/3] bg-[#f1efe9] text-[#0a0a0a] p-4 flex flex-col">
      <div className="flex items-center justify-between text-[8px] font-bold">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 bg-[#0a0a0a] text-[#f1ff39] flex items-center justify-center text-[8px]">
            S
          </span>
          Simple Site
        </span>
        <span className="px-1.5 py-0.5 bg-[#0a0a0a] text-[#f1efe9]">Start →</span>
      </div>
      <div className="mt-3 flex-1 flex flex-col justify-end">
        <p className="font-black text-[22px] leading-[0.82] tracking-[-0.04em] uppercase">
          Most
          <br />
          websites are{" "}
          <span className="bg-[#0a0a0a] text-[#f1ff39] px-1 -mx-0.5">boring</span>.
        </p>
        <p className="italic text-[12px] text-[#ff3b1f] mt-1">Yours doesn't have to be.</p>
      </div>
    </div>
  );
}
