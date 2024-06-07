import { zodToConvex } from 'convex-helpers/server/zod'
import { z } from 'zod'

export const VISIBILITY = ['Public', 'Private'] as const
export const zVisibility = z.enum(VISIBILITY)

export const GENDER = ['Male', 'Female', 'Non-Binary'] as const
export const zGender = z.enum(GENDER)

export const zLocation = z.object({
  name: z.string().optional(),
  country: z.string(),
  state: z.string(),
  city: z.string(),
  zipCode: z.string().optional(),
  address: z.string().optional()
})
export const location = zodToConvex(zLocation)

export const PROFICIENCY = ['novice', 'proficient', 'expert'] as const
export const zProficiency = z.enum(PROFICIENCY)
