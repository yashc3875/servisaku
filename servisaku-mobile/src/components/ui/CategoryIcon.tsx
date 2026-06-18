import React from 'react';
import {
  Sparkles,
  SprayCan,
  Wind,
  Wrench,
  Zap,
  Hammer,
  Bug,
  Flower2,
  Truck,
  WashingMachine,
  PaintRoller,
  Car,
  Grid3x3,
  type LucideProps,
} from 'lucide-react-native';
import type { IconName } from '@/types';

/** Maps a catalog `IconName` to its Lucide component. */
const ICONS: Record<IconName, React.ComponentType<LucideProps>> = {
  sparkles: Sparkles,
  'spray-can': SprayCan,
  wind: Wind,
  wrench: Wrench,
  zap: Zap,
  hammer: Hammer,
  bug: Bug,
  'flower-2': Flower2,
  truck: Truck,
  'washing-machine': WashingMachine,
  'paint-roller': PaintRoller,
  car: Car,
  'grid-3x3': Grid3x3,
};

export interface CategoryIconProps extends LucideProps {
  name: IconName;
}

export function CategoryIcon({ name, ...props }: CategoryIconProps) {
  const Cmp = ICONS[name] ?? Grid3x3;
  return <Cmp {...props} />;
}
