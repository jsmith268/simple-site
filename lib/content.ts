// Shared content across all website variants.
// Copy stays consistent; designs diverge visually.

export const PRICING = {
  base: {
    name: "Custom Website",
    price: 995,
    blurb:
      "A unique, conversion-focused marketing site. Three completely original design directions, up to five rounds of revisions, live in two weeks.",
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
      price: 495,
      billing: "one-time",
      blurb:
        "Post and edit articles yourself. Self-serve dashboard, no engineer required.",
    },
    {
      name: "Extra page",
      price: 195,
      unit: "/ page",
      billing: "one-time",
      blurb: "Each additional page beyond the five included.",
    },
    {
      name: "Custom integrations",
      price: null,
      billing: "one-time",
      blurb:
        "Stripe, online booking, CRM connections, custom forms — quoted by scope.",
    },
  ],
  recurring: [
    {
      name: "Hosting",
      blurb:
        "Fast global CDN, automatic deploys, SSL, uptime monitoring, daily backups. Everything required to keep your site fast and online.",
      monthly: 29,
      annual: 249,
      annualSavings: 99,
    },
    {
      name: "Domain",
      blurb:
        ".com or .ca registration, renewal, and DNS management — we handle the registrar so you never have to log in.",
      annual: 49,
    },
  ],
  notIncluded: [
    "Discovery calls billed by the hour",
    "Strategy decks you'll never read",
    "Surprise change orders",
    "Lock-in retainers",
    "Templates dressed up as 'custom'",
  ],
};

export const HERO = {
  eyebrow: "Now booking · 4 builds remaining for May",
  description:
    "Three completely original design concepts. One fixed $995 price. Live in two weeks.",
  primaryCta: { label: "Start your site — $995", href: "/start" },
  // Note: secondaryCta on the marketing site is repurposed as the design cycler.
  secondaryCta: { label: "See our work", href: "#work" },
};

export const PRINCIPLES = [
  {
    title: "No discovery decks.",
    body: "We don't charge for slide decks. The intake form on day one is the only briefing we need.",
  },
  {
    title: "Fixed pricing.",
    body: "The price you see is the price you pay. No mystery line items. No 'scope creep' invoices later.",
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
    title: "Tell us about your business",
    body: "An 8-minute intake form. Pages, content, vibe, references, anything you have. The questions are designed to surface enough of your taste that we get close on the first pass.",
    detail: "We never schedule a discovery call. If we need clarification, we email.",
  },
  {
    n: "02",
    title: "Pick a direction",
    body: "Within 5 business days we send three completely distinct design concepts. Different layouts, different typography, different moods. You pick one.",
    detail: "If somehow none of the three fit, we do a fourth round at no charge.",
  },
  {
    n: "03",
    title: "We build, you refine",
    body: "We build the site and hand it back to you with up to 5 free rounds of revisions. Once you're happy, we publish to a fast global CDN and you're live.",
    detail: "From signed intake to live URL is typically 12–14 days.",
  },
];

// Each project is described factually — real name, URL, location/industry tag,
// short description of what was built. No invented metrics or fabricated brand
// palettes — each variant's own design system styles the cards.
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

// Who Simple Site is for. Explicitly small, simple, owner-operated.
export const AUDIENCE = [
  {
    name: "Solo entrepreneurs",
    body: "One-person operations that need to look bigger than they are — without paying agency rates to get there.",
  },
  {
    name: "Small businesses",
    body: "Owner-operated companies under 25 staff, focused on local or regional growth.",
  },
  {
    name: "Professional services",
    body: "Consultants, accountants, lawyers, designers, coaches — anyone selling expertise.",
  },
  {
    name: "Home services",
    body: "Contractors, HVAC, roofing, plumbing, electrical, garage doors, landscaping.",
  },
  {
    name: "E-commerce stores",
    body: "Shopify or stand-alone shops that need a marketing site that doesn't look like every other Shopify theme.",
  },
  {
    name: "Restaurants & retail",
    body: "Single- or multi-location food, coffee, and shops — menus, hours, locations, easy to update.",
  },
];

// Who Simple Site is NOT for — keeps the targeting honest.
export const NOT_FOR = [
  "Enterprise teams with procurement processes",
  "Franchises with 50+ locations",
  "VC-backed startups with in-house design",
  "Anyone who needs an RFP before a quote",
];

export const FAQS = [
  {
    q: "What does $995 actually get me?",
    a: "A fully designed, custom-built marketing website — up to five pages, mobile-first, fast, SEO-ready, with a working contact form. Three original design directions and up to five rounds of revisions are included. It is not a template.",
  },
  {
    q: "How long does it take?",
    a: "Most sites are live within 12–14 days of you completing the intake form. Three concepts in five business days, then build, then revisions, then launch.",
  },
  {
    q: "Why is hosting recurring?",
    a: "Hosting is what keeps your site online — fast CDN delivery, SSL, automatic deploys, monitoring, and daily backups. $29/month or $249/year if you pay annually (save $99). You can also bring your own hosting if you prefer.",
  },
  {
    q: "Do I have to use you for hosting and the domain?",
    a: "No. Both are optional. We hand you the source code and you're free to host it anywhere — Vercel, Netlify, your own server. Most clients pick our hosting because it's set-and-forget and we handle every update, but it's never a lock-in.",
  },
  {
    q: "What if I want to update content myself?",
    a: "Add the Blog / CMS option ($495) and you can log in, write, and publish posts yourself from a simple dashboard. For ongoing edits to other pages, send us a list — most copy edits fall inside your five revision rounds.",
  },
  {
    q: "What if I don't like any of the three concepts?",
    a: "It's never happened, but if it did we'd do a fourth round free. The intake form is designed to surface enough of your taste that we land close on the first pass.",
  },
  {
    q: "Can you build a store, booking system, or something custom?",
    a: "We focus on marketing sites for service businesses. For ecommerce, online booking, CRM connections, or anything custom beyond a contact form, we quote it as a custom integration on top of the base — or refer you out if it's outside our scope.",
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
