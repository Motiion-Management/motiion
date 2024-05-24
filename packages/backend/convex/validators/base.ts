import { zid, zodToConvexFields } from 'convex-helpers/server/zod'
import { Table } from 'convex-helpers/server'
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

export const PROFICIENCY = ['Novice', 'Proficient', 'Expert'] as const
export const zProficiency = z.enum(PROFICIENCY)
