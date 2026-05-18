// Shared content used across the agency site.

// Active launch promo — 50% off every regular price below.
export const PROMO = {
  active: true,
  discountPct: 50,
  badge: "Limited time · 50% off",
  helper: "Launch promo — every price below is 50% off for a limited time.",
};

// Helper: half the price, floored to whole dollars (customer pays slightly
// less than exact half on prices ending in .50).
export function promoPrice(regular: number): number {
  return Math.floor(regular / 2);
}

export const PRICING = {
  base: {
    name: "Custom Website",
    price: 4995,
    blurb:
      "A unique, conversion-focused marketing site. Three completely original design directions, up to five rounds of revisions, live in under 72 hours.",
    includes: [
      "Three completely original design concepts",
      "Up to 5 pages of content",
      "Mobile-first, responsive build",
      "Contact form & Google Maps embed",
      "Basic on-page SEO + Open Graph",
      "Deployed to a fast global CDN",
      "Up to 5 free revision rounds",
    ],
  },
  addons: [
    {
      name: "Blog / CMS",
      price: 1995,
      billing: "one-time" as const,
      blurb:
        "Post and edit articles yourself. Self-serve dashboard, no engineer required.",
    },
    {
      name: "Extra page",
      price: 995,
      unit: "/ page",
      billing: "one-time" as const,
      blurb: "Each additional page beyond the five included.",
    },
    {
      name: "Custom integrations",
      price: null,
      billing: "one-time" as const,
      blurb:
        "Stripe, online booking, CRM connections, custom forms — quoted by scope.",
    },
  ],
  recurring: [
    {
      name: "Hosting",
      blurb:
        "Fast global CDN, automatic deploys, SSL, uptime monitoring, daily backups. Everything required to keep your site fast and online.",
      annual: 995,
    },
    {
      name: "Domain",
      blurb:
        ".com or .ca registration, renewal, and DNS management — we handle the registrar so you never have to log in.",
      annual: 199,
    },
  ],
};

export const HERO = {
  eyebrow: "50% off · Live in 72 hours",
  description:
    "Three completely original design concepts, live in under 72 hours. Launch promo: every price 50% off, limited time.",
  primaryCta: { label: "Start your site — $2,497", href: "/start" },
  // Note: secondaryCta on the marketing site is repurposed as the design cycler.
  secondaryCta: { label: "See our work", href: "#work" },
};

export const PRINCIPLES = [
  {
    title: "Real designers.",
    body: "The same person who scopes your site builds it. No PMs, no offshoring, no junior bench passed off as senior work.",
  },
  {
    title: "Fixed pricing.",
    body: "Full transparency from quote to launch. The price you see is the price you pay.",
  },
  {
    title: "Three real directions.",
    body: "Not three colorways of the same template. Three completely different design concepts, hand-built for you.",
  },
  {
    title: "Built to convert.",
    body: "Every layout decision starts with one question: does this make it easier for the right visitor to take action?",
  },
];

export const PROCESS = [
  {
    n: "01",
    title: "Submit your intake",
    body:
      "An 8-minute form. Pages, content, vibe, references — anything you have is the brief. No discovery call, no slide decks.",
    detail: "We email if we have questions. We don't book meetings.",
  },
  {
    n: "02",
    title: "Receive three concepts",
    body:
      "Within 24 hours we send three completely original design concepts. Different layouts, different typography, different moods. You pick one.",
    detail: "Not happy with any of them? A fourth round is on us, no charge.",
  },
  {
    n: "03",
    title: "Live on the internet",
    body:
      "We build the site, you review, we revise. Up to five rounds of revisions included. From signed intake to live URL: under 72 hours.",
    detail: "Deployed to a fast global CDN with SSL and uptime monitoring from minute zero.",
  },
];

