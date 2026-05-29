#!/usr/bin/env node
/** Scan the live Northlight pages for unicode-escape text artifacts (/u#### or \u####). */
const BASE = "https://bespoke-northlight.vercel.app";
const PATHS = ["", "/services", "/team", "/new-patients", "/contact"];
// literal backslash-u, forward-slash-u, or bare u followed by 2-4 hex
const RE = /(\\u|\/u|\bu)[0-9a-fA-F]{2,4}\b/g;

function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&");
}

for (const p of PATHS) {
  const url = BASE + p;
  try {
    const res = await fetch(url, { headers: { "user-agent": "scan/1.0" } });
    const text = visibleText(await res.text());
    const matches = [...text.matchAll(RE)].map((m) => m[0]);
    const uniq = [...new Set(matches)];
    const label = p || "/";
    if (uniq.length) {
      // grab one context snippet
      const i = text.search(RE);
      const ctx = text.slice(Math.max(0, i - 45), i + 45).replace(/\s+/g, " ").trim();
      console.log(`${label}  → ${matches.length} hit(s): ${uniq.slice(0, 8).join(", ")}`);
      console.log(`         …${ctx}…`);
    } else {
      console.log(`${label}  → none`);
    }
  } catch (e) {
    console.log(`${p || "/"}  → fetch error: ${String(e)}`);
  }
}
