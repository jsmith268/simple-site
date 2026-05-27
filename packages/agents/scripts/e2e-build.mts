/**
 * End-to-end product test: drives the REAL pipeline via runBespokeBuild().
 * A brand-new vertical (specialty coffee roaster) given as a freeform pitch, so
 * this also exercises the Discovery agent (freeform → BusinessProfile).
 * No cost ceiling (per project decision). Deploys + runs the visual critic.
 */
import { readFileSync } from 'node:fs';

const env = readFileSync('/Users/pranayramash/Projects/simple-site/.env', 'utf8');
const pick = (...names: string[]): string | undefined => {
  for (const n of names) {
    const m = env.match(new RegExp(`^${n}\\s*=\\s*["']?([^"'\\n\\r]+)`, 'm'));
    if (m) return m[1].trim();
  }
  return undefined;
};
const anthropic = pick('ANTHROPIC_API_KEY', 'ANTROPIC_KEY', 'ANTHROPIC_KEY');
if (anthropic) process.env.ANTHROPIC_API_KEY = anthropic;
const unsplash = pick('UNSPLASH_ACCESS_KEY', 'UNSPLASH_KEY', 'UNSPLASH_API_KEY');
if (unsplash) process.env.UNSPLASH_ACCESS_KEY = unsplash;
const pexels = pick('PEXELS_API_KEY', 'PEXELS_KEY');
if (pexels) process.env.PEXELS_API_KEY = pexels;
console.log('keys loaded:', { anthropic: !!anthropic, unsplash: !!unsplash, pexels: !!pexels });

const { runBespokeBuild } = await import('../src/index');

const input = `Wandercup Coffee Roasters — a specialty coffee roaster and neighborhood cafe in the Alberta Arts District, Portland, Oregon (1820 NE Alberta St). We roast small-batch single-origin coffees and seasonal blends in-house, run a warm cafe, sell beans online, supply wholesale to local restaurants and offices, and host monthly public cuppings/tasting events. Founded 2017. Voice: warm, craft-obsessed, nerdy-but-welcoming, community-rooted — never pretentious or snobby. Audience: neighborhood regulars, curious coffee lovers, and wholesale/restaurant buyers. Primary goal: get people to visit the cafe and buy beans (online + wholesale inquiries). We want an Instagram feed of latte art + roasting days, a map of the cafe, and a wholesale/contact inquiry form. Pages: Home, Our Coffee (beans + roasting), The Cafe (visit), Wholesale, About. Hours 6:30a–6p daily. hello@wandercup.demo, @wandercupcoffee. Mood: warm, earthy, editorial, tactile — kraft paper, warm browns, cream, a pop of burnt orange.`;

const run = await runBespokeBuild({
  input,
  projectId: 'e2e-wandercup',
  slug: 'bespoke-wandercup',
  dir: '/Users/pranayramash/Projects/bespoke-wandercup',
  model: 'anthropic/claude-opus-4.7',
  deploy: { scope: 'pranayr22-3147s-projects' },
  visualCritic: true,
});

console.log('\n========= E2E RESULT =========');
console.log('status:', run.status);
console.log('preview:', run.previewUrl ?? '(none)');
console.log('cost ¢:', run.costCents);
console.log('stages:', run.stages.map((s) => `${s.name}:${s.status}`).join(' '));
if (run.escalation) console.log('escalation:', run.escalation);
process.exit(0);
