import { z } from 'zod'

/**
 * Form schema for SAG-AFTRA ID
 * Validates union membership ID
 */
export const sagAftraIdFormSchema = z.object({
  sagAftraId: z.string().min(1, 'Please enter your SAG-AFTRA ID')
})

/**
 * Database field for SAG-AFTRA ID
 * Optional string for union membership ID
 */
export const sagAftraIdDbField = z.string().optional()

export type SagAftraIdFormValues = z.infer<typeof sagAftraIdFormSchema>
