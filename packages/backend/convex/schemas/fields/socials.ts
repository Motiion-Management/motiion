import { z } from 'zod'

/**
 * Socials object schema
 * Used for social media links (shared between dancers and choreographers)
 */
export const socialsObject = z.object({
  instagram: z.string().optional(),
  twitter: z.string().optional(),
  tiktok: z.string().optional(),
  youtube: z.string().optional(),
  whatsapp: z.string().optional(),
  facebook: z.string().optional(),
  linkedin: z.string().optional()
})

/**
 * Form schema for socials
 * Validates social media links
 */
export const socialsFormSchema = z.object({
  socials: socialsObject.optional()
})

/**
 * Database field for socials
 * Optional socials object
 */
export const socialsDbField = socialsObject.optional()

export type SocialsFormValues = z.infer<typeof socialsFormSchema>
