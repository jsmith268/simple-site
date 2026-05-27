import type { BusinessInfo } from '@simplesight/contracts';
import { generateStructured } from '@simplesight/engine';
import { getSkill, type CategoryPlaybook } from '@simplesight/skills';
import { z } from 'zod';

/**
 * Rich, AI-generated content for a whole site. Flat-ish so strong models fill
 * it reliably. assembleSite maps this across the playbook's pages.
 */
export const ContentBundleSchema = z.object({
  hero: z.object({
    eyebrow: z.string(),
    headline: z.string(),
    emphasis: z.string().describe('a short exact substring of headline to gradient-emphasize'),
    subheadline: z.string(),
    primaryCta: z.string(),
    secondaryCta: z.string(),
  }),
  about: z.object({ headline: z.string(), paragraphs: z.array(z.string()).min(2) }),
  services: z.object({
    headline: z.string(),
    intro: z.string(),
    items: z.array(z.object({ name: z.string(), description: z.string() })).min(3),
  }),
  feature: z.object({
    eyebrow: z.string(),
    headline: z.string(),
    body: z.string(),
    bullets: z.array(z.string()).min(3),
  }),
  faqs: z.array(z.object({ question: z.string(), answer: z.string() })).min(4),
  testimonials: z.array(z.object({ quote: z.string(), author: z.string(), role: z.string() })).min(2),
  stats: z.array(z.object({ value: z.string(), label: z.string() })).min(3),
  cta: z.object({ headline: z.string(), subtext: z.string() }),
  seo: z.object({ title: z.string(), description: z.string() }),
});
export type ContentBundle = z.infer<typeof ContentBundleSchema>;

function skillText(...names: string[]): string {
  return names
    .map((n) => getSkill(n))
    .filter(Boolean)
    .map((s) => `## ${s!.name}\n${s!.body}`)
    .join('\n\n');
}

/**
 * Generate a full content bundle for a business via the AI Gateway. The system
 * prompt injects the premium-design + marketing-voice + design-standards skills
 * and the category playbook's voice, so output reflects that expertise.
 */
export async function generateContentBundle(
  business: BusinessInfo,
  playbook: CategoryPlaybook,
  model: string,
): Promise<ContentBundle> {
  const system = `You are a senior brand designer and conversion copywriter creating the COMPLETE content for a small-business website. Produce content that reads as if a top studio wrote it — specific, confident, human.

Apply this expertise rigorously:
${skillText('premium-design', 'marketing-voice', 'design-standards')}

Category guidance for a "${playbook.label}": ${playbook.tone}

RULES:
- Write rich, SPECIFIC, detailed copy — not generic filler. Use the trade's real vocabulary.
- about.paragraphs: 2–3 substantive paragraphs telling a real story (history, philosophy, what makes them different).
- services.items: 4–6 with a concrete 1–2 sentence description each.
- feature: one standout differentiator with a meaty body + 3–5 concrete bullets.
- faqs: 5–6 substantive Q&As answering real customer concerns (pricing, process, timing, what to expect).
- testimonials: 2–3 believable, specific quotes with a name + role (clearly illustrative sample content).
- stats: 3–4 plausible, on-brand metrics (illustrative).
- hero.emphasis MUST be an exact substring of hero.headline.
- NO AI-tell words (elevate, unlock, empower, leverage, seamless, "in today's world"), no three-part lists, no em-dash drama, no exclamation points.`;

  const prompt = `Business details:\n${JSON.stringify(business, null, 2)}\n\nWrite the full website content bundle as JSON matching the schema.`;

  const { output } = await generateStructured({
    model,
    schema: ContentBundleSchema,
    system,
    prompt,
    maxOutputTokens: 9000,
    temperature: 0.75,
  });
  return output;
}
