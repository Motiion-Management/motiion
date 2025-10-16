import { z } from 'zod'

export const heightFormSchema = z.object({
  height: z.object({
    feet: z.number().min(3, 'Height must be at least 3 feet').max(8, 'Height must be at most 8 feet'),
    inches: z.number().min(0, 'Inches must be at least 0').max(11, 'Inches must be at most 11')
  })
})

export const heightDbField = z
  .object({
    feet: z.number(),
    inches: z.number()
  })
  .optional()

export type HeightFormValues = z.infer<typeof heightFormSchema>
