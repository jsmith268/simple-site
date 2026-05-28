import type { BusinessInfo, IntakeStyle } from "@simplesight/contracts";

/**
 * The shape the conversational onboarding builds up. Every field is optional
 * except the opener — a busy owner can answer three things and stop; an owner
 * with strong opinions can specify every page and proof point. Pure module
 * (no "use server"), so both the client UI and the server action share it.
 */
export interface ConversationDraft {
  name: string;
  description: string; // "what we're building" — the opener
  category: string;
  primaryGoal: string;
  audience: string[];
  voice: string[]; // mood adjectives
  avoid: string;
  colorChoice: string; // label or 'designer'
  colorNotes: string;
  appearance: "light" | "dark" | "either";
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
    primaryGoal: "",
    audience: [],
    voice: [],
    avoid: "",
    colorChoice: "designer",
    colorNotes: "",
    appearance: "either",
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
  // Fold the high-signal extras the structured schema can't hold into the
  // description so nothing the owner told us is lost on the way to the brief.
  const extras: string[] = [];
  if (d.primaryGoal) extras.push(`The #1 thing a visitor should do: ${d.primaryGoal}.`);
  if (d.audience.length) extras.push(`Audience: ${d.audience.join(", ")}.`);
  if (d.proof.length) extras.push(`Proof points (never invent beyond these): ${d.proof.join("; ")}.`);
  if (d.hours) extras.push(`Hours: ${d.hours}.`);
  const description = [d.description, ...extras].filter(Boolean).join(" ");

  const colorPreference = d.colorChoice === "designer" ? d.colorNotes : [COLOR_LABEL[d.colorChoice], d.colorNotes].filter(Boolean).join("; ");

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

/** The pages a customer can pick (Home is always included). */
export const PAGE_OPTIONS = ["About", "Services", "Menu", "Pricing", "Gallery", "Work", "Team", "Testimonials", "FAQ", "Contact"];
