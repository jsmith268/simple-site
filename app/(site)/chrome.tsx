"use client";

import Link from "next/link";
import type { Theme } from "./themes";

// ─── Refresh icon ─────────────────────────────────────────────────────
export function RefreshIcon({ spin }: { spin: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={spin ? "animate-refresh-spin" : ""}
      aria-hidden
    >
      <path d="M21 12a9 9 0 1 1-3.13-6.85" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}

// ─── Primary CTA — "Start your site" ──────────────────────────────────
export function CtaPrimary({
  theme,
  href,
  label,
}: {
  theme: Theme;
  href: string;
  label: string;
}) {
  // Brutalist + Architectural get sharp corners; the others a pill.
  const sharp = theme.id === "brutalist" || theme.id === "architectural";
  return (
    <Link
      href={href}
      className={`group inline-flex items-center justify-center gap-2 px-6 py-3.5 text-[15px] font-semibold transition-colors w-full sm:w-auto ${
        sharp ? "" : "rounded-full"
      }`}
      style={{
        background: theme.ink,
        color: theme.bg,
        border: sharp ? `2px solid ${theme.ink}` : undefined,
      }}
    >
      {label}
      <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
        →
      </span>
    </Link>
  );
}

// ─── Cycle CTA — "Update site design" ─────────────────────────────────
export function CtaCycle({
  theme,
  onClick,
  cycling,
}: {
  theme: Theme;
  onClick: () => void;
  cycling: boolean;
}) {
  const sharp = theme.id === "brutalist" || theme.id === "architectural";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={cycling}
      aria-label="Update site design"
      className={`group inline-flex items-center justify-center gap-2.5 px-5 py-3.5 text-[15px] font-semibold border-2 transition-colors disabled:cursor-not-allowed w-full sm:w-auto ${
        sharp ? "" : "rounded-full"
      }`}
      style={{
        background: "transparent",
        color: theme.ink,
        borderColor: theme.borderStrong,
      }}
    >
      <RefreshIcon spin={cycling} />
      <span>Update site design</span>
    </button>
  );
}

// ─── Transition overlay — band sweep ──────────────────────────────────
export function TransitionOverlay({
  bands,
  visible,
}: {
  bands: readonly string[];
  visible: boolean;
}) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden" aria-hidden>
      {bands.map((color, i) => (
        <div
          key={`${i}-${color}`}
          className="absolute top-0 h-full animate-band-sweep"
          style={{
            left: `${i * 20}%`,
            width: "20.1%", // 0.1% overlap to prevent sub-pixel gaps
            background: color,
          }}
        />
      ))}
    </div>
  );
}
