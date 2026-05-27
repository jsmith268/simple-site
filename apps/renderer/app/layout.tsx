import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Simple Site",
};

// Fonts used across the theme presets — loaded once so any tenant theme renders
// with its real typography instead of falling back to system-ui.
const FONTS_HREF =
  "https://fonts.googleapis.com/css2?" +
  "family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700&" +
  "family=Poppins:wght@400;600;700&" +
  "family=Plus+Jakarta+Sans:wght@400;600;700&" +
  "family=Nunito+Sans:wght@400;600;700&" +
  "family=Libre+Baskerville:wght@400;700&" +
  "family=Source+Sans+3:wght@400;600;700&display=swap";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={FONTS_HREF} />
      </head>
      <body>{children}</body>
    </html>
  );
}
