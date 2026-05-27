import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Simple Site",
};

// Fonts spanning the theme presets — loaded once so any tenant theme renders
// with its real typography (variable axes incl. Newsreader opsz) instead of
// falling back to system-ui.
const FONTS_HREF =
  "https://fonts.googleapis.com/css2?" +
  "family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400&" +
  "family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;1,6..72,400&" +
  "family=Manrope:wght@400;500;600;700;800&" +
  "family=Space+Grotesk:wght@400;500;600;700&" +
  "family=Poppins:wght@400;600;700&" +
  "family=Plus+Jakarta+Sans:wght@400;600;700&" +
  "family=Nunito+Sans:wght@400;600;700&" +
  "family=Libre+Baskerville:wght@400;700&" +
  "family=Source+Sans+3:wght@400;600;700&" +
  "family=JetBrains+Mono:wght@400;500&display=swap";

// Mark JS available (pre-paint) + reveal sections on scroll. No-JS/crawlers see
// full content; reduced-motion is handled in globals.css.
const MOTION_JS = `document.documentElement.classList.add('js');
document.addEventListener('DOMContentLoaded',function(){
  try{
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target);}});},{threshold:0.1,rootMargin:'0px 0px -6% 0px'});
    document.querySelectorAll('.ss-site section').forEach(function(s){io.observe(s);});
  }catch(e){document.querySelectorAll('.ss-site section').forEach(function(s){s.classList.add('is-visible');});}
});`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={FONTS_HREF} />
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static first-party motion bootstrap */}
        <script dangerouslySetInnerHTML={{ __html: MOTION_JS }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
