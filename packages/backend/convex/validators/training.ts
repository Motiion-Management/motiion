import { zid, zodToConvexFields } from 'convex-helpers/server/zod'
import { Table } from 'convex-helpers/server'
import { z } from 'zod'
import { Doc } from '../_generated/dataModel'

export const TRAINING_TYPES = ['education', 'dance-school', 'other'] as const

export const training = {
  userId: zid('users'),
  type: z.enum(TRAINING_TYPES),
  name: z.string(),
  institution: z.string().optional(),
  year: z.number().optional(),
  degree: z.string().optional(),
  orderIndex: z.number() // For maintaining order
}

export const zTraining = z.object(training)

export const Training = Table('training', zodToConvexFields(training))

export type TrainingDoc = Doc<'training'>
