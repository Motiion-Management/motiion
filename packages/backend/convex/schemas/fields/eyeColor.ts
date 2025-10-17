import { z } from 'zod'

export const EYE_COLOR = [
  'Amber',
  'Blue',
  'Brown',
  'Green',
  'Gray',
  'Mixed'
] as const

export const eyeColorFormSchema = z.object({
  eyeColor: z.enum(EYE_COLOR, {
    errorMap: () => ({ message: 'Please select an eye color' })
  })
})

export const eyeColorDbField = z.enum(EYE_COLOR).optional()

export type EyeColorFormValues = z.infer<typeof eyeColorFormSchema>
