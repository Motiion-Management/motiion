import { z } from 'zod'

export const ETHNICITY = [
  'American Indian / Alaska Native',
  'Asian',
  'Black / African American',
  'Hispanic / Latino',
  'Native Hawaiian / Pacific Islander',
  'White / Caucasian'
] as const

export const ethnicityFormSchema = z.object({
  ethnicity: z
    .array(z.enum(ETHNICITY))
    .min(1, 'Please select at least one ethnicity')
})

export const ethnicityDbField = z.array(z.enum(ETHNICITY)).optional()

export type EthnicityFormValues = z.infer<typeof ethnicityFormSchema>
