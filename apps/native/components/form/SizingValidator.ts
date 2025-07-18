import { z } from 'zod'

// Simplified validator for the form - all fields are optional
export const sizingValidator = z.object({
  general: z.object({
    waist: z.string().optional(),
    inseam: z.string().optional(),
    glove: z.string().optional(),
    hat: z.string().optional(),
  }).optional(),
  male: z.object({
    chest: z.string().optional(),
    neck: z.string().optional(),
    sleeve: z.string().optional(),
    shirt: z.string().optional(),
    shoes: z.string().optional(),
    coatLength: z.string().optional(),
  }).optional(),
  female: z.object({
    hips: z.string().optional(),
    bust: z.string().optional(),
    underbust: z.string().optional(),
    cup: z.string().optional(),
    shirt: z.string().optional(),
    dress: z.string().optional(),
    pants: z.string().optional(),
    shoes: z.string().optional(),
    coatLength: z.string().optional(),
  }).optional(),
})

export type SizingFormData = z.infer<typeof sizingValidator>