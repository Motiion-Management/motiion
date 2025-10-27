import { z } from 'zod'
import {
  heightDbField,
  ethnicityDbField,
  hairColorDbField,
  eyeColorDbField,
  genderDbField,
  ETHNICITY,
  HAIR_COLOR,
  EYE_COLOR,
  GENDER
} from './fields'

// Re-export for backward compatibility
export { ETHNICITY, HAIR_COLOR, EYE_COLOR, GENDER }
export const HAIRCOLOR = HAIR_COLOR
export const EYECOLOR = EYE_COLOR

export const attributesPlainObject = {
  ethnicity: ethnicityDbField,
  hairColor: hairColorDbField,
  eyeColor: eyeColorDbField,
  gender: genderDbField,
  height: heightDbField,
  yearsOfExperience: z.number().optional()
}
