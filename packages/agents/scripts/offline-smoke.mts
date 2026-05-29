/** Offline smoke: seed a throwaway project + intake, run one dual round, print
 * the two variant preview URLs so we can confirm the renderer paints them. */
process.env.SIMPLESIGHT_OFFLINE = "1";
process.env.DATABASE_URL = "";
process.env.SIMPLESIGHT_DATA_DIR = "/Users/pranayramash/Projects/simple-site/.data";
process.env.NEXT_PUBLIC_RENDERER_URL = "http://localhost:4011";

const db = await import("@simplesight/db");
const { runRound } = await import("@simplesight/agents");

const { projectId } = await db.createPurchasedProject({ email: "smoke@test.demo", amountCents: 0 });
await db.saveIntake(projectId, {
  business: {
    name: "Smoke Test Studio",
    category: "design studio",
    description: "A throwaway smoke-test business.",
    services: [{ name: "Branding" }, { name: "Web" }],
    locations: [{ city: "Portland", region: "OR" }],
    hours: [],
    contact: { email: "smoke@test.demo", socials: [] },
  },
  style: { vibe: ["bold", "modern"], referenceUrls: [] },
});
await db.reserveUsername(projectId, `smoke-${Date.now().toString(36)}`);
await db.completeIntake(projectId);

const res = await runRound(projectId);
console.log("projectId:", projectId);
for (const v of res.variants) console.log(`  ${v.studioLabel} [${v.slot}] status=${v.status} preview=${v.previewUrl}`);
process.exit(0);
