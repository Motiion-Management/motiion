import {
  WAIST,
  INSEAM,
  GLOVE,
  HAT,
  CHEST,
  NECK,
  SLEEVE,
  COATLENGTH,
  SHIRT,
  SHOESMEN,
  SHOESWOMEN,
  DRESSORPANT,
  CUP,
  BUST,
  UNDERBUST,
  HIPS,
} from '@packages/backend/convex/schemas/sizing';

export type GeneralSizing = {
  waist?: (typeof WAIST)[number];
  inseam?: (typeof INSEAM)[number];
  glove?: (typeof GLOVE)[number];
  hat?: (typeof HAT)[number];
};

export type MaleSizing = {
  neck?: (typeof NECK)[number];
  chest?: (typeof CHEST)[number];
  sleeve?: (typeof SLEEVE)[number];
  coatLength?: (typeof COATLENGTH)[number];
  shirt?: (typeof SHIRT)[number];
  shoes?: (typeof SHOESMEN)[number];
};

export type FemaleSizing = {
  hips?: (typeof HIPS)[number];
  bust?: (typeof BUST)[number];
  underbust?: (typeof UNDERBUST)[number];
  cup?: (typeof CUP)[number];
  coatLength?: (typeof COATLENGTH)[number];
  shirt?: (typeof SHIRT)[number];
  dress?: (typeof DRESSORPANT)[number];
  pants?: (typeof DRESSORPANT)[number];
  shoes?: (typeof SHOESWOMEN)[number];
};

export type SizingData = {
  general?: GeneralSizing;
  male?: MaleSizing;
  female?: FemaleSizing;
};

export type SizingMetricType =
  | 'waist'
  | 'inseam'
  | 'glove'
  | 'hat'
  | 'neck'
  | 'chest'
  | 'sleeve'
  | 'coatLength'
  | 'shirt'
  | 'shoesMen'
  | 'hips'
  | 'bust'
  | 'underbust'
  | 'cup'
  | 'dress'
  | 'pants'
  | 'shoesWomen';

export type SizingSection = 'general' | 'male' | 'female';

export interface SizingMetricConfig {
  section: SizingSection;
  field: string;
  label: string;
  values: readonly string[];
  unit?: string;
  pickerType?: 'numeric' | 'size' | 'enum';
}
