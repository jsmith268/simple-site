export type ThemeId =
  | "warm"
  | "editorial"
  | "expressive"
  | "architectural"
  | "brutalist";

export type Theme = {
  id: ThemeId;
  label: string;
  closest: string;
  // Surface
  bg: string;
  bgAlt: string;
  card: string;
  // Text
  ink: string;
  inkSoft: string; // ~70% opacity equivalent
  inkMuted: string; // ~50%
  // Brand
  accent: string;
  accentInk: string; // text on accent
  // Lines
  border: string;
  borderStrong: string;
  // Selection
  selection: string;
  selectionText: string;
  // Type
  fontDisplay: string; // headings
  fontAccent: string; // italic accents / serif flourishes
  fontMono: string;
  fontBody: string; // body (always Inter for legibility)
  // Structure
  borderRadius: string; // tailwind class fragment, e.g. "rounded-3xl" or "rounded-none"
  borderWidth: string; // class, e.g. "border" or "border-2"
  // Hero distinctive copy
  headlineLead: string;
  headlineAccent: string;
  headlineSignature: string; // optional italic flourish word
  // Transition bands — palette previewed during cycle
  bands: [string, string, string, string, string];
};

export const THEMES: Theme[] = [
  {
    id: "warm",
    label: "Warm Modern",
    closest: "Stripe × Ambient",
    bg: "#f6f2ea",
    bgAlt: "#efe7d8",
    card: "#ffffff",
    ink: "#1c2a23",
    inkSoft: "rgba(28,42,35,0.72)",
    inkMuted: "rgba(28,42,35,0.5)",
    accent: "#c2410c",
    accentInk: "#f6f2ea",
    border: "rgba(28,42,35,0.12)",
    borderStrong: "#1c2a23",
    selection: "#c2410c",
    selectionText: "#ffffff",
    fontDisplay: "var(--font-inter)",
    fontAccent: "var(--font-fraunces)",
    fontMono: "ui-monospace, SFMono-Regular, Menlo, monospace",
    fontBody: "var(--font-inter)",
    borderRadius: "rounded-2xl",
    borderWidth: "border",
    headlineLead: "Custom websites for businesses that need to",
    headlineAccent: "sell.",
    headlineSignature: "actually",
    bands: ["#c2410c", "#1c2a23", "#5a7a64", "#efe7d8", "#f6f2ea"],
  },
  {
    id: "editorial",
    label: "Editorial",
    closest: "Linear · Vercel",
    bg: "#0c0c0e",
    bgAlt: "#13131a",
    card: "#13131a",
    ink: "#e9e6df",
    inkSoft: "rgba(233,230,223,0.72)",
    inkMuted: "rgba(233,230,223,0.45)",
    accent: "#b8a4ff",
    accentInk: "#0c0c0e",
    border: "rgba(233,230,223,0.12)",
    borderStrong: "#e9e6df",
    selection: "#b8a4ff",
    selectionText: "#0c0c0e",
    fontDisplay: "var(--font-instrument-serif)",
    fontAccent: "var(--font-instrument-serif)",
    fontMono: "ui-monospace, SFMono-Regular, Menlo, monospace",
    fontBody: "var(--font-inter)",
    borderRadius: "rounded-3xl",
    borderWidth: "border",
    headlineLead: "Websites with",
    headlineAccent: "a point of view.",
    headlineSignature: "",
    bands: ["#0c0c0e", "#b8a4ff", "#3d2f6b", "#e9e6df", "#1a1530"],
  },
  {
    id: "expressive",
    label: "Bold & Expressive",
    closest: "Awakened × Mercury",
    bg: "#fbf6e9",
    bgAlt: "#f3eedb",
    card: "#ffffff",
    ink: "#0d1410",
    inkSoft: "rgba(13,20,16,0.72)",
    inkMuted: "rgba(13,20,16,0.5)",
    accent: "#e92e8f",
    accentInk: "#fbf6e9",
    border: "rgba(13,20,16,0.15)",
    borderStrong: "#0d1410",
    selection: "#d4ff5a",
    selectionText: "#0d1410",
    fontDisplay: "var(--font-bricolage)",
    fontAccent: "var(--font-instrument-serif)",
    fontMono: "ui-monospace, SFMono-Regular, Menlo, monospace",
    fontBody: "var(--font-inter)",
    borderRadius: "rounded-3xl",
    borderWidth: "border-2",
    headlineLead: "A website",
    headlineAccent: "deserves.",
    headlineSignature: "your business",
    bands: ["#d4ff5a", "#ffb3d9", "#0d1410", "#e92e8f", "#fbf6e9"],
  },
  {
    id: "architectural",
    label: "Architectural",
    closest: "Stripe Docs × Bauhaus",
    bg: "#f5f3ed",
    bgAlt: "#ebe7dd",
    card: "#ffffff",
    ink: "#0f1115",
    inkSoft: "rgba(15,17,21,0.7)",
    inkMuted: "rgba(15,17,21,0.5)",
    accent: "#c95d3e",
    accentInk: "#f5f3ed",
    border: "rgba(15,17,21,0.18)",
    borderStrong: "#0f1115",
    selection: "#c95d3e",
    selectionText: "#ffffff",
    fontDisplay: "var(--font-plex-sans)",
    fontAccent: "var(--font-instrument-serif)",
    fontMono: "var(--font-dm-mono)",
    fontBody: "var(--font-plex-sans)",
    borderRadius: "rounded-none",
    borderWidth: "border-2",
    headlineLead: "Marketing websites,",
    headlineAccent: "blueprints.",
    headlineSignature: "built like",
    bands: ["#c95d3e", "#4a6b8a", "#0f1115", "#ebe7dd", "#f5f3ed"],
  },
  {
    id: "brutalist",
    label: "Brutalist",
    closest: "MSCHF × Off-White",
    bg: "#f1efe9",
    bgAlt: "#e6e2d8",
    card: "#ffffff",
    ink: "#0a0a0a",
    inkSoft: "rgba(10,10,10,0.78)",
    inkMuted: "rgba(10,10,10,0.55)",
    accent: "#f1ff39",
    accentInk: "#0a0a0a",
    border: "rgba(10,10,10,0.2)",
    borderStrong: "#0a0a0a",
    selection: "#f1ff39",
    selectionText: "#0a0a0a",
    fontDisplay: "var(--font-space-grotesk)",
    fontAccent: "var(--font-newsreader)",
    fontMono: "ui-monospace, SFMono-Regular, Menlo, monospace",
    fontBody: "var(--font-inter)",
    borderRadius: "rounded-none",
    borderWidth: "border-2",
    headlineLead: "Most websites are",
    headlineAccent: "Yours doesn't have to be.",
    headlineSignature: "boring.",
    bands: ["#f1ff39", "#ff3b1f", "#0a0a0a", "#f1efe9", "#0a0a0a"],
  },
];
