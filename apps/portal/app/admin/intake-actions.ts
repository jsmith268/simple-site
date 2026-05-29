"use server";

import { getIntake, getSkillOverrides, listProjects, setSkillOverride } from "@simplesight/db";

/** Operator view: the tunable Avery guidance + every project's gathered intake. */
export async function loadIntakeConsole() {
  const [overrides, projects] = await Promise.all([getSkillOverrides().catch(() => ({})), listProjects()]);
  const rows = await Promise.all(
    projects.slice(0, 50).map(async (p) => {
      const intake = await getIntake(p.id).catch(() => undefined);
      const b = intake?.business;
      return {
        id: p.id,
        status: p.status,
        username: p.username ?? null,
        name: b?.name ?? null,
        category: b?.category ?? null,
        email: b?.contact?.email ?? p.email ?? null,
        voice: intake?.style?.vibe ?? [],
        hasIntake: !!b,
      };
    }),
  );
  return { guidance: (overrides as Record<string, string>)["intake"] ?? "", projects: rows };
}

/** Tune Avery's intake system prompt (operator override, applied on every new conversation). */
export async function saveIntakeGuidanceAction(text: string) {
  await setSkillOverride("intake", text, "operator");
  return { ok: true as const };
}
