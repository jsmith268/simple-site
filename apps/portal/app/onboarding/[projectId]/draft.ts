import type { BusinessInfo, IntakeCollected, IntakeStyle } from "@simplesight/contracts";

/**
 * The shape the conversational onboarding builds up. Every field is optional
 * except the opener — a busy owner can answer three things and stop; an owner
 * with strong opinions can specify everything. Pure module (no "use server"),
 * shared by the client UI and the server action.
 */
export interface ConversationDraft {
  name: string;
  description: string; // "what we're building" — the opener
  category: string;
  categoryKey: string; // matched industry key, "" if custom/unknown
  primaryGoal: string;
  audience: string[];
  voice: string[]; // mood adjectives
  avoid: string;
  colorChoice: string; // label or 'designer'
  colorNotes: string;
  appearance: "light" | "dark" | "either";
  logoUrl: string;
  brandColors: string[]; // hex values the owner already has
  pagesMode: "auto" | "custom";
  pages: string[];
  offerings: string[];
  proof: string[]; // "2,500+ members", "Founded 2019"
  references: string[];
  email: string;
  phone: string;
  address: string;
  city: string;
  instagram: string;
  hours: string;
  photos: string[];
  username: string;
}

export function emptyDraft(): ConversationDraft {
  return {
    name: "",
    description: "",
    category: "",
    categoryKey: "",
    primaryGoal: "",
    audience: [],
    voice: [],
    avoid: "",
    colorChoice: "designer",
    colorNotes: "",
    appearance: "either",
    logoUrl: "",
    brandColors: [],
    pagesMode: "auto",
    pages: [],
    offerings: [],
    proof: [],
    references: [],
    email: "",
    phone: "",
    address: "",
    city: "",
    instagram: "",
    hours: "",
    photos: [],
    username: "",
  };
}

/* ── Shared option sets (used by both the steps and the per-category defaults) ── */

export const GOAL_OPTIONS = [
  "Book an appointment",
  "Get a quote",
  "Call us",
  "Reserve a table",
  "Visit in person",
  "Order online",
  "Join the list",
  "See our work",
];
export const VOICE_OPTIONS = [
  "Warm & welcoming",
  "Bold & confident",
  "Refined & premium",
  "Minimal & calm",
  "Playful & fun",
  "Classic & trusted",
  "Modern & sleek",
  "A little irreverent",
];
export const AUDIENCE_OPTIONS = [
  "Local neighbors",
  "Busy professionals",
  "Families",
  "High-end clients",
  "Other businesses",
  "Tourists & visitors",
  "First-timers",
];
export const PAGE_OPTIONS = ["About", "Services", "Menu", "Pricing", "Gallery", "Work", "Team", "Testimonials", "FAQ", "Contact"];

export const COLOR_MAP: Record<string, { choice: string; appearance: ConversationDraft["appearance"] }> = {
  "You choose — I trust you": { choice: "designer", appearance: "either" },
  "Warm & earthy": { choice: "warm", appearance: "light" },
  "Cool blues & greens": { choice: "cool", appearance: "light" },
  "Dark & moody": { choice: "dark", appearance: "dark" },
  "Bright & airy": { choice: "bright", appearance: "light" },
  "I have brand colors": { choice: "custom", appearance: "either" },
};
export const COLOR_OPTIONS = Object.keys(COLOR_MAP);

/* ── Category inference + per-industry defaults ──────────────────────────── */

export interface CategoryRule {
  key: string;
  label: string;
  match: RegExp;
  goal: string;
  voice: string[];
  pages: string[];
}

