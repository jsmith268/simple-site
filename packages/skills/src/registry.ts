import type { CategoryPlaybook, Skill } from './types';
import { playbooks } from './playbooks/index';
import { skills } from './skills/index';

/** Resolve the best-matching playbook for a business category (falls back to generic). */
export function pickPlaybook(category: string | undefined): CategoryPlaybook {
  const c = (category ?? '').toLowerCase();
  const found = playbooks.find((p) => p.match.some((m) => c.includes(m)));
  return found ?? playbooks.find((p) => p.key === 'generic') ?? (playbooks[0] as CategoryPlaybook);
}

export function allPlaybooks(): CategoryPlaybook[] {
  return playbooks;
}

/** Skills attached to a given agent (plus universal '*' skills). */
export function skillsForAgent(agentName: string): Skill[] {
  return skills.filter((s) => s.appliesTo.includes('*') || s.appliesTo.includes(agentName));
}

/** Canonicalize a skill name so 'design-standards', 'designStandards', and
 *  'Design Standards' all resolve to the same skill (the source of a silent
 *  prompt-injection bug where requested skills returned undefined). */
function canon(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function getSkill(name: string): Skill | undefined {
  const want = canon(name);
  return skills.find((s) => canon(s.name) === want);
}

/** Resolve several skills at once, dropping (and reporting) any that are missing. */
export function getSkills(names: string[]): { found: Skill[]; missing: string[] } {
  const found: Skill[] = [];
  const missing: string[] = [];
  for (const n of names) {
    const s = getSkill(n);
    if (s) found.push(s);
    else missing.push(n);
  }
  return { found, missing };
}

export { playbooks, skills };
