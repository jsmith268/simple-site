import { designStandards } from './designStandards';
import { imageryDirection } from './imageryDirection';
import { informationArchitecture } from './informationArchitecture';
import { marketingVoice } from './marketingVoice';
import { reviewRubric } from './reviewRubric';
import type { Skill } from '../types';

export const skills: Skill[] = [
  designStandards,
  marketingVoice,
  imageryDirection,
  informationArchitecture,
  reviewRubric,
];

export { designStandards, marketingVoice, imageryDirection, informationArchitecture, reviewRubric };
