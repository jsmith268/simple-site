import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Simple Site — Custom websites for small businesses, from $995",
  description:
    "We design and build distinctive, conversion-focused websites for service businesses. Fixed pricing. Real designers. Live in two weeks.",
  metadataBase: new URL("https://simplesite.co"),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
