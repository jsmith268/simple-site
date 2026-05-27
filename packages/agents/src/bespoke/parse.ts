import type { GeneratedFile } from '@simplesight/contracts';

/** Parse an Opus response of `=== FILE: <path> ===\n<code>` blocks into files. */
export function parseDelimitedFiles(text: string): GeneratedFile[] {
  const out: GeneratedFile[] = [];
  const re = /=== FILE: (.+?) ===\n([\s\S]*?)(?=\n=== FILE:|$)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const path = (m[1] ?? '').trim();
    let body = (m[2] ?? '')
      .replace(/^```[a-z]*\n?/i, '')
      .replace(/\n?```\s*$/i, '')
      .trim();
    if (!path || !body) continue;
    body += '\n';
    out.push({
      path,
      contents: body,
      kind: path.endsWith('.css') ? 'css' : path.endsWith('.tsx') || path.endsWith('.ts') ? 'tsx' : path.match(/\.(json|mjs|config\.\w+)$/) ? 'config' : 'other',
      client: /^['"]use client['"]/.test(body),
    });
  }
  return out;
}

/** Parse a single-file response (one delimited block, or the whole text as fallback). */
export function parseSingleFile(text: string, expectedPath: string): GeneratedFile {
  const files = parseDelimitedFiles(text);
  const match = files.find((f) => f.path === expectedPath) ?? files[0];
  if (match) return match;
  // Fallback: treat the whole text as the file body.
  const body = text.replace(/^```[a-z]*\n?/i, '').replace(/\n?```\s*$/i, '').trim() + '\n';
  return {
    path: expectedPath,
    contents: body,
    kind: expectedPath.endsWith('.css') ? 'css' : 'tsx',
    client: /^['"]use client['"]/.test(body),
  };
}
