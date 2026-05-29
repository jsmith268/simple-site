#!/usr/bin/env node
/**
 * One-command local dev for the SimpleSight walkthrough.
 *   pnpm dev:3000
 * Starts the portal on :3000 and the renderer on :3001, fully offline
 * (deterministic, no external services), sharing one data dir so the portal's
 * generated variants render in the renderer's preview iframes. Ctrl+C stops both.
 */
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = join(root, ".data");

// Allow `pnpm dev:3000 -- 4000` (or PORT=4000) to anchor at a different base port.
const basePort = Number(process.argv[2] || process.env.PORT || 3000);
const PORTAL_PORT = basePort;
const RENDERER_PORT = basePort + 1;

const baseEnv = {
  ...process.env,
  SIMPLESIGHT_OFFLINE: "1", // deterministic offline (no Anthropic / no credits needed)
  DATABASE_URL: "", // force the local file store, not the (un-migrated) Neon DB
  SIMPLESIGHT_DATA_DIR: dataDir, // shared between both apps
  NEXT_TELEMETRY_DISABLED: "1",
};

const apps = [
  { name: "renderer", cwd: join(root, "apps/renderer"), port: RENDERER_PORT, color: "\x1b[36m" },
  {
    name: "portal",
    cwd: join(root, "apps/portal"),
    port: PORTAL_PORT,
    color: "\x1b[35m",
    env: { NEXT_PUBLIC_RENDERER_URL: `http://localhost:${RENDERER_PORT}` },
  },
];

const procs = [];
for (const app of apps) {
  const bin = join(app.cwd, "node_modules/.bin/next");
  const child = spawn(bin, ["dev", "-p", String(app.port)], {
    cwd: app.cwd,
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
  child.on("exit", (code) => console.log(`${tag}exited (${code}). Stopping the other server…`) || shutdown());
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

console.log(
  `\n  \x1b[1mSimpleSight\x1b[0m — local walkthrough (offline)\n` +
    `  ▸ Portal:   \x1b[4mhttp://localhost:${PORTAL_PORT}\x1b[0m   ← start here\n` +
    `  ▸ Renderer: http://localhost:${RENDERER_PORT}   (serves previews)\n` +
    `  Two design "studios" are simulated offline. Ctrl+C to stop.\n`,
);
