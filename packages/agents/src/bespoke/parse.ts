import type { GeneratedFile } from '@simplesight/contracts';

/**
 * Convert LITERAL unicode escapes the model sometimes emits in JSX text
 * (e.g. `—`, `’`, `é`) into the real characters — they otherwise
 * render verbatim on the page ("here’s"). A recurring Opus failure mode the
 * prompts warn against; this is the deterministic backstop so it can NEVER ship.
 *
 * Only non-ASCII codepoints (>= 0xA0) are converted — the dashes, smart quotes,
 * and accents that cause the visible bug. ASCII-range escapes (', ",
 * \, …) are left untouched because converting them inside a quoted string
 * would break syntax. A doubled backslash (\\u…) is left alone.
 */
export function deLiteralizeUnicode(code: string): string {
  const dec = (hex: string): string | null => {
    const cp = Number.parseInt(hex, 16);
    return Number.isFinite(cp) && cp >= 0xa0 ? String.fromCodePoint(cp) : null;
  };
  return code
    .replace(/(?<!\\)\\u\{([0-9a-fA-F]{1,6})\}/g, (m, h) => dec(h) ?? m)
    .replace(/(?<!\\)\\u([0-9a-fA-F]{4})/g, (m, h) => dec(h) ?? m)
    .replace(/(?<!\\)\\x([0-9a-fA-F]{2})/g, (m, h) => dec(h) ?? m);
}

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
    body = deLiteralizeUnicode(body) + '\n';
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
  const body = deLiteralizeUnicode(text.replace(/^```[a-z]*\n?/i, '').replace(/\n?```\s*$/i, '').trim()) + '\n';
  return {
    path: expectedPath,
    contents: body,
    kind: expectedPath.endsWith('.css') ? 'css' : 'tsx',
    client: /^['"]use client['"]/.test(body),
  };
}
