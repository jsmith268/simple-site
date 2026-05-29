#!/usr/bin/env node
/**
 * One-command local dev. `pnpm dev` starts all three apps on the 3300 range:
 *   • Portal   → http://localhost:3300   (the app you walk through)
 *   • Renderer → http://localhost:3301   (serves the preview iframes)
 *   • Marketing→ http://localhost:3302
 *
 * Defaults to offline (deterministic, no external services) and a shared local
 * data store so the portal's generated variants render in the renderer. Every
 * default is overridable via env (e.g. SIMPLESIGHT_OFFLINE=0 pnpm dev). Ctrl+C
 * stops everything. Anchor elsewhere with `pnpm dev -- 4300`.
 */
import { readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = process.env.SIMPLESIGHT_DATA_DIR ?? join(root, ".data");

// Load API keys from the root .env (handles the ANTROPIC_KEY typo) so live mode
// (SIMPLESIGHT_OFFLINE=0) works. Offline ignores them.
function loadKeys() {
  try {
    const env = readFileSync(join(root, ".env"), "utf8");
    const pick = (...names) => {
      for (const n of names) {
        const m = env.match(new RegExp(`^\\s*${n}\\s*=\\s*["']?([^"'\\n\\r]+)`, "m"));
        if (m) return m[1].trim();
      }
      return undefined;
    };
    const set = (key, ...names) => {
      const v = process.env[key] ?? pick(...names);
      if (v) process.env[key] = v;
    };
    set("ANTHROPIC_API_KEY", "ANTHROPIC_API_KEY", "ANTROPIC_KEY", "ANTHROPIC_KEY");
    set("UNSPLASH_ACCESS_KEY", "UNSPLASH_ACCESS_KEY", "UNSPLASH_KEY");
    set("PEXELS_API_KEY", "PEXELS_API_KEY", "PEXELS_KEY");
  } catch {
    /* no .env — offline only */
  }
}
loadKeys();
const live = process.env.SIMPLESIGHT_OFFLINE === "0";

// Base port: arg → env → 3300. Apps fan out from there (3300/3301/3302).
const basePort = Number(process.argv[2] || process.env.DEV_BASE_PORT || 3300);
const PORTAL = basePort; // 3300
const RENDERER = basePort + 1; // 3301
const MARKETING = basePort + 2; // 3302

const baseEnv = {
  ...process.env,
  SIMPLESIGHT_OFFLINE: process.env.SIMPLESIGHT_OFFLINE ?? "1",
  DATABASE_URL: process.env.DATABASE_URL ?? "",
  SIMPLESIGHT_DATA_DIR: dataDir,
  NEXT_TELEMETRY_DISABLED: "1",
};

const apps = [
  { name: "renderer", dir: "apps/renderer", port: RENDERER, color: "\x1b[36m" },
  {
    name: "portal",
    dir: "apps/portal",
    port: PORTAL,
    color: "\x1b[35m",
    env: { NEXT_PUBLIC_RENDERER_URL: `http://localhost:${RENDERER}` },
  },
  { name: "marketing", dir: "apps/marketing", port: MARKETING, color: "\x1b[33m" },
];

const procs = [];
for (const app of apps) {
  const cwd = join(root, app.dir);
  const bin = join(cwd, "node_modules/.bin/next");
  const child = spawn(bin, ["dev", "-p", String(app.port)], {
    cwd,
    env: { ...baseEnv, ...(app.env ?? {}) },
    stdio: ["ignore", "pipe", "pipe"],
  });
  const tag = `${app.color}[${app.name}]\x1b[0m `;
  const prefix = (buf) => {
    const text = buf.toString();
    process.stdout.write(text.replace(/^/gm, (m, off) => (off === 0 || text[off - 1] === "\n" ? tag : m)));
  };
  child.stdout.on("data", prefix);
  child.stderr.on("data", prefix);
  // A single app crashing shouldn't take down the others (mirrors turbo dev).
  child.on("exit", (code) => console.log(`${tag}exited (code ${code}).`));
  procs.push(child);
}

let stopping = false;
function shutdown() {
  if (stopping) return;
  stopping = true;
  for (const p of procs) {
    try {
      p.kill("SIGINT");
    } catch {}
  }
  setTimeout(() => process.exit(0), 500);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

const mode = live ? (process.env.ANTHROPIC_API_KEY ? "\x1b[32mLIVE · Opus 4.8\x1b[0m" : "\x1b[31mLIVE but no ANTHROPIC key found\x1b[0m") : "offline";
console.log(
  `\n  \x1b[1mSimpleSight\x1b[0m — local dev (${mode})\n` +
    `  ▸ Portal:    \x1b[4mhttp://localhost:${PORTAL}\x1b[0m   ← start here\n` +
    `  ▸ Renderer:  http://localhost:${RENDERER}   (previews)\n` +
    `  ▸ Marketing: http://localhost:${MARKETING}\n` +
    `  Ctrl+C to stop. ${live ? "Avery + builds use live Opus 4.8 (costs apply)." : "Run `pnpm dev:live` for live Opus 4.8."}\n`,
);
