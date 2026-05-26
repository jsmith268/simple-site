import { z } from 'zod';

/** Style/theme preferences captured in onboarding — guides the Design stages. */
export const IntakeStyle = z.object({
  /** Adjectives the customer picked for how the site should feel. */
  vibe: z.array(z.string()).default([]),
  /** Preferred mood, mapped onto ThemeTokens.mood by the Theme-Designer. */
  mood: z.enum(['minimal', 'warm', 'bold', 'classic', 'modern', 'playful']).optional(),
  colorPreference: z.string().optional(), // free text or hex; agent interprets
  /** URLs of sites whose look they admire (reference research input). */
  referenceUrls: z.array(z.string()).default([]),
  avoid: z.string().optional(), // things they dislike
});
export type IntakeStyle = z.infer<typeof IntakeStyle>;

export const BusinessInfo = z.object({
  name: z.string(),
  tagline: z.string().optional(),
  description: z.string(), // what the business does
  category: z.string(), // e.g. "dentist", "law firm", "cafe" — drives default IA
  services: z.array(z.object({ name: z.string(), description: z.string().optional() })).default([]),
  audience: z.string().optional(),
  locations: z
    .array(
      z.object({
        label: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        region: z.string().optional(),
        country: z.string().optional(),
      }),
    )
    .default([]),
  hours: z.array(z.object({ days: z.string(), open: z.string(), close: z.string() })).default([]),
  contact: z.object({
    email: z.string().optional(),
    phone: z.string().optional(),
    socials: z.array(z.object({ platform: z.string(), url: z.string() })).default([]),
  }),
  /** A site they already have — we crawl it for additional context. */
  existingWebsiteUrl: z.string().optional(),
});
export type BusinessInfo = z.infer<typeof BusinessInfo>;

/** The full intake bundle persisted incrementally during onboarding. */
export const Intake = z.object({
  style: IntakeStyle,
  business: BusinessInfo,
  /** Context extracted from crawling their existing site/socials (optional). */
  crawledContext: z.record(z.unknown()).optional(),
});
export type Intake = z.infer<typeof Intake>;

/** An uploaded or sourced image asset. */
export const Asset = z.object({
  id: z.string(),
  url: z.string(),
  kind: z.enum(['photo', 'logo']),
  alt: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  dominantColor: z.string().optional(),
  source: z.enum(['upload', 'crawl', 'stock']),
});
export type Asset = z.infer<typeof Asset>;
