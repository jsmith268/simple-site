"use client";

import Link from "next/link";
import { HERO } from "@/lib/content";
import type { Theme } from "./themes";
import { CtaPrimary, CtaCycle, RefreshIcon } from "./chrome";

export function Hero({
  theme,
  onCycle,
  cycling,
}: {
  theme: Theme;
  onCycle: () => void;
  cycling: boolean;
}) {
  switch (theme.id) {
    case "warm":
      return <HeroWarm theme={theme} onCycle={onCycle} cycling={cycling} />;
    case "editorial":
      return <HeroEditorial theme={theme} onCycle={onCycle} cycling={cycling} />;
    case "expressive":
      return <HeroExpressive theme={theme} onCycle={onCycle} cycling={cycling} />;
    case "architectural":
      return <HeroArchitectural theme={theme} onCycle={onCycle} cycling={cycling} />;
    case "brutalist":
      return <HeroBrutalist theme={theme} onCycle={onCycle} cycling={cycling} />;
  }
}

type HeroProps = {
  theme: Theme;
  onCycle: () => void;
  cycling: boolean;
};

// ────────────────────────────────────────────────────────────────────────
// V1 — Warm Modern (centered)
// ────────────────────────────────────────────────────────────────────────
function HeroWarm({ theme, onCycle, cycling }: HeroProps) {
  return (
    <section className="relative min-h-[calc(100svh-64px)] flex items-center">
      <div className="mx-auto max-w-5xl px-6 w-full py-12 text-center">
        <div
          className="inline-flex items-center gap-2 rounded-full border bg-white/60 px-3 py-1 text-[11px] font-medium tracking-[0.12em] uppercase mb-7"
          style={{ borderColor: theme.border, color: theme.inkSoft }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: theme.accent }} />
          {HERO.eyebrow}
        </div>
        <h1
          className="font-semibold tracking-[-0.02em] text-[clamp(2.4rem,5.6vw,4.6rem)] leading-[1] text-balance max-w-3xl mx-auto"
          style={{ color: theme.ink }}
        >
          {theme.headlineLead}{" "}
          <span
            className="italic font-normal"
            style={{ fontFamily: theme.fontAccent, color: theme.accent }}
          >
            {theme.headlineSignature && `${theme.headlineSignature} `}
            {theme.headlineAccent}
          </span>
        </h1>
        <p
          className="mt-6 max-w-xl mx-auto text-[17px] leading-[1.55] text-pretty"
          style={{ color: theme.inkSoft }}
        >
          {HERO.description}
        </p>
        <HeroCtas theme={theme} onCycle={onCycle} cycling={cycling} center />
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────
// V2 — Editorial
// ────────────────────────────────────────────────────────────────────────
function HeroEditorial({ theme, onCycle, cycling }: HeroProps) {
  return (
    <section className="relative min-h-[calc(100svh-64px)] flex items-center">
      <div className="mx-auto max-w-6xl px-6 w-full py-12">
        <div className="flex items-center gap-4 mb-10">
          <span className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: theme.inkMuted }}>
            Vol. 01 · Issue 006
          </span>
          <span className="h-px flex-1" style={{ background: theme.border }} />
          <span className="font-mono text-[11px]" style={{ color: theme.accent }}>{HERO.eyebrow}</span>
        </div>
        <h1
          className="text-[clamp(3rem,7.5vw,6.4rem)] leading-[0.96] tracking-[-0.02em] text-balance max-w-5xl"
          style={{ fontFamily: theme.fontDisplay, color: theme.ink }}
        >
          {theme.headlineLead}
          <br />
          <span className="italic" style={{ color: theme.accent }}>{theme.headlineAccent}</span>
        </h1>
        <p className="mt-8 max-w-2xl text-[18px] leading-[1.55] text-pretty" style={{ color: theme.inkSoft }}>
          {HERO.description} Fixed price. No retainers. No surprises.
        </p>
        <HeroCtas theme={theme} onCycle={onCycle} cycling={cycling} />
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────
// V3 — Expressive
// ────────────────────────────────────────────────────────────────────────
function HeroExpressive({ theme, onCycle, cycling }: HeroProps) {
  return (
    <section className="relative min-h-[calc(100svh-64px)] flex items-center overflow-hidden">
      <div
        aria-hidden
        className="absolute top-10 -right-32 w-[420px] h-[420px] rounded-full opacity-70 blur-2xl animate-float-slow"
        style={{ background: `radial-gradient(circle, ${theme.selection} 0%, transparent 65%)` }}
      />
      <div
        aria-hidden
        className="absolute bottom-0 -left-32 w-[480px] h-[480px] rounded-full opacity-55 blur-2xl animate-float-slow"
        style={{
          background: `radial-gradient(circle, #ffb3d9 0%, transparent 65%)`,
          animationDelay: "-7s",
        }}
      />
      <div className="relative mx-auto max-w-6xl px-6 w-full py-12">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] uppercase tracking-[0.16em] font-semibold mb-8"
          style={{ background: theme.ink, color: theme.bg }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: theme.selection }} />
          {HERO.eyebrow}
        </div>
        <h1
          className="font-bold tracking-[-0.035em] text-[clamp(3rem,8.5vw,7.4rem)] leading-[0.9] text-balance max-w-5xl"
          style={{ fontFamily: theme.fontDisplay, color: theme.ink }}
        >
          {theme.headlineLead}
          <br />
          {theme.headlineSignature}{" "}
          <span className="relative inline-block">
            <em className="italic font-normal" style={{ fontFamily: theme.fontAccent, color: theme.accent }}>
              {theme.headlineAccent.replace(".", "")}
            </em>
            <Squiggle color={theme.selection} />
          </span>
          <span style={{ color: theme.inkMuted }}>.</span>
        </h1>
        <p className="mt-8 text-[18px] leading-[1.5] max-w-2xl text-pretty" style={{ color: theme.inkSoft }}>
          {HERO.description}
        </p>
        <HeroCtas theme={theme} onCycle={onCycle} cycling={cycling} />
      </div>
    </section>
  );
}

