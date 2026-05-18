import {
  Fraunces,
  Instrument_Serif,
  Bricolage_Grotesque,
  IBM_Plex_Sans,
  DM_Mono,
  Space_Grotesk,
  Newsreader,
} from "next/font/google";

// /v6 cycles through all 5 design themes. Each theme uses different fonts,
// so this route loads them all. Production caches subsetted fonts per visitor;
// dev cost is bounded by Turbopack and within the watchdog ceiling.

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
});

const plex = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "700"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic"],
  display: "swap",
});

export default function V6Layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${fraunces.variable} ${instrumentSerif.variable} ${bricolage.variable} ${plex.variable} ${dmMono.variable} ${spaceGrotesk.variable} ${newsreader.variable}`}
    >
      {children}
    </div>
  );
}
