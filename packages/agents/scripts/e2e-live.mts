/**
 * LIVE end-to-end smoke: one full bespoke build via runBespokeBuild on Opus 4.8,
 * deployed (authed Vercel CLI) and vetted by the visual + content critics and the
 * reviser convergence loop — every stage of the real pipeline. Anthropic-only:
 * GPT-5.5 (Studio B) is intentionally out of scope for this pass.
 *
 * Run:  node node_modules/.pnpm/tsx@4.22.3/node_modules/tsx/dist/cli.mjs \
 *         packages/agents/scripts/e2e-live.mts
 */
import { readFileSync } from "node:fs";

const env = readFileSync("/Users/pranayramash/Projects/simple-site/.env", "utf8");
const pick = (...names: string[]): string | undefined => {
  for (const n of names) {
    const m = env.match(new RegExp(`^\\s*${n}\\s*=\\s*["']?([^"'\\n\\r]+)`, "m"));
    if (m) return m[1]!.trim();
  }
  return undefined;
};
const anthropic = pick("ANTHROPIC_API_KEY", "ANTROPIC_KEY", "ANTHROPIC_KEY");
if (anthropic) process.env.ANTHROPIC_API_KEY = anthropic;
const unsplash = pick("UNSPLASH_ACCESS_KEY", "UNSPLASH_KEY");
if (unsplash) process.env.UNSPLASH_ACCESS_KEY = unsplash;
const pexels = pick("PEXELS_API_KEY", "PEXELS_KEY");
if (pexels) process.env.PEXELS_API_KEY = pexels;
// Force LIVE + direct Anthropic (ignore the blocked free-tier gateway).
process.env.SIMPLESIGHT_OFFLINE = "0";
delete process.env.AI_GATEWAY_API_KEY;
delete process.env.VERCEL_OIDC_TOKEN;
console.log("keys:", { anthropic: !!anthropic, unsplash: !!unsplash, pexels: !!pexels });
if (!anthropic) process.exit(1);

// A fresh category with a strong cliché ("sterile dental blue") that the brief is
// explicitly told to subvert — a good test of the anti-cliché + capability gates
// (booking OFF → a contact/appointment-request form, not a booking engine).
const input = `Northlight Dental — a modern family + cosmetic dental practice in the Pearl District, Portland OR (1100 NW Glisan St). Services: cleanings & checkups, cosmetic (whitening, veneers), Invisalign, family & pediatric care, and emergency visits. In practice 12 years, 4.9 stars from 800+ reviews, two dentists and a hygiene team. Voice: warm, calm, genuinely reassuring for nervous patients, plain-spoken — never clinical or salesy. Audience: families and busy professionals in the neighborhood. Primary goal: get new patients to request an appointment. We want a map, a team section, real patient testimonials, an FAQ about insurance and first visits, and a contact/appointment-request form. Pages: Home, Services, Our Team, New Patients, Contact. Hours Mon–Thu 8–5, Fri 8–2. hello@northlightdental.demo, @northlightdental. Mood: calm, modern, warm — NOT the usual sterile dental blue; think soft daylight, warm neutrals, and a confident editorial feel.`;

const { runBespokeBuild } = await import("@simplesight/agents");

const t0 = Date.now();
const run = await runBespokeBuild({
  input,
  projectId: "e2e-northlight",
  slug: "bespoke-northlight",
  dir: "/Users/pranayramash/Projects/bespoke-northlight",
  model: "anthropic/claude-opus-4.8",
  deploy: { scope: "pranayr22-3147s-projects" },
  visualCritic: true,
});

console.log("\n========= LIVE E2E RESULT =========");
console.log("status:", run.status);
console.log("preview:", run.previewUrl ?? "(none)");
console.log("cost $:", (run.costCents / 100).toFixed(2));
console.log("minutes:", ((Date.now() - t0) / 60000).toFixed(1));
console.log("stages:");
for (const s of run.stages) console.log(`  ${s.name}: ${s.status}${s.note ? ` — ${s.note}` : ""}`);
if (run.escalation) console.log("escalation:", run.escalation);
process.exit(run.status === "succeeded" ? 0 : 1);
