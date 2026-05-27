import type { BlockType } from '@simplesight/contracts';

export type SectionTone = 'default' | 'muted' | 'inverted';

/** One placed block in a page plan. `content` keys into the playbook's content. */
export interface BlockPlanItem {
  type: BlockType;
  variant?: string;
  tone?: SectionTone;
  /** Which playbook content to use ('services'|'faqs'|'hero'|'gallery'|...) or omit for the block sample. */
  content?: string;
}

export interface PagePlan {
  slug: string; // '' = home
  title: string;
  blocks: BlockPlanItem[];
}

/** Real, hotlinkable photo URLs (Unsplash) per slot. */
export interface ImageSet {
  hero: string;
  about?: string;
  feature?: string;
  gallery?: string[];
  team?: string[];
}

/**
 * Per-vertical expertise that drives the deterministic floor AND seeds the live
 * design/IA agents' prompts: page structure, palette family, imagery, default
 * services/FAQ, voice. This is the highest-leverage "skill" in the system.
 */
export interface CategoryPlaybook {
  key: string;
  label: string;
  /** Lowercase substrings matched against business.category. */
  match: string[];
  /** Preset key from @simplesight/theme. */
  paletteFamily: string;
  pages: PagePlan[];
  images: ImageSet;
  /** Category-appropriate services used when the customer didn't supply their own. */
  services: { name: string; description?: string }[];
  faqs: { question: string; answer: string }[];
  /** Voice/tone guidance for the copy agent. */
  tone: string;
  hero: { eyebrow?: string; headline: string; subheadline: string };
  /** Realistic stat labels (values come from real data; never fabricate). */
  statLabels?: string[];
}

export type SkillKind = 'design' | 'voice' | 'imagery' | 'ia' | 'review' | 'category';

/** A reusable expertise document injected into an agent's system prompt. */
export interface Skill {
  name: string;
  kind: SkillKind;
  /** Agent names this applies to; ['*'] = all producers. */
  appliesTo: string[];
  /** One-line summary for the admin UI. */
  summary: string;
  /** Markdown expertise injected into prompts. */
  body: string;
}