export const CATEGORY_RULES: CategoryRule[] = [
  {
    key: "homeservices",
    label: "Home services",
    match:
      /\b(plumb\w*|hvac|heating|cooling|air ?condition\w*|furnace|electric\w*|roof\w*|landscap\w*|lawn|garden\w*|pest|exterminat\w*|clean(ing|er|ers)?|maid|handyman|contractor|remodel\w*|renovat\w*|paint(er|ing|ers)?|garage door|fence|fencing|concrete|gutter|drywall|flooring|window|deck|pool service|septic|locksmith|mover|moving|junk removal|tree service|appliance repair)\b/i,
    goal: "Get a quote",
    voice: ["Warm & welcoming", "Classic & trusted"],
    pages: ["Services", "About", "Service Area", "Contact"],
  },
  {
    key: "dental",
    label: "Dental practice",
    match: /\b(dentist\w*|dental|orthodont\w*|ortho|endodont\w*|periodont\w*|invisalign)\b/i,
    goal: "Book an appointment",
    voice: ["Warm & welcoming", "Minimal & calm"],
    pages: ["Services", "Our Team", "New Patients", "Contact"],
  },
  {
    key: "medical",
    label: "Medical practice",
    match: /\b(clinic|physician|doctor|medical|chiropract\w*|physical therapy|dermatolog\w*|pediatric\w*|optometr\w*|urgent care|wellness center)\b/i,
    goal: "Book an appointment",
    voice: ["Warm & welcoming", "Minimal & calm"],
    pages: ["Services", "Our Team", "Patients", "Contact"],
  },
  {
    key: "law",
    label: "Law firm",
    match: /\b(law firm|lawyer|attorney|legal|litigation|counsel|law office|paralegal|estate planning)\b/i,
    goal: "Book a consultation",
    voice: ["Refined & premium", "Classic & trusted"],
    pages: ["Practice Areas", "Attorneys", "Results", "Contact"],
  },
  {
    key: "restaurant",
    label: "Restaurant / café",
    match: /\b(restaurant|cafe|café|coffee|bakery|bar|brewery|winery|bistro|eatery|diner|pizz\w*|taqueria|food truck|kitchen|grill|steakhouse|sushi|deli)\b/i,
    goal: "Reserve a table",
    voice: ["Warm & welcoming", "Bold & confident"],
    pages: ["Menu", "About", "Visit", "Contact"],
  },
  {
    key: "salon",
    label: "Salon / spa",
    match: /\b(salon|spa|barber\w*|nail\w*|hair|lash\w*|brow\w*|wax\w*|esthetic\w*|aesthetic\w*|beauty|med ?spa|massage|skincare)\b/i,
    goal: "Book an appointment",
    voice: ["Refined & premium", "Modern & sleek"],
    pages: ["Services", "Pricing", "Gallery", "Book"],
  },
  {
    key: "fitness",
    label: "Fitness / studio",
    match: /\b(gym|fitness|yoga|pilates|crossfit|climbing|spin studio|cycling|martial|jiu.?jitsu|boxing|dance studio|personal train\w*)\b/i,
    goal: "Book a class",
    voice: ["Bold & confident", "Modern & sleek"],
    pages: ["Classes", "Membership", "Schedule", "Visit"],
  },
  {
    key: "realestate",
    label: "Real estate",
    match: /\b(real estate|realtor\w*|realty|brokerage|property|properties|homes for sale|listings|mortgage)\b/i,
    goal: "Book a viewing",
    voice: ["Refined & premium", "Modern & sleek"],
    pages: ["Listings", "About", "Buyers", "Contact"],
  },
  {
    key: "professional",
    label: "Professional services",
    match: /\b(accountant|accounting|cpa|bookkeep\w*|consult\w*|advisor|financial|insurance|agency|tax|notary|architect\w*|engineer\w*)\b/i,
    goal: "Book a consultation",
    voice: ["Refined & premium", "Modern & sleek"],
    pages: ["Services", "About", "Case Studies", "Contact"],
  },
  {
    key: "retail",
    label: "Shop / retail",
    match: /\b(shop|store|boutique|retail|market|grocer\w*|florist|jewelr\w*|apparel|clothing|furniture)\b/i,
    goal: "Visit in person",
    voice: ["Warm & welcoming", "Modern & sleek"],
    pages: ["Shop", "About", "Visit", "Contact"],
  },
  {
    key: "creative",
    label: "Creative / studio",
    match: /\b(photograph\w*|videograph\w*|design studio|creative|art studio|gallery|interior design|brand studio)\b/i,
    goal: "See our work",
    voice: ["Minimal & calm", "Modern & sleek"],
    pages: ["Work", "About", "Services", "Contact"],
  },
];

/** Detect the business category from the freeform opener. Undefined if unsure. */
export function inferCategory(text: string): CategoryRule | undefined {
  return CATEGORY_RULES.find((r) => r.match.test(text));
}

