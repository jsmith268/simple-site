import { hasDatabase } from '@simplesight/env';
import { eq } from 'drizzle-orm';
import { db } from '../client';
import { skillOverrides } from '../schema/orchestration';
import * as store from '../offline-store';

const offline = () => !hasDatabase();

/** All operator skill overrides as a name → body map (applied at runtime). */
export async function getSkillOverrides(): Promise<Record<string, string>> {
  if (offline()) {
    const out: Record<string, string> = {};
    for (const r of store.readColl('skill_overrides')) out[r.name as string] = r.body as string;
    return out;
  }
  const rows = await db.select().from(skillOverrides);
  return Object.fromEntries(rows.map((r) => [r.name, r.body]));
}

export async function setSkillOverride(name: string, body: string, updatedBy?: string): Promise<void> {
  if (offline()) {
    store.upsert('skill_overrides', (r) => r.name === name, { name, body, updatedBy, updatedAt: new Date().toISOString() });
    return;
  }
  await db
    .insert(skillOverrides)
    .values({ name, body, updatedBy })
    .onConflictDoUpdate({ target: skillOverrides.name, set: { body, updatedBy, updatedAt: new Date() } });
}

export async function deleteSkillOverride(name: string): Promise<void> {
  if (offline()) {
    store.writeColl('skill_overrides', store.readColl('skill_overrides').filter((r) => r.name !== name));
    return;
  }
  await db.delete(skillOverrides).where(eq(skillOverrides.name, name));
}
