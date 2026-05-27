import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { generateDesignBrief } from '../src/index';

const envRaw = readFileSync(new URL('../../../.env', import.meta.url), 'utf8');
const m = envRaw.match(/ANTROPIC_KEY\s*=\s*["']?([^"'\n\r]+)["']?/);
if (!m) throw new Error('ANTROPIC_KEY not found in .env');
process.env.ANTHROPIC_API_KEY = m[1].trim();

const OUT = '/Users/pranayramash/Projects/bespoke-holdfast/brief.json';

if (existsSync(OUT) && readFileSync(OUT, 'utf8').trim().length > 50) {
  console.log('BRIEF ALREADY EXISTS, skipping');
  process.exit(0);
}

const businessText = `Holdfast Climbing + Movement — an indoor climbing gym in the RiNo Art District, Denver CO (2500 Larimer St). 22,000 sq ft of bouldering, 50-ft rope & lead walls, auto-belays, a fitness training mezzanine, and a yoga/movement studio. Classes, youth programs, leagues, competitions, memberships, day passes. 200+ routes reset weekly. Founded 2019, 2,500+ members. Voice: bold, energetic, encouraging, community-first, a little irreverent — never bro-y or intimidating. Audience: total beginners to advanced climbers, families, fitness folks. Goal: get people to book a free first climb and convert to memberships. Hours Mon–Fri 6a–11p, Sat–Sun 8a–9p. hello@holdfast.demo, @holdfastclimbing. Aesthetic should be bold, athletic, energetic.`;

async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  const delays = [20000, 40000, 60000, 60000, 60000, 60000];
  let lastErr: unknown;
  for (let attempt = 0; attempt <= delays.length; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastErr = err;
      const msg = String(err?.message ?? err);
      const status = err?.statusCode ?? err?.status;
      const transient = /529|overload|429|5\d\d|rate.?limit|timeout|ETIMEDOUT|ECONNRESET/i.test(msg) || (status && status >= 429);
      if (!transient || attempt === delays.length) throw err;
      const wait = delays[attempt];
      console.error(`[${label}] transient error (attempt ${attempt + 1}): ${msg}. sleeping ${wait / 1000}s`);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  throw lastErr;
}

const brief = await withRetry(() => generateDesignBrief(businessText, 'anthropic/claude-opus-4.7'), 'brief');
writeFileSync(OUT, JSON.stringify(brief, null, 2));
console.log('BRIEF WRITTEN');
console.log('direction:', brief.direction);
console.log('palette:', JSON.stringify(brief.palette));
console.log('fonts:', JSON.stringify(brief.fonts));
console.log('signatureDevices:', JSON.stringify(brief.signatureDevices));
console.log('pages:', brief.pages.map((p: any) => p.slug).join(', '));
