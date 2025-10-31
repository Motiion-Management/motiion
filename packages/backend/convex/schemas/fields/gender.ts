import { z } from 'zod'

export const GENDER = ['Male', 'Female', 'Non-binary'] as const

export const genderFormSchema = z.object({
  gender: z
    .enum(GENDER, {
      message: 'Please select a gender'
    })
    .optional()
})

export const genderDbField = z.enum(GENDER).optional()

export type GenderFormValues = z.infer<typeof genderFormSchema>
