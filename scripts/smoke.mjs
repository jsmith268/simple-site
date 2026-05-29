#!/usr/bin/env node
/**
 * Offline smoke test — exercises the renderer + portal surface added in the
 * autonomous build (SEO, OG/favicon, robots/sitemap, JSON-LD, 404, security
 * headers, analytics beacon, admin reach) against the locally running dev
 * servers. No product API calls. Run with the dev servers up:
 *
 *   pnpm dev   # (in another terminal — portal:3300, renderer:3301)
 *   node scripts/smoke.mjs [tenantUsername]
 *
 * Exits non-zero if any check fails.
 */

const RENDERER = process.env.SMOKE_RENDERER ?? "http://localhost:3301";
const PORTAL = process.env.SMOKE_PORTAL ?? "http://localhost:3300";
const TENANT = process.argv[2] ?? "reeds";

let pass = 0;
let fail = 0;
const failures = [];

function ok(name) {
  pass++;
  console.log(`  \x1b[32m✓\x1b[0m ${name}`);
}
function bad(name, detail) {
  fail++;
  failures.push(`${name} — ${detail}`);
  console.log(`  \x1b[31m✗\x1b[0m ${name} \x1b[2m(${detail})\x1b[0m`);
}
function check(name, cond, detail = "") {
  if (cond) ok(name);
  else bad(name, detail || "assertion failed");
}

async function get(url, opts) {
  const res = await fetch(url, { redirect: "manual", ...opts });
  const body = await res.text();
  return { res, body, status: res.status, ct: res.headers.get("content-type") ?? "" };
}

async function getBytes(url) {
  const res = await fetch(url);
  const buf = Buffer.from(await res.arrayBuffer());
  return { res, buf, status: res.status, ct: res.headers.get("content-type") ?? "" };
}

const isPng = (buf) => buf.length > 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;

async function main() {
  console.log(`\nSmoke test · tenant="${TENANT}" · renderer=${RENDERER} · portal=${PORTAL}\n`);

  // 1. Tenant page + metadata + JSON-LD
  console.log("Tenant page & SEO");
  try {
    const { status, body } = await get(`${RENDERER}/site/${TENANT}`);
    check("tenant page 200", status === 200, `status ${status}`);
    check("has <title>", /<title>[^<]+<\/title>/.test(body), "no title");
    check("canonical link", body.includes('rel="canonical"'), "no canonical");
    check("og:image present", body.includes("og:image"), "no og:image");
    check("twitter:card present", body.includes("twitter:card"), "no twitter:card");
    check("favicon link", /rel="icon"/.test(body), "no icon link");
    check("WebSite JSON-LD", body.includes('"@type":"WebSite"'), "no WebSite");
    check(
      "LocalBusiness/Organization JSON-LD",
      body.includes('"@type":"LocalBusiness"') || body.includes('"@type":"Organization"'),
      "no org",
    );
    check("HitBeacon wired", body.includes("HitBeacon") || body.includes("/api/hit"), "no beacon");
  } catch (e) {
    bad("tenant page fetch", String(e));
  }

  // 2. Generated images
  console.log("Brand images");
  for (const [name, path] of [
    ["favicon (icon)", `/site/${TENANT}/icon`],
    ["opengraph-image", `/site/${TENANT}/opengraph-image`],
    ["twitter-image", `/site/${TENANT}/twitter-image`],
  ]) {
    try {
      const { status, ct, buf } = await getBytes(`${RENDERER}${path}`);
      check(`${name} 200 + PNG`, status === 200 && ct.includes("image/png") && isPng(buf), `status ${status} ct ${ct}`);
    } catch (e) {
      bad(name, String(e));
    }
  }

  // 3. robots + sitemap
  console.log("Crawl files");
  try {
    const robots = await get(`${RENDERER}/site/${TENANT}/robots.txt`);
    check("robots.txt 200 + text", robots.status === 200 && robots.ct.includes("text/plain"), `status ${robots.status}`);
    check("robots references sitemap", /Sitemap:/i.test(robots.body), "no Sitemap line");
    const sm = await get(`${RENDERER}/site/${TENANT}/sitemap.xml`);
    check("sitemap.xml 200 + xml", sm.status === 200 && sm.ct.includes("xml"), `status ${sm.status}`);
    check("sitemap has <urlset>", sm.body.includes("<urlset"), "no urlset");
    check("sitemap has <loc>", sm.body.includes("<loc>"), "no loc");
  } catch (e) {
    bad("crawl files", String(e));
  }

  // 4. 404 for unknown slug
  console.log("Not-found");
  try {
    const { status, body } = await get(`${RENDERER}/site/${TENANT}/__definitely-not-a-real-page__`);
    check("unknown slug 404", status === 404, `status ${status}`);
    check("branded 404 body", /Not found|couldn/i.test(body), "not branded");
  } catch (e) {
    bad("404", String(e));
  }

  // 5. Security headers
  console.log("Security headers");
  try {
    const { res } = await get(`${RENDERER}/site/${TENANT}`);
    check("X-Content-Type-Options", res.headers.get("x-content-type-options") === "nosniff", "missing/wrong");
    check("Referrer-Policy", !!res.headers.get("referrer-policy"), "missing");
    check("Strict-Transport-Security", !!res.headers.get("strict-transport-security"), "missing");
    check("Permissions-Policy", !!res.headers.get("permissions-policy"), "missing");
  } catch (e) {
    bad("headers", String(e));
  }

  // 6. Analytics beacon
  console.log("Analytics beacon");
  try {
    const res = await fetch(`${RENDERER}/api/hit`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ u: TENANT, p: "/smoke-check" }),
    });
    check("/api/hit 204", res.status === 204, `status ${res.status}`);
  } catch (e) {
    bad("/api/hit", String(e));
  }

  // 7. Portal admin reach (best-effort — portal may require auth in some setups)
  console.log("Admin fleet analytics");
  try {
    const { status, body } = await get(`${PORTAL}/admin`);
    if (status === 200) {
      check("admin Reach section", body.includes("Reach") && body.includes("Site views"), "no reach section");
    } else {
      console.log(`  \x1b[2m· admin returned ${status} (auth/redirect) — skipped\x1b[0m`);
    }
  } catch (e) {
    console.log(`  \x1b[2m· admin unreachable (${e}) — skipped\x1b[0m`);
  }

  console.log(`\n${fail === 0 ? "\x1b[32m" : "\x1b[31m"}${pass} passed, ${fail} failed\x1b[0m`);
  if (fail) {
    console.log("\nFailures:");
    for (const f of failures) console.log(`  - ${f}`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("smoke test crashed:", e);
  process.exit(1);
});
