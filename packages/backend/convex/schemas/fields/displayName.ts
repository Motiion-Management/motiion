import { z } from 'zod'

/**
 * Shared displayName field schema
 * Used by both dancers and choreographers
 */

// Core validation logic - single source of truth
export const displayNameField = z
  .string()
  .min(2, 'Preferred name must be at least 2 characters')
  .max(50, 'Preferred name must be less than 50 characters')

// For forms (required with non-empty validation)
export const displayNameFormSchema = z.object({
  displayName: z
    .string()
    .min(1, { message: 'Preferred name is required' })
    .min(2, { message: 'Preferred name must be at least 2 characters' })
    .max(50, { message: 'Preferred name must be less than 50 characters' }),
})

// For database (optional)
export const displayNameDbField = displayNameField.optional()

// Type exports
export type DisplayNameFormValues = z.infer<typeof displayNameFormSchema>
