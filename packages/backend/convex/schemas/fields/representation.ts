import { z } from 'zod'
import { zid } from 'zodvex'

/**
 * Representation object schema
 * Used for agency/management representation information
 */
export const representationObject = z.object({
  agencyId: zid('agencies').optional(),
  displayRep: z.boolean().optional(),
  tipDismissed: z.boolean().optional()
})

/**
 * Form schema for representation
 * Validates representation/agency information
 */
export const representationFormSchema = z.object({
  representation: representationObject.optional()
})

/**
 * Database field for representation
 * Optional representation object
 */
export const representationDbField = representationObject.optional()

export type RepresentationFormValues = z.infer<typeof representationFormSchema>