/** Map what the live "Avery" intake gathered into the onboarding draft. */
export function collectedToDraft(c: IntakeCollected): ConversationDraft {
  const hasColor = (c.brandColors?.length ?? 0) > 0 || !!c.colorNotes;
  return {
    ...emptyDraft(),
    name: c.name ?? "",
    description: c.description ?? c.oneLiner ?? "",
    category: c.category ?? "",
    categoryKey: inferCategory(`${c.category ?? ""} ${c.description ?? ""}`)?.key ?? "",
    primaryGoal: c.primaryGoal ?? "",
    audience: c.audience ?? [],
    voice: c.voice ?? [],
    avoid: c.avoid ?? "",
    colorChoice: hasColor ? "custom" : "designer",
    colorNotes: c.colorNotes ?? "",
    brandColors: c.brandColors ?? [],
    logoUrl: c.logoUrl ?? "",
    pagesMode: (c.pages?.length ?? 0) > 0 ? "custom" : "auto",
    pages: c.pages ?? [],
    offerings: c.offerings ?? [],
    proof: c.proof ?? [],
    references: c.references ?? [],
    email: c.email ?? "",
    phone: c.phone ?? "",
    address: c.address ?? "",
    city: c.city ?? "",
    instagram: c.instagram ?? "",
    hours: c.hours ?? "",
    photos: [],
    username: c.username ?? "",
  };
}

/* ── Sidebar sections (table of contents) ────────────────────────────────── */

export interface Section {
  id: string;
  label: string;
  steps: string[];
}

export const SECTIONS: Section[] = [
  { id: "business", label: "Your business", steps: ["pitch", "name", "category"] },
  { id: "goals", label: "Goals & audience", steps: ["goal", "audience"] },
  { id: "look", label: "Look & feel", steps: ["voice", "color", "avoid"] },
  { id: "content", label: "Pages & content", steps: ["pages", "offerings", "proof"] },
  { id: "details", label: "Contact details", steps: ["contact"] },
  { id: "brand", label: "Logo & photos", steps: ["brand", "photos"] },
  { id: "address", label: "Your address", steps: ["username"] },
  { id: "review", label: "Review & build", steps: ["review"] },
];

const MOOD_MAP: [RegExp, IntakeStyle["mood"]][] = [
  [/minimal|calm|clean|quiet|zen/i, "minimal"],
  [/warm|welcoming|friendly|cozy/i, "warm"],
  [/bold|confident|strong|energetic/i, "bold"],
  [/classic|trusted|timeless|traditional/i, "classic"],
  [/modern|sleek|sharp|contemporary/i, "modern"],
  [/playful|fun|quirky|lively/i, "playful"],
];

function inferMood(voice: string[]): IntakeStyle["mood"] | undefined {
  for (const v of voice) for (const [re, mood] of MOOD_MAP) if (re.test(v)) return mood;
  return undefined;
}

const COLOR_LABEL: Record<string, string> = {
  designer: "",
  warm: "warm, earthy tones",
  cool: "cool blues and greens",
  dark: "dark and moody",
  bright: "bright and airy",
};

/** Map the conversation draft into the persisted intake (style + business). */
export function mapDraftToIntake(d: ConversationDraft): { style: IntakeStyle; business: BusinessInfo } {
  const extras: string[] = [];
  if (d.primaryGoal) extras.push(`The #1 thing a visitor should do: ${d.primaryGoal}.`);
  if (d.audience.length) extras.push(`Audience: ${d.audience.join(", ")}.`);
  if (d.proof.length) extras.push(`Proof points (never invent beyond these): ${d.proof.join("; ")}.`);
  if (d.hours) extras.push(`Hours: ${d.hours}.`);
  const description = [d.description, ...extras].filter(Boolean).join(" ");

  const brandColorNote = d.brandColors.length ? `Exact brand colors: ${d.brandColors.join(", ")}.` : "";
  const colorPreference = [
    d.colorChoice === "designer" ? "" : COLOR_LABEL[d.colorChoice],
    d.colorNotes,
    brandColorNote,
  ]
    .filter(Boolean)
    .join("; ");

  const style: IntakeStyle = {
    vibe: d.voice,
    mood: inferMood(d.voice),
    colorPreference: colorPreference || undefined,
    referenceUrls: d.references,
    avoid: d.avoid || undefined,
  };

  const socials = d.instagram
    ? [{ platform: "instagram", url: d.instagram.startsWith("http") ? d.instagram : `https://instagram.com/${d.instagram.replace(/^@/, "")}` }]
    : [];

  const business: BusinessInfo = {
    name: d.name || "Your Business",
    description: description || "A local business.",
    category: d.category || "small business",
    services: d.offerings.map((name) => ({ name })),
    audience: d.audience.join(", ") || undefined,
    locations: d.address || d.city ? [{ address: d.address || undefined, city: d.city || undefined }] : [],
    hours: [],
    contact: { email: d.email || undefined, phone: d.phone || undefined, socials },
    existingWebsiteUrl: d.references.find((r) => /^https?:\/\//.test(r)),
  };

  return { style, business };
}