function Squiggle({ color }: { color: string }) {
  return (
    <svg aria-hidden viewBox="0 0 220 14" className="absolute -bottom-1 left-0 w-full h-3" preserveAspectRatio="none">
      <path
        d="M2 8 Q 30 -2, 60 6 T 120 6 T 180 6 T 218 8"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

// ────────────────────────────────────────────────────────────────────────
// V4 — Architectural / Spec sheet
// ────────────────────────────────────────────────────────────────────────
function HeroArchitectural({ theme, onCycle, cycling }: HeroProps) {
  return (
    <section className="relative min-h-[calc(100svh-56px)] flex flex-col">
      <div className="mx-auto max-w-7xl px-6 pt-6 w-full">
        <div className="border-2 grid grid-cols-2 md:grid-cols-4" style={{ borderColor: theme.borderStrong }}>
          {[
            { l: "Drawing No.", v: "SS-01 / R.006" },
            { l: "Scale", v: "1 : 1" },
            { l: "Issued", v: "May 2026" },
            { l: "Status", v: "● Accepting", accent: true },
          ].map((s, i) => (
            <div
              key={s.l}
              className="px-4 py-2"
              style={{
                borderRight: i < 3 ? `2px solid ${theme.borderStrong}` : undefined,
                borderBottom: i < 2 ? `2px solid ${theme.borderStrong}` : undefined,
                fontFamily: theme.fontMono,
              }}
            >
              <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: theme.inkMuted }}>
                {s.l}
              </span>
              <span className="block text-sm mt-0.5 font-medium" style={s.accent ? { color: theme.accent } : { color: theme.ink }}>
                {s.v}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 flex items-center">
        <div className="mx-auto max-w-7xl px-6 w-full py-12">
          <p className="text-[11px] uppercase tracking-[0.22em] font-medium mb-6" style={{ fontFamily: theme.fontMono, color: theme.accent }}>
            <span className="inline-block h-px w-8 align-middle mr-3" style={{ background: theme.accent }} />
            Section A.01 — Service Overview
          </p>
          <h1
            className="text-[clamp(2.4rem,6vw,5rem)] leading-[1] tracking-[-0.02em] font-medium text-balance max-w-4xl"
            style={{ fontFamily: theme.fontDisplay, color: theme.ink }}
          >
            {theme.headlineLead}
            <br />
            {theme.headlineSignature}{" "}
            <span className="inline-flex items-baseline gap-2" style={{ color: theme.accent }}>
              {theme.headlineAccent.replace(".", "")}
              <DiagonalBrackets color={theme.accent} />
            </span>
            .
          </h1>
          <p className="mt-7 text-[17px] leading-[1.55] max-w-2xl text-pretty" style={{ color: theme.inkSoft }}>
            {HERO.description}
          </p>
          <HeroCtas theme={theme} onCycle={onCycle} cycling={cycling} />
        </div>
      </div>
    </section>
  );
}

function DiagonalBrackets({ color }: { color: string }) {
  return (
    <span className="inline-block w-4 h-4 relative" aria-hidden>
      <span className="absolute inset-0 border-l-2 border-t-2" style={{ borderColor: color }} />
      <span className="absolute inset-0 border-r-2 border-b-2 translate-x-1.5 translate-y-1.5" style={{ borderColor: color }} />
    </span>
  );
}

// ────────────────────────────────────────────────────────────────────────
// V5 — Brutalist
// ────────────────────────────────────────────────────────────────────────
function HeroBrutalist({ theme, onCycle, cycling }: HeroProps) {
  return (
    <section className="relative min-h-[calc(100svh-60px)] flex items-center overflow-hidden">
      <div className="mx-auto max-w-[1400px] px-6 w-full py-10">
        <div className="flex items-center gap-4 mb-8">
          <span
            className="inline-flex items-center gap-2 px-3 py-1 text-[11px] uppercase tracking-[0.18em] font-bold border-2"
            style={{ background: theme.accent, color: theme.accentInk, borderColor: theme.borderStrong }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: theme.accentInk }} />
            {HERO.eyebrow}
          </span>
          <span className="h-px flex-1" style={{ background: theme.borderStrong }} />
        </div>
        <h1
          className="font-bold tracking-[-0.04em] text-[clamp(2.8rem,9vw,8.4rem)] leading-[0.86] uppercase text-balance"
          style={{ fontFamily: theme.fontDisplay, color: theme.ink }}
        >
          {theme.headlineLead}{" "}
          <span className="inline-block px-3 -mx-1" style={{ background: theme.ink, color: theme.accent }}>
            {theme.headlineSignature.replace(".", "")}
          </span>
          .
          <br />
          <span
            className="italic font-normal normal-case tracking-tight"
            style={{ fontFamily: theme.fontAccent, color: "#ff3b1f" }}
          >
            {theme.headlineAccent}
          </span>
        </h1>
        <p className="mt-8 max-w-2xl text-[18px] leading-[1.5] text-pretty" style={{ color: theme.inkSoft }}>
          {HERO.description} <span className="font-bold">No templates. No discovery calls.</span>
        </p>
        <HeroCtas theme={theme} onCycle={onCycle} cycling={cycling} />
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Shared CTA row
// ────────────────────────────────────────────────────────────────────────
function HeroCtas({
  theme,
  onCycle,
  cycling,
  center,
}: HeroProps & { center?: boolean }) {
  return (
    <div className={`mt-9 flex flex-wrap items-center gap-3 ${center ? "justify-center" : ""}`}>
      <CtaPrimary theme={theme} href="/start" label="Start your site — $995" />
      <CtaCycle theme={theme} onClick={onCycle} cycling={cycling} />
    </div>
  );
}

export { CtaPrimary, CtaCycle, RefreshIcon };