// Each project is described factually — real name, URL, location/industry tag,
// short description of what was built.
export const WORK = [
  {
    name: "Hunter Doors",
    site: "hunterdoors.ca",
    url: "https://www.hunterdoors.ca",
    tag: "Garage doors",
    location: "Calgary, AB",
    blurb:
      "Lead-generation site for a residential garage door specialist. Service areas, before/after gallery, and an instant-quote form.",
  },
  {
    name: "Ambient Home Services",
    site: "ambienthomeservices.com",
    url: "https://www.ambienthomeservices.com",
    tag: "HVAC holdco",
    location: "United States",
    blurb:
      "Marketing site for a multi-brand HVAC roll-up. Plain-spoken, built to earn trust with operators looking to sell their business.",
  },
  {
    name: "Awakened Pilates",
    site: "awakenedpilates.com",
    url: "https://www.awakenedpilates.com",
    tag: "Boutique studio",
    location: "Vancouver, BC",
    blurb:
      "Booking-driven studio site with a class taxonomy, instructor bios, and an intro-offer funnel for new clients.",
  },
];

// Who Simple Site is for. Punchy, outcome-focused descriptions —
// owner-operators, not org charts.
export const AUDIENCE = [
  {
    name: "Solo founders & start-ups",
    body: "Just you, or just a few. We build the site that makes you look like a team.",
  },
  {
    name: "Trades & home services",
    body: "Your phone is the funnel. Our site is what makes it ring.",
  },
  {
    name: "Professional services",
    body: "Lawyers, accountants, consultants. Credibility on demand.",
  },
  {
    name: "Studios & local services",
    body: "Pilates, salons, clinics. Built around how you take bookings.",
  },
  {
    name: "Restaurants & retail",
    body: "Menus, hours, locations. Faster to update than your POS.",
  },
  {
    name: "E-commerce storefronts",
    body: "Your storefront, told like a brand. Not a Shopify theme.",
  },
];

export const FAQS = [
  {
    q: "What does the $2,497 launch promo actually get me?",
    a: "A fully designed, custom-built marketing website — up to five pages, mobile-first, fast, SEO-ready, with a working contact form. Three original design directions and up to five rounds of revisions are included. It is not a template. The $2,497 price is the launch-promo price (50% off the $4,995 regular rate) and lasts for a limited time.",
  },
  {
    q: "How long does it take?",
    a: "Most sites are live in under 72 hours from intake submission. Three original concepts inside 24 hours, then build, revisions, launch — all within three days.",
  },
  {
    q: "Why is hosting recurring?",
    a: "Hosting keeps your site online — fast CDN delivery, SSL, automatic deploys, monitoring, daily backups. $995/year, or $497/year during the launch promo (50% off, limited time). You can also bring your own hosting if you prefer.",
  },
  {
    q: "Do I have to use you for hosting and the domain?",
    a: "No. Both are optional. We hand you the source code and you're free to host it anywhere — Vercel, Netlify, your own server. Most clients pick our hosting because it's set-and-forget, but it's never a lock-in.",
  },
  {
    q: "What if I want to update content myself?",
    a: "Add the Blog / CMS option ($997 during the launch promo, $1,995 regular) and you can log in, write, and publish posts yourself from a simple dashboard. For ongoing edits to other pages, send us a list — most copy edits fall inside your five revision rounds.",
  },
  {
    q: "What if I don't like any of the three concepts?",
    a: "A fourth round is on us, free. The intake form is designed to surface enough of your taste that we land close on the first pass — but the safety net is there if we don't.",
  },
  {
    q: "Can you build a store, booking system, or something custom?",
    a: "We focus on marketing sites for service businesses. For ecommerce, online booking, CRM connections, or anything beyond a contact form, we quote it as a custom integration on top of the base — or refer you out if it's outside our scope.",
  },
  {
    q: "Who actually does the work?",
    a: "A small, hands-on team. The same designer who scopes your site builds it. No project managers, no offshoring, no junior bench passed off as senior work.",
  },
];

export const NAV = [
  { label: "Built for", href: "#built-for" },
  { label: "How it works", href: "#how" },
  { label: "Work", href: "#work" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];
