#!/usr/bin/env node
/**
 * Keep-alive watchdog for the local walkthrough during the autonomous build.
 * Runs the OFFLINE dev servers (no API spend) and restarts them if they die or
 * stop responding. Exits at the 4-hour deadline or when /tmp/ss-keepalive.stop
 * appears. Logs to /tmp/ss-keepalive.log.
 */
import { spawn } from "node:child_process";
import { existsSync, openSync, readFileSync, appendFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const LOG = "/tmp/ss-keepalive.log";
const STOP = "/tmp/ss-keepalive.stop";
const startEpoch = Number(readFileSync("/tmp/ss-autobuild-start", "utf8").trim() || Date.now() / 1000);
const DEADLINE = (startEpoch + 4 * 3600) * 1000;
const PORTAL = "http://localhost:3300/";

const log = (m) => appendFileSync(LOG, `[${new Date().toISOString()}] ${m}\n`);
let child = null;
let restarts = 0;
let unhealthy = 0;

function startServers() {
  const fd = openSync(LOG, "a");
  child = spawn("node", ["scripts/dev.mjs"], {
    cwd: root,
    env: { ...process.env, SIMPLESIGHT_OFFLINE: "1", DATABASE_URL: "" },
    stdio: ["ignore", fd, fd],
  });
  log(`servers started (pid ${child.pid}); restart #${restarts}`);
  child.on("exit", (code) => log(`servers exited (code ${code})`));
}

async function healthy() {
  try {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 8000);
    const res = await fetch(PORTAL, { signal: ac.signal });
    clearTimeout(t);
    return res.ok;
  } catch {
    return false;
  }
}

function stopServers() {
  if (child && child.exitCode === null) {
    try {
      child.kill("SIGINT");
    } catch {}
  }
}

log(`keepalive start — deadline ${new Date(DEADLINE).toISOString()}`);
startServers();

const tick = async () => {
  if (existsSync(STOP) || Date.now() >= DEADLINE) {
    log(existsSync(STOP) ? "stop file present — shutting down" : "deadline reached — shutting down");
    stopServers();
    setTimeout(() => process.exit(0), 1000);
    return;
  }
  const dead = !child || child.exitCode !== null;
  if (dead) {
    restarts++;
    log("child not running — restarting");
    startServers();
    unhealthy = 0;
  } else if (!(await healthy())) {
    unhealthy++;
    log(`unhealthy (${unhealthy}/3)`);
    if (unhealthy >= 3) {
      restarts++;
      log("3 strikes — killing + restarting servers");
      stopServers();
      setTimeout(startServers, 2000);
      unhealthy = 0;
    }
  } else {
    unhealthy = 0;
  }
  setTimeout(tick, 30000);
};
// give the first boot ~20s before health-checking
setTimeout(tick, 20000);
