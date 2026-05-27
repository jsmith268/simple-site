import { generateJson } from '@simplesight/engine';
import {
  BusinessProfile,
  ComponentType,
  type Intake,
} from '@simplesight/contracts';

/* ──────────────────────────────────────────────────────────────────────────
 * Phase 2 — Onboarding → BusinessProfile
 *   - ONBOARDING_QUESTIONS: the structured intake the portal renders.
 *   - profileFromIntake(): deterministic map from the existing Intake bundle.
 *   - generateBusinessProfile(): a Discovery agent that turns a freeform pitch
 *     (or partial answers) into a complete, structured BusinessProfile — the
 *     bridge that lets a one-paragraph description drive the whole pipeline.
 * ────────────────────────────────────────────────────────────────────────── */

export interface OnboardingQuestion {
  id: string;
  question: string;
  help?: string;
  type: 'text' | 'longtext' | 'list' | 'select' | 'multiselect' | 'checkboxes';
  options?: string[];
  /** Dotted path into BusinessProfile this answer feeds. */
  maps: string;
}

export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  { id: 'name', question: 'What is your business name?', type: 'text', maps: 'name' },
  { id: 'category', question: 'What kind of business is it?', help: 'e.g. climbing gym, wine bar, law firm', type: 'text', maps: 'category' },
  { id: 'oneLiner', question: 'Describe it in one sentence.', type: 'text', maps: 'oneLiner' },
  { id: 'description', question: 'Tell us more — what do you do, and what should it feel like to walk in?', type: 'longtext', maps: 'description' },
  { id: 'offerings', question: 'What do you offer? (services / products)', type: 'list', maps: 'offerings' },
  { id: 'audience', question: 'Who are your customers?', type: 'text', maps: 'audience' },
  { id: 'voice', question: 'How should the writing sound? Pick words — and tell us what to avoid.', help: 'e.g. bold, warm, a little irreverent; never corporate', type: 'text', maps: 'voice' },
  { id: 'proof', question: 'Any proof points or stats? (years, customers, awards)', type: 'list', maps: 'proof.stats' },
  { id: 'primaryGoal', question: 'What is the #1 thing a visitor should do?', help: 'This becomes your main call-to-action.', type: 'text', maps: 'primaryGoal' },
  { id: 'requestedPages', question: 'Which pages do you want? (Home is included)', type: 'list', maps: 'requestedPages' },
  {
    id: 'requestedComponents',
    question: 'Which sections/features do you need?',
    type: 'checkboxes',
    options: [...ComponentType.options],
    maps: 'requestedComponents',
  },
  { id: 'embeds', question: 'Embed any of these?', type: 'checkboxes', options: ['instagram', 'map', 'leadForm', 'booking', 'reviews'], maps: 'embeds' },
  { id: 'address', question: 'Address / service area?', type: 'text', maps: 'locations' },
  { id: 'hours', question: 'Your hours?', type: 'list', maps: 'hours' },
  { id: 'contact', question: 'Email, phone, social handles?', type: 'text', maps: 'contact' },
  { id: 'mood', question: 'Visual mood — words, colors you love/avoid, light or dark?', type: 'text', maps: 'visual' },
  { id: 'references', question: 'Any sites whose *feel* (not content) you admire?', type: 'list', maps: 'visual.referenceUrls' },
];

/** Deterministic best-effort map from the legacy Intake bundle to a BusinessProfile. */
export function profileFromIntake(intake: Intake): BusinessProfile {
  const b = intake.business;
  const s = intake.style;
  return BusinessProfile.parse({
    name: b.name,
    tagline: b.tagline,
    oneLiner: b.tagline ?? b.description.split(/[.!?]/)[0] ?? b.description,
    category: b.category,
    description: b.description,
    offerings: b.services,
    audience: b.audience,
    voice: { adjectives: s.vibe, notNotes: s.avoid },
    proof: { stats: [], awards: [] },
    primaryGoal: 'Contact us',
    requestedPages: [],
    requestedComponents: [],
    embeds: { instagram: false, map: b.locations.length > 0, leadForm: true, booking: false, reviews: false },
    locations: b.locations,
    hours: b.hours,
    contact: {
      email: b.contact.email,
      phone: b.contact.phone,
      socials: b.contact.socials.map((x) => ({ platform: x.platform, url: x.url })),
    },
    visual: {
      moodWords: [s.mood, ...s.vibe].filter(Boolean) as string[],
      colorNotes: s.colorPreference,
      appearance: 'either',
      referenceUrls: s.referenceUrls,
      avoid: s.avoid,
    },
    brandAssets: [],
  });
}

