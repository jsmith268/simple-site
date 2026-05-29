#!/usr/bin/env node
/**
 * Inspect / disable Vercel deployment protection on a project, so the convergence
 * loop can screenshot + fetch the real site instead of the auth wall.
 *   node scripts/vercel-protect.mjs <project> [disable]
 * Token: VERCEL_API_TOKEN env, else the Vercel CLI auth.json. Never printed.
 */
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const API = "https://api.vercel.com";
const project = process.argv[2] || "bespoke-northlight";
const doDisable = process.argv[3] === "disable";
const teamSlug = process.env.VERCEL_TEAM_SLUG || "pranayr22-3147s-projects";

function token() {
  if (process.env.VERCEL_API_TOKEN) return process.env.VERCEL_API_TOKEN;
  const p = join(homedir(), "Library/Application Support/com.vercel.cli/auth.json");
  const t = JSON.parse(readFileSync(p, "utf8")).token;
  if (!t) throw new Error("no token in CLI auth.json");
  return t;
}
const TOK = token();
const H = { Authorization: `Bearer ${TOK}`, "Content-Type": "application/json" };
const j = async (r) => ({ status: r.status, body: await r.json().catch(() => ({})) });

async function resolveTeamId() {
  if (process.env.VERCEL_TEAM_ID) return process.env.VERCEL_TEAM_ID;
  const { body } = await j(await fetch(`${API}/v2/teams?limit=50`, { headers: H }));
  const team = (body.teams || []).find((t) => t.slug === teamSlug || t.name === teamSlug);
  return team?.id;
}

const teamId = await resolveTeamId();
const q = teamId ? `?teamId=${teamId}` : "";
console.log("token: loaded · team:", teamId ? `${teamSlug} (${teamId})` : "(personal/none)");

const got = await j(await fetch(`${API}/v9/projects/${encodeURIComponent(project)}${q}`, { headers: H }));
if (got.status !== 200) {
  console.log("GET project failed:", got.status, JSON.stringify(got.body).slice(0, 300));
  process.exit(1);
}
const p = got.body;
console.log("project:", p.name, p.id);
console.log("ssoProtection:", JSON.stringify(p.ssoProtection));
console.log("passwordProtection:", JSON.stringify(p.passwordProtection));
console.log("trustedIps:", JSON.stringify(p.trustedIps));

if (doDisable) {
  const patch = await j(
    await fetch(`${API}/v9/projects/${encodeURIComponent(project)}${q}`, {
      method: "PATCH",
      headers: H,
      body: JSON.stringify({ ssoProtection: null, passwordProtection: null }),
    }),
  );
  console.log("\nPATCH status:", patch.status);
  console.log("now ssoProtection:", JSON.stringify(patch.body.ssoProtection));
  console.log("now passwordProtection:", JSON.stringify(patch.body.passwordProtection));
}
