"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { NAV } from "@/lib/content";
import { THEMES, type Theme } from "./themes";
import { TransitionOverlay } from "./chrome";
import { Hero } from "./hero";
import { BuiltFor, HowWeWork, Work, Pricing, Faq, FinalCta, Footer } from "./sections";

// Animation timings (ms) — keep in sync with the band-sweep keyframe in globals.css.
const CYCLE_TOTAL_MS = 900;
const CYCLE_SWAP_AT_MS = 450; // when the bands fully cover the viewport

export function AgencySite() {
  const [themeIndex, setThemeIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [bands, setBands] = useState<readonly string[]>(THEMES[1].bands);

  const theme = THEMES[themeIndex];

  const cycle = useCallback(() => {
    if (transitioning) return;
    const nextIndex = (themeIndex + 1) % THEMES.length;
    const next = THEMES[nextIndex];
    setBands(next.bands);
    setTransitioning(true);
    // swap the theme while the bands fully cover the viewport
    window.setTimeout(() => setThemeIndex(nextIndex), CYCLE_SWAP_AT_MS);
    window.setTimeout(() => setTransitioning(false), CYCLE_TOTAL_MS);
  }, [themeIndex, transitioning]);

  return (
    <>
      <TransitionOverlay bands={bands} visible={transitioning} />
      <main
        key={theme.id}
        style={
          {
            background: theme.bg,
            color: theme.ink,
            fontFamily: theme.fontBody,
            ["--theme-selection-bg" as never]: theme.selection,
            ["--theme-selection-text" as never]: theme.selectionText,
          } as React.CSSProperties
        }
        className="animate-theme-in"
      >
        <SelectionStyle theme={theme} />
        <Nav theme={theme} />
        <Hero theme={theme} onCycle={cycle} cycling={transitioning} />
        <BuiltFor theme={theme} />
        <HowWeWork theme={theme} />
        <Work theme={theme} />
        <Pricing theme={theme} />
        <Faq theme={theme} />
        <FinalCta theme={theme} />
        <Footer theme={theme} />
      </main>
    </>
  );
}

// Per-theme ::selection styling — injected as a tiny inline stylesheet
// so each theme's text selection matches its palette.
function SelectionStyle({ theme }: { theme: Theme }) {
  const css = `::selection { background: ${theme.selection}; color: ${theme.selectionText}; }`;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

function Nav({ theme }: { theme: Theme }) {
  const sharp = theme.id === "brutalist" || theme.id === "architectural";
  return (
    <header
      className="sticky top-0 z-30 backdrop-blur"
      style={{
        background: `${theme.bg}d9`,
        borderBottom: `1px solid ${theme.border}`,
      }}
    >
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-baseline font-semibold tracking-tight text-[15px]" style={{ color: theme.ink }}>
          Simple Site<span className="text-lg leading-none mx-[1px]" style={{ color: theme.accent }}>.</span>co
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm" style={{ color: theme.inkSoft }}>
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="hover:opacity-100 transition" style={{ color: theme.inkSoft }}>
              {n.label}
            </a>
          ))}
        </nav>
        <Link
          href="/start"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors"
          style={{
            background: theme.ink,
            color: theme.bg,
            borderRadius: sharp ? 0 : 9999,
          }}
        >
          Start
          <span aria-hidden>→</span>
        </Link>
      </div>
    </header>
  );
}
