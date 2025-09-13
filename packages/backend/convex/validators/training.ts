import { zid } from 'convex-helpers/server/zodV4'
import { zodToConvexFields } from '@packages/zodvex'
import { Table } from 'convex-helpers/server'
import { z } from 'zod'
import { Doc } from '../_generated/dataModel'

export const TRAINING_TYPES = [
  'education',
  'dance-school',
  'programs-intensives',
  'scholarships',
  'other'
] as const

// Frontend-facing fields (what users can edit)
export const trainingInput = {
  type: z.enum(TRAINING_TYPES),
  institution: z.string().optional(),
  instructors: z.array(z.string()).optional(),
  startYear: z.number().optional(),
  endYear: z.number().optional(),
  degree: z.string().optional()
}

// Full training schema with backend-managed fields
export const training = {
  ...trainingInput,
  userId: zid('users'),
  orderIndex: z.number() // For maintaining order
}

export const zTrainingInput = z.object(trainingInput)
export const zTraining = z.object(training)

// Frontend form schema (just the editable fields with system fields)
export const zTrainingFormDoc = zTrainingInput.extend({
  _id: zid('training').optional(),
  _creationTime: z.number().optional()
})

// Full document schema with all fields
export const zTrainingDoc = zTraining.extend({
  _id: zid('training'),
  _creationTime: z.number()
})

export const Training = Table('training', zodToConvexFields(training))

// This is the full document type from the database
export type TrainingDoc = Doc<'training'>

// This is what the frontend receives (without backend-managed fields)
export type TrainingFormDoc = z.infer<typeof zTrainingFormDoc>
