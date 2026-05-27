import { writeFileSync } from 'node:fs';
import { brief, callOpus, extractFiles, writeFiles } from './holdfast-lib';

const system = `You are an award-winning front-end designer/engineer building the SHARED foundation for a BESPOKE, premium MULTI-PAGE website for Holdfast Climbing + Movement (an indoor climbing gym in RiNo, Denver) in Next.js 16 (App Router) + Tailwind v4. Implement the committed Design Brief faithfully. The aesthetic is BOLD, ATHLETIC, ENERGETIC — "Chalk & Concrete Brutalism" — never generic, never a template, never bro-y.

You are producing these shared files. STRICT, NON-NEGOTIABLE buildability constraints:

GLOBAL CONSTRAINTS:
- Tailwind v4 utility classes + the palette CSS variables. No external libraries. No next/image (use plain <img>). No next/font (use Google Fonts <link> in layout).
- Inline SVG for ALL icons/marks. No emoji.
- Any component using useState / onClick / onSubmit / onChange / hover-JS / useEffect MUST start with the line: 'use client'  (exactly, as the very first line, before imports).
- Every component is a proper named default export: export default function Name() { return (...) }. Never return bare JSX at module top level.
- Components import each other via the alias '@/components/<Name>' (tsconfig maps @/* -> ./app/*).
- Use real Unsplash photo URLs in the form https://images.unsplash.com/photo-<id>?auto=format&fit=crop&w=<w>&q=80 — climbing / bouldering / community photos. Always alt text + loading="lazy" on non-hero imgs.
- Escape apostrophes/quotes safely inside JSX text (use &apos; or curly-string where needed) — no raw unescaped quotes that break JSX.

FILES TO PRODUCE:

app/globals.css:
- First line exactly: @import "tailwindcss";
- :root palette vars from the brief: --bg #EFE9DF, --fg #1A1814, --primary #E2522B, --accent #D9C25B, --muted #B8AE9F, plus --chalk #F6F1E7, --slate #1A1814.
- Set body { background: var(--bg); color: var(--fg); }
- Custom utilities/classes: .grain (SVG fractalNoise data-URI overlay ~0.04 opacity), .mesh-hero (warm OKLCH radial gradient orange->clay->chalk + a blurred clay orb), .gradient-text, .tape (6px route-tape colored bar divider), .chalk-circle / .chalk-underline helpers (or rely on inline SVG), .numeral (oversized italic Fraunces section numeral), scroll-reveal keyframes (fade + 24px rise, played on load with stagger via animation-delay utility classes .reveal / .reveal-1 .. .reveal-6), .chalk-draw keyframe (stroke-dashoffset draw-on for SVG).
- @media (prefers-reduced-motion: reduce) { disable all animations, content fully visible }
- IMPORTANT: reveals must degrade gracefully — content visible if animations off; use on-load CSS animations (NO IntersectionObserver in CSS).

app/layout.tsx:
- Root layout: html lang="en", body, import './globals.css'.
- Google Fonts <link> for Fraunces (display, opsz+ital axes) and Newsreader (body serif) and a mono (JetBrains Mono or IBM Plex Mono) for eyebrows. Use <link rel="preconnect"> + the css2 stylesheet link.
- Set CSS var font families in globals or inline; body uses Newsreader, headings Fraunces, eyebrows mono.
- Renders <SiteNav/> then {children} then <SiteFooter/>. Import them from '@/components/SiteNav' and '@/components/SiteFooter'.
- A simple metadata export (title + description) in the brand voice.

app/components/SiteNav.tsx ('use client'):
- A COMPLEX sticky mega-menu nav. Logo "HOLDFAST" (wordmark, with a small inline SVG mark).
- Dropdown menus (real hover on desktop + click, using useState): [Climb ▾ -> links to /climb#bouldering, /climb#ropes, /climb#auto-belays, /climb#training] and [Learn ▾ -> /classes#intro, /classes#youth, /classes#private, /classes#clinics].
- Plus top-level links: Membership (/membership), Visit (/visit).
- A prominent primary button "Free First Climb" -> /visit#book (orange, with hover glow).
- A WORKING mobile hamburger menu toggled via useState that shows all links + dropdown sublinks.
- Use Next Link from 'next/link'. Sticky top with a subtle backdrop blur + hairline bottom border + grain.

app/components/SiteFooter.tsx:
- Rich footer: hours (Mon–Fri 6a–11p, Sat–Sun 8a–9p), address (2500 Larimer St, Denver, CO 80205), nav columns (Climb / Learn / Visit / About), social links (Instagram @holdfastclimbing -> https://instagram.com/holdfastclimbing), and a newsletter email input (this can be a tiny inline 'use client' island OR just a styled <form> with a non-submitting input — if it has onSubmit/useState it MUST be its own 'use client' file; to keep footer a server component, render a plain <form action="#"> with an email input and a button, no JS). Oversized Fraunces "First climb&apos;s on us." sign-off.

app/components/InstagramFeed.tsx:
- Bespoke Instagram-style community feed. Header: @holdfastclimbing avatar (an <img> or styled circle) + handle + follower count (e.g. "8,420 followers") + "Follow on Instagram" button linking to https://instagram.com/holdfastclimbing.
- Responsive grid of 6–8 SQUARE photo tiles (aspect-square), each a real Unsplash climbing/bouldering/community photo, each with a hover overlay showing a heart SVG + like count + a short caption. Hover overlay via CSS group-hover (no JS needed -> can be a server component). Full color (the brief says community gallery earns full color).

app/components/LocationMap.tsx:
- A real embedded Google map in a styled concrete-toned card: <iframe src="https://www.google.com/maps?q=2500%20Larimer%20St%2C%20Denver%2C%20CO%2080205&output=embed" loading="lazy" width="100%" height="..." style/className, title="..."></iframe>. Alongside: the address, hours table, and a "Get Directions" link to https://www.google.com/maps/dir/?api=1&destination=2500+Larimer+St+Denver+CO+80205. Server component (no JS).

app/components/TrialForm.tsx ('use client'):
- Functional lead-capture form. Fields: full name, email, phone, experience level (select: Never climbed / Beginner / Intermediate / Advanced), preferred date (date input), message (textarea). Required-field validation (HTML required + a tiny check). On submit: e.preventDefault(); show a SUCCESS state card ("You&apos;re on the list — see you on the wall.") replacing the form. useState for fields + submitted flag. No backend. Give the form id="book" so /visit#book anchors to it. Style bold/athletic with route-tape accents.

app/components/ui.tsx:
- Small reusable SERVER bits (no 'use client'): export Section (a <section> wrapper with consistent padding + optional tone via prop className), Eyebrow (mono uppercase tracked label with a hairline rule), Stat (big Fraunces number + label), Numeral (oversized italic section numeral, takes n prop), Tape (route-tape colored divider, takes color prop), and a Button-as-link helper if useful. Keep these dependency-free.

app/components/FAQ.tsx ('use client'):
- An accordion FAQ component. Takes a prop items: { q: string; a: string }[]. Uses useState to track open index, animated chevron, route-tape accent on the open item. Export default function FAQ({ items }: { items: { q: string; a: string }[] }).

Return ALL files in EXACTLY this delimited format, nothing else outside the blocks (no markdown fences, no commentary):
=== FILE: app/globals.css ===
<code>
=== FILE: app/layout.tsx ===
<code>
=== FILE: app/components/SiteNav.tsx ===
<code>
=== FILE: app/components/SiteFooter.tsx ===
<code>
=== FILE: app/components/InstagramFeed.tsx ===
<code>
=== FILE: app/components/LocationMap.tsx ===
<code>
=== FILE: app/components/TrialForm.tsx ===
<code>
=== FILE: app/components/ui.tsx ===
<code>
=== FILE: app/components/FAQ.tsx ===
<code>`;

const prompt = `The committed Design Brief (implement it faithfully):\n${brief}\n\nBusiness facts for copy:\n- Holdfast Climbing + Movement, RiNo Art District, Denver CO, 2500 Larimer St 80205. Founded 2019, 2,500+ members.\n- 22,000 sq ft: bouldering, 50-ft rope & lead walls, auto-belays, fitness training mezzanine, yoga/movement studio. 200+ routes reset weekly.\n- Classes, youth programs, leagues, competitions, memberships, day passes.\n- Hours: Mon–Fri 6a–11p, Sat–Sun 8a–9p. Email hello@holdfast.demo. Instagram @holdfastclimbing.\n- Goal: book a free first climb -> convert to membership.\nVoice: bold, energetic, encouraging, community-first, a little irreverent — never bro-y, never says &apos;crush it&apos;.\n\nWrite ALL nine complete files now. Make it gorgeous, specific, bold, and buildable.`;

const text = await callOpus(system, prompt, 48000);
writeFileSync(new URL('./foundation-output.txt', import.meta.url), text);
const files = extractFiles(text);
console.log('Extracted files:', Object.keys(files));
writeFiles(files);
