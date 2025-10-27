import { z } from 'zod'
import { zid } from 'zodvex'

/**
 * File upload object schema
 * Used for headshots and other uploaded files
 */
export const fileUploadObject = z.object({
  storageId: zid('_storage'),
  title: z.string().optional(),
  uploadDate: z.string(),
  position: z.number().optional()
})

/**
 * Form schema for headshots
 * Validates array of uploaded headshot files
 */
export const headshotsFormSchema = z.object({
  headshots: z.array(fileUploadObject).optional()
})

/**
 * Database field for headshots
 * Optional array of file upload objects
 */
export const headshotsDbField = z.array(fileUploadObject).optional()

export type HeadshotsFormValues = z.infer<typeof headshotsFormSchema>
