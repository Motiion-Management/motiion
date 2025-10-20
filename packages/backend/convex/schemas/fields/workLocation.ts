import { z } from 'zod'

/**
 * Work location preferences
 * Array of location strings where the dancer is willing to work
 */
export const workLocationArray = z.array(z.string())

/**
 * Form schema for work location
 * Validates work location preferences
 */
export const workLocationFormSchema = z.object({
  workLocation: workLocationArray.min(1, 'Please select at least one work location')
})

/**
 * Database field for work location
 * Optional array of location strings
 */
export const workLocationDbField = workLocationArray.optional()

export type WorkLocationFormValues = z.infer<typeof workLocationFormSchema>
