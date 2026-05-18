import { IBM_Plex_Sans, DM_Mono } from "next/font/google";

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

export default function V4Layout({ children }: { children: React.ReactNode }) {
  return <div className={`${plex.variable} ${dmMono.variable}`}>{children}</div>;
}
