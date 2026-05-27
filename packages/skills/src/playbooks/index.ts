import { bakery } from './bakery';
import { dental } from './dental';
import { fitness } from './fitness';
import { generic } from './generic';
import { homeservices } from './homeservices';
import { medical } from './medical';
import { professional } from './professional';
import { restaurant } from './restaurant';
import { retail } from './retail';
import { salon } from './salon';
import type { CategoryPlaybook } from '../types';

export const playbooks: CategoryPlaybook[] = [
  bakery,
  restaurant,
  dental,
  medical,
  salon,
  professional,
  fitness,
  homeservices,
  retail,
  generic,
];

export {
  bakery,
  restaurant,
  dental,
  medical,
  salon,
  professional,
  fitness,
  homeservices,
  retail,
  generic,
};
