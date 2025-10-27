import { z } from 'zod'

/**
 * Location object schema
 * Used for primary location, work locations, etc.
 */
export const locationObject = z.object({
  name: z.string().optional(),
  country: z.string(),
  state: z.string(),
  city: z.string(),
  zipCode: z.string().optional(),
  address: z.string().optional()
})

/**
 * Form schema for location
 * Validates location information
 */
export const locationFormSchema = z.object({
  location: locationObject
})

/**
 * Database field for location
 * Optional location object
 */
export const locationDbField = locationObject.optional()

export type LocationFormValues = z.infer<typeof locationFormSchema>
