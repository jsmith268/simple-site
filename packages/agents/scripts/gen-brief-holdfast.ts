import { readFileSync, writeFileSync } from 'node:fs';
import { generateDesignBrief } from '../src/index';

const envRaw = readFileSync(new URL('../../../.env', import.meta.url), 'utf8');
const m = envRaw.match(/ANTROPIC_KEY\s*=\s*["']?([^"'\n\r]+)["']?/);
if (!m) throw new Error('ANTROPIC_KEY not found in .env');
process.env.ANTHROPIC_API_KEY = m[1].trim();

const businessText = `Holdfast Climbing + Movement — an indoor climbing gym in the RiNo Art District, Denver CO (2500 Larimer St). 22,000 sq ft of bouldering, 50-ft rope & lead walls, auto-belays, a fitness training mezzanine, and a yoga/movement studio. Classes, youth programs, leagues, competitions, memberships, day passes. 200+ routes reset weekly. Founded 2019, 2,500+ members. Voice: bold, energetic, encouraging, community-first, a little irreverent — never bro-y or intimidating. Audience: total beginners to advanced climbers, families, fitness folks. Goal: get people to book a free first climb and convert to memberships. Hours Mon–Fri 6a–11p, Sat–Sun 8a–9p. hello@holdfast.demo, @holdfastclimbing.`;

const brief = await generateDesignBrief(businessText, 'anthropic/claude-opus-4.7');
const out = new URL('../scripts/brief-holdfast.json', import.meta.url);
writeFileSync(out, JSON.stringify(brief, null, 2));
console.log('BRIEF WRITTEN');
console.log('direction:', brief.direction);
console.log('palette:', JSON.stringify(brief.palette));
console.log('fonts:', JSON.stringify(brief.fonts));
console.log('signatureDevices:', JSON.stringify(brief.signatureDevices, null, 2));
console.log('pages:', JSON.stringify(brief.pages.map((p) => ({ name: p.name, slug: p.slug, sections: p.sections.length })), null, 2));
