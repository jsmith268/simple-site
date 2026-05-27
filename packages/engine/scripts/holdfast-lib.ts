import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { generateText } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';

const envRaw = readFileSync(new URL('../../../.env', import.meta.url), 'utf8');
const m = envRaw.match(/ANTROPIC_KEY\s*=\s*["']?([^"'\n\r]+)["']?/);
if (!m) throw new Error('ANTROPIC_KEY not found');
export const apiKey = m[1].trim();

export const APP = '/Users/pranayramash/Projects/bespoke-holdfast';
export const brief = readFileSync(
  new URL('../../agents/scripts/brief-holdfast.json', import.meta.url),
  'utf8',
);

const anthropic = createAnthropic({ apiKey });

export async function callOpus(system: string, prompt: string, maxOutputTokens = 32000): Promise<string> {
  const { text } = await generateText({
    model: anthropic('claude-opus-4-7'),
    system,
    prompt,
    maxOutputTokens,
  });
  return text;
}

// Extract all "=== FILE: <path> ===" blocks from a delimited response.
export function extractFiles(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  const re = /=== FILE: (.+?) ===\n([\s\S]*?)(?=\n=== FILE:|$)/g;
  let mm: RegExpExecArray | null;
  while ((mm = re.exec(text)) !== null) {
    const path = mm[1].trim();
    let body = mm[2];
    body = body.replace(/^```[a-z]*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
    out[path] = body + '\n';
  }
  return out;
}

export function writeFiles(files: Record<string, string>): void {
  for (const [rel, body] of Object.entries(files)) {
    const full = `${APP}/${rel}`;
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, body);
    console.log('WROTE', rel, `(${body.length} chars)`);
  }
}
