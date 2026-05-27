import type { Skill } from '../types';

export const marketingVoice: Skill = {
  name: 'marketingVoice',
  kind: 'voice',
  appliesTo: ['copy_editor', 'section_builder'],
  summary: 'Strip the 24 AI tells; write like a real owner; use the trade words.',
  body: `# Marketing Voice

Write copy a careful reader cannot tell was drafted by an LLM. Target: a real owner who knows the trade, confident and concrete. No hype, no filler.

## Core principles
1. Specificity beats abstraction — replace the claim with the thing the claim is made of.
2. Verbs do the work. Cut adjectives and adverbs first.
3. One idea per sentence. Periods are free.
4. Trust the reader. Don't summarize what you just said or pre-announce what's coming.
5. Vary cadence — short, medium, longer, then a fragment. Three same-length sentences in a row is robotic.
6. **Use the trade words.** A bakery has "sourdough" and "proofing," a dentist has "crowns" and "recalls," a plumber has "rough-ins" and "shutoffs." Sanitizing into "solutions" or "services" is a tell.

## The 24 AI tells — ship none of them
**Vocabulary:** elevate, unlock, empower, supercharge, revolutionize, leverage, harness, streamline, drive, deliver, enable · seamlessly, effortlessly, intuitively, holistically, robustly, comprehensively · game-changer, best-in-class, world-class, cutting-edge, next-generation, industry-leading, mission-critical, end-to-end, all-in-one · "solutions" for products · "In today's fast-paced world" · "Whether you're X or Y" · "At its core, X is…" · "AI-powered."
**Structure:** the em-dash hedge; triadic lists ("faster, smarter, simpler"); false parallelism ("Built for X. Designed for Y. Engineered for Z."); summary sentences ("In short…"); topic pre-announcing; slow setup-then-payoff (lead with the payoff); feature dumps in one sentence; headlines of two parallel phrases joined by a period; bullets written as full sentences.
**Tone:** hedging ("up to 37%"); universalizing ("everything just works"); the cheerful close ("We can't wait!"); the "unlike other tools" gesture; "Imagine if you could…"; exclamation points in business copy; a subhead that restates the headline.

## Shapes
- **Hero h1:** 6–11 words. Specific noun + active verb + concrete object. Banned shapes: "The future of X," "X, reimagined," "X for everyone," "Where X meets Y."
- **Subhead:** one sentence ≤22 words. Name the audience+outcome, or the trade-off resolved. Never restate the h1.
- **Body:** 2–4 sentence paragraphs. Numerals not words ("24 hours," "$1,180"). Scope every number; don't say "up to."
- **CTAs:** 2–4 words, imperative, specific ("Book a cleaning" beats "Get started").
- **FAQ:** lead with the answer, no "Great question." One direct sentence, then nuance if needed. Stop.

One-line test: if the sentence could sit on a generic enterprise landing page, rewrite it.`,
};
