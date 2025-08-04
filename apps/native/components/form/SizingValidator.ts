import { z } from 'zod';
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
} from '@packages/backend/convex/validators/sizing';

// Create enum validators from the imported arrays
const waistEnum = z.enum([...WAIST] as [string, ...string[]]).optional();
const inseamEnum = z.enum([...INSEAM] as [string, ...string[]]).optional();
const gloveEnum = z.enum([...GLOVE] as [string, ...string[]]).optional();
const hatEnum = z.enum([...HAT] as [string, ...string[]]).optional();
const chestEnum = z.enum([...CHEST] as [string, ...string[]]).optional();
const neckEnum = z.enum([...NECK] as [string, ...string[]]).optional();
const sleeveEnum = z.enum([...SLEEVE] as [string, ...string[]]).optional();
const shirtEnum = z.enum([...SHIRT] as [string, ...string[]]).optional();
const shoesMenEnum = z.enum([...SHOESMEN] as [string, ...string[]]).optional();
const shoesWomenEnum = z.enum([...SHOESWOMEN] as [string, ...string[]]).optional();
const coatLengthEnum = z.enum([...COATLENGTH] as [string, ...string[]]).optional();
const dressOrPantEnum = z.enum([...DRESSORPANT] as [string, ...string[]]).optional();
const cupEnum = z.enum([...CUP] as [string, ...string[]]).optional();
const bustEnum = z.enum([...BUST] as [string, ...string[]]).optional();
const underbustEnum = z.enum([...UNDERBUST] as [string, ...string[]]).optional();
const hipsEnum = z.enum([...HIPS] as [string, ...string[]]).optional();

// Simplified validator for the form - all fields are optional
export const sizingValidator = z.object({
  general: z
    .object({
      waist: waistEnum,
      inseam: inseamEnum,
      glove: gloveEnum,
      hat: hatEnum,
    })
    .optional(),
  male: z
    .object({
      chest: chestEnum,
      neck: neckEnum,
      sleeve: sleeveEnum,
      shirt: shirtEnum,
      shoes: shoesMenEnum,
      coatLength: coatLengthEnum,
    })
    .optional(),
  female: z
    .object({
      hips: hipsEnum,
      bust: bustEnum,
      underbust: underbustEnum,
      cup: cupEnum,
      shirt: shirtEnum,
      dress: dressOrPantEnum,
      pants: dressOrPantEnum,
      shoes: shoesWomenEnum,
      coatLength: coatLengthEnum,
    })
    .optional(),
});

export type SizingFormData = z.infer;
