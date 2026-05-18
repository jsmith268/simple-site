import { Space_Grotesk, Newsreader } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

export default function V5Layout({ children }: { children: React.ReactNode }) {
  return <div className={`${spaceGrotesk.variable} ${newsreader.variable}`}>{children}</div>;
}
