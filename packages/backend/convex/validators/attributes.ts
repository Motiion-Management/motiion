import { z } from 'zod'

export const HAIRCOLOR = [
  'Black',
  'Blonde',
  'Brown',
  'Red',
  'Other'
] as const
export const zHairColor = z.enum(HAIRCOLOR).optional()

export const EYECOLOR = [
  'Amber',
  'Blue',
  'Brown',
  'Green',
  'Gray',
  'Hazel',
  'Mixed'
] as const
export const zEyeColor = z.enum(EYECOLOR).optional()

export const ETHNICITY = [
  'American Indian / Alaska Native',
  'Asian',
  'Black / African American',
  'Hispanic / Latino',
  'Native Hawaiian / Pacific Islander',
  'White / Caucasian'
] as const
export const zEthnicity = z.enum(ETHNICITY).array().optional()

export const zHeight = z.object({
  feet: z.number(),
  inches: z.number()
})
export const attributesPlainObject = {
  ethnicity: zEthnicity,
  hairColor: zHairColor,
  eyeColor: zEyeColor,
  height: zHeight.optional(),
  yearsOfExperience: z.number().optional()
}
