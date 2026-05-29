#!/usr/bin/env node
/** Apply the deLiteralizeUnicode transform to an already-generated app's files.
 *   node scripts/fix-escapes.mjs <appDir>
 * Converts non-ASCII literal escapes (—, ’, é) to real chars in .tsx/.ts/.css. */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const dir = process.argv[2];
if (!dir) {
  console.error("usage: fix-escapes.mjs <appDir>");
  process.exit(1);
}

function deLiteralizeUnicode(code) {
  const dec = (hex) => {
    const cp = Number.parseInt(hex, 16);
    return Number.isFinite(cp) && cp >= 0xa0 ? String.fromCodePoint(cp) : null;
  };
  return code
    .replace(/(?<!\\)\\u\{([0-9a-fA-F]{1,6})\}/g, (m, h) => dec(h) ?? m)
    .replace(/(?<!\\)\\u([0-9a-fA-F]{4})/g, (m, h) => dec(h) ?? m)
    .replace(/(?<!\\)\\x([0-9a-fA-F]{2})/g, (m, h) => dec(h) ?? m);
}

function walk(d, files = []) {
  for (const e of readdirSync(d)) {
    if (e === "node_modules" || e === ".next" || e === ".vercel") continue;
    const p = join(d, e);
    if (statSync(p).isDirectory()) walk(p, files);
    else if (/\.(tsx?|css)$/.test(e)) files.push(p);
  }
  return files;
}

let changed = 0;
for (const f of walk(join(dir, "app"))) {
  const before = readFileSync(f, "utf8");
  const after = deLiteralizeUnicode(before);
  if (after !== before) {
    writeFileSync(f, after);
    changed++;
    console.log("fixed:", f.replace(dir + "/", ""));
  }
}
console.log(changed ? `\n${changed} file(s) cleaned.` : "\nNo literal escapes found.");
