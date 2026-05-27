"use server";

import { deleteSkillOverride, getSkillOverrides, setSkillOverride } from "@simplesight/db";
import { skills as baseSkills } from "@simplesight/skills";

export interface SkillView {
  name: string;
  kind: string;
  summary: string;
  appliesTo: string[];
  body: string;
  defaultBody: string;
  overridden: boolean;
}

/** All skills with operator overrides applied (for the admin editor). */
export async function loadSkills(): Promise<SkillView[]> {
  const overrides = await getSkillOverrides();
  return baseSkills.map((s) => ({
    name: s.name,
    kind: s.kind,
    summary: s.summary,
    appliesTo: s.appliesTo,
    body: overrides[s.name] ?? s.body,
    defaultBody: s.body,
    overridden: s.name in overrides,
  }));
}

export async function saveSkillAction(name: string, body: string) {
  await setSkillOverride(name, body, "operator");
  return { ok: true };
}

/** Revert a skill to its built-in body. */
export async function resetSkillAction(name: string) {
  await deleteSkillOverride(name);
  return { ok: true };
}
