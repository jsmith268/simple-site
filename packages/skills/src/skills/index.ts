import { designStandards } from './designStandards';
import { imageryDirection } from './imageryDirection';
import { informationArchitecture } from './informationArchitecture';
import { marketingVoice } from './marketingVoice';
import { premiumDesign } from './premiumDesign';
import { reviewRubric } from './reviewRubric';
import type { Skill } from '../types';

export const skills: Skill[] = [
  designStandards,
  premiumDesign,
  marketingVoice,
  imageryDirection,
  informationArchitecture,
  reviewRubric,
];

export {
  designStandards,
  premiumDesign,
  marketingVoice,
  imageryDirection,
  informationArchitecture,
  reviewRubric,
};
