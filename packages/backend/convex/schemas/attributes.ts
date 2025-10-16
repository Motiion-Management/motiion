import { z } from 'zod'
import { heightDbField, ethnicityDbField, hairColorDbField, ETHNICITY, HAIR_COLOR } from './fields'

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
export { ETHNICITY, HAIR_COLOR }
export const HAIRCOLOR = HAIR_COLOR

export const attributesPlainObject = {
  ethnicity: ethnicityDbField,
  hairColor: hairColorDbField,
  eyeColor: zEyeColor,
  gender: zGender,
  height: heightDbField,
  yearsOfExperience: z.number().optional()
}
