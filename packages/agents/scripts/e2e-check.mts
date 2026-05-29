/**
 * Pre-flight for the live e2e: load the Anthropic key (handling the ANTROPIC_KEY
 * typo), force live mode, and make ONE real Opus 4.8 call (the Design Brief) to
 * confirm the direct-Anthropic path + model id work before we spend on a full build.
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
// Force LIVE + direct Anthropic (ignore the blocked free-tier gateway).
process.env.SIMPLESIGHT_OFFLINE = "0";
delete process.env.AI_GATEWAY_API_KEY;
delete process.env.VERCEL_OIDC_TOKEN;

console.log("anthropic key:", anthropic ? `present (len ${anthropic.length}, starts ${anthropic.slice(0, 7)}…)` : "ABSENT — cannot run live");
if (!anthropic) process.exit(1);

const { isOffline } = await import("@simplesight/env");
console.log("isOffline():", isOffline(), "(must be false)");

const { generateDesignBrief } = await import("@simplesight/agents");
const pitch =
  "Northlight Dental — a modern family + cosmetic dental practice in the Pearl District, Portland OR. Voice: warm, calm, reassuring for nervous patients, plain-spoken — never clinical or salesy. Mood: calm, modern, warm — NOT the usual sterile dental blue.";

const t0 = Date.now();
let cost = 0;
const brief = await generateDesignBrief(pitch, "anthropic/claude-opus-4.8", (c) => {
  cost += c;
});
console.log(`\n✓ Opus 4.8 live call OK in ${((Date.now() - t0) / 1000).toFixed(1)}s, ~${cost.toFixed(2)}¢`);
console.log("direction:", brief.direction);
console.log("palette:", brief.palette.background, "/", brief.palette.foreground, "primary", brief.palette.primary);
console.log("fonts:", brief.fonts.display, "+", brief.fonts.body);
console.log("signatureDevices:", brief.signatureDevices.slice(0, 3).join(" · "));
process.exit(0);
