import { Bricolage_Grotesque, Instrument_Serif } from "next/font/google";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export default function V3Layout({ children }: { children: React.ReactNode }) {
  return <div className={`${bricolage.variable} ${instrumentSerif.variable}`}>{children}</div>;
}