const PROFILE_SHAPE = `Return BusinessProfile JSON with EXACTLY these fields:
{
  "name": string, "tagline"?: string, "oneLiner": string, "category": string, "description": string,
  "offerings": [{ "name": string, "description"?: string }],
  "audience"?: string,
  "voice": { "adjectives": string[], "notNotes"?: string, "notes"?: string },
  "proof": { "stats": [{ "label": string, "value": string }], "awards": string[] },
  "primaryGoal": string,
  "requestedPages": string[],
  "requestedComponents": string[]  // choose from: ${ComponentType.options.join(', ')},
  "embeds": { "instagram": boolean, "map": boolean, "leadForm": boolean, "booking": boolean, "reviews": boolean },
  "locations": [{ "label"?: string, "address"?: string, "city"?: string, "region"?: string, "country"?: string }],
  "hours": [{ "days": string, "open": string, "close": string }],
  "contact": { "email"?: string, "phone"?: string, "socials": [{ "platform": string, "handle"?: string, "url": string }] },
  "visual": { "moodWords": string[], "colorNotes"?: string, "appearance": "light"|"dark"|"either", "referenceUrls": string[], "avoid"?: string },
  "brandAssets": [{ "url": string, "kind": "logo"|"photo", "alt"?: string }]
}`;

/**
 * Discovery agent: freeform business description (and/or partial onboarding
 * answers) → a complete, structured BusinessProfile. Infers category, voice,
 * the single primary goal, and recommends pages/components/embeds typical for
 * the business when the owner didn't specify them. Never fabricates stats.
 */
export async function generateBusinessProfile(input: string, model: string): Promise<BusinessProfile> {
  const system = `You are an intake analyst for a web studio. Convert the business description / onboarding answers into ONE structured BusinessProfile JSON.

Rules:
- Infer sensible values: a concrete category, 3-6 voice adjectives + any banned words/tone ("notNotes"), and the SINGLE most important conversion as "primaryGoal".
- If the owner did NOT specify pages/components/embeds, RECOMMEND the ones typical for this kind of business. (e.g. a gym → pages Home/Classes/Membership/Visit; components pricing-tiers, schedule, team-cards, testimonials, faq-accordion, stat-bento; embeds social-feed(instagram), map, lead-form. A restaurant → menu, gallery, map, reservations. A law firm → practice areas, team, testimonials, lead-form, map.)
- Only set requestedComponents to values from the allowed list.
- Do NOT invent specific numeric stats that weren't given; leave proof.stats empty unless the input states them.
- Keep copy fields concise and faithful to the input's facts.`;

  return generateJson({
    model,
    schema: BusinessProfile,
    system,
    prompt: `Business description / answers:\n${input}\n\n${PROFILE_SHAPE}\n\nProduce the BusinessProfile now as a single JSON object.`,
    maxOutputTokens: 4000,
  });
}

/** Render a BusinessProfile into the compact brief text the Brief agent expects. */
export function profileToBriefInput(p: BusinessProfile): string {
  const parts = [
    `${p.name} — ${p.oneLiner}`,
    `Category: ${p.category}.`,
    p.description,
    p.offerings.length ? `Offerings: ${p.offerings.map((o) => o.name).join(', ')}.` : '',
    p.audience ? `Audience: ${p.audience}.` : '',
    p.voice.adjectives.length ? `Voice: ${p.voice.adjectives.join(', ')}${p.voice.notNotes ? ` — ${p.voice.notNotes}` : ''}.` : '',
    p.proof.stats.length ? `Proof: ${p.proof.stats.map((s) => `${s.value} ${s.label}`).join(', ')}.` : '',
    `Primary goal: ${p.primaryGoal}.`,
    p.locations[0]?.address ? `Location: ${[p.locations[0].address, p.locations[0].city, p.locations[0].region].filter(Boolean).join(', ')}.` : '',
    p.hours.length ? `Hours: ${p.hours.map((h) => `${h.days} ${h.open}–${h.close}`).join('; ')}.` : '',
    p.contact.email ? `Contact: ${p.contact.email}${p.contact.phone ? `, ${p.contact.phone}` : ''}.` : '',
    p.visual.moodWords.length ? `Mood: ${p.visual.moodWords.join(', ')}${p.visual.colorNotes ? ` (${p.visual.colorNotes})` : ''}; appearance ${p.visual.appearance}.` : '',
  ];
  return parts.filter(Boolean).join(' ');
}
