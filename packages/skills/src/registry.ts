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

export function getSkill(name: string): Skill | undefined {
  return skills.find((s) => s.name === name);
}

export { playbooks, skills };
