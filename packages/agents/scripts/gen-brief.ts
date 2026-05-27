import { readFileSync, writeFileSync } from 'node:fs';
import { generateDesignBrief } from '../src/index';

// Load .env (ANTROPIC_KEY typo) from repo root and set the proper var.
const envRaw = readFileSync(new URL('../../../.env', import.meta.url), 'utf8');
const m = envRaw.match(/ANTROPIC_KEY\s*=\s*["']?([^"'\n\r]+)["']?/);
if (!m) throw new Error('ANTROPIC_KEY not found in .env');
process.env.ANTHROPIC_API_KEY = m[1].trim();

const businessText = `Vespera — a candlelit natural wine bar & bottle shop in the Mission, San Francisco. Low-intervention wines by the glass, a bottle shop, weekly tastings, small plates from a rotating local kitchen. Open since 2021. Voice: warm, candid, a little poetic, never pretentious — explains wine like a friend, not a sommelier. Audience: curious drinkers, not snobs. Proof: named one of SF's best new wine bars; ~120 rotating bottles; weekly regulars. Mood: moody, candlelit, warm, earthy with deep wine-red. Goal: get people to visit and reserve for tastings. Mission SF, Tue–Sun evenings, hello@vespera.demo, @vespera.`;

const brief = await generateDesignBrief(businessText, 'anthropic/claude-opus-4.7');
const out = new URL('../scripts/brief.json', import.meta.url);
writeFileSync(out, JSON.stringify(brief, null, 2));
console.log('BRIEF WRITTEN');
console.log('direction:', brief.direction);
console.log('palette:', JSON.stringify(brief.palette));
console.log('fonts:', JSON.stringify(brief.fonts));
console.log('signatureDevices:', JSON.stringify(brief.signatureDevices, null, 2));
