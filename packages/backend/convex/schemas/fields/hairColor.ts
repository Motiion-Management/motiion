import { z } from 'zod'

export const HAIR_COLOR = ['Black', 'Blonde', 'Brown', 'Red', 'Other'] as const

export const hairColorFormSchema = z.object({
  hairColor: z.enum(HAIR_COLOR, {
    message: 'Please select a hair color'
  }).optional()
})

export const hairColorDbField = z.enum(HAIR_COLOR).optional()

export type HairColorFormValues = z.infer<typeof hairColorFormSchema>
