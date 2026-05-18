import { Instrument_Serif } from "next/font/google";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export default function V2Layout({ children }: { children: React.ReactNode }) {
  return <div className={instrumentSerif.variable}>{children}</div>;
}
