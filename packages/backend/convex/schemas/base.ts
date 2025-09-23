import { zid, zodToConvex } from 'zodvex'
import { z } from 'zod'

export const VISIBILITY = ['Public', 'Private'] as const
export const zVisibility = z.enum(VISIBILITY)

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

export const zFileUploadObject = z.object({
  storageId: zid('_storage'),
  title: z.string().optional(),
  uploadDate: z.string(),
  position: z.number().optional()
})

export const zFileUploadObjectArray = z.array(zFileUploadObject)

// Re-export GENDER for compatibility
export { GENDER } from './attributes'
