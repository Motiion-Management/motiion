import { z } from 'zod'
import { heightDbField, ethnicityDbField, ETHNICITY } from './fields'

export const HAIRCOLOR = ['Black', 'Blonde', 'Brown', 'Red', 'Other'] as const
export const zHairColor = z.enum(HAIRCOLOR).optional()

export const EYECOLOR = [
  'Amber',
  'Blue',
  'Brown',
  'Green',
  'Gray',
  'Mixed'
] as const
export const zEyeColor = z.enum(EYECOLOR).optional()

export const GENDER = ['Male', 'Female', 'Non-binary'] as const
export const zGender = z.enum(GENDER).optional()

// Re-export for backward compatibility
export { ETHNICITY }

export const attributesPlainObject = {
  ethnicity: ethnicityDbField,
  hairColor: zHairColor,
  eyeColor: zEyeColor,
  gender: zGender,
  height: heightDbField,
  yearsOfExperience: z.number().optional()
}
