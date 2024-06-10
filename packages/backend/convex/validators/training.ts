import { zid, zodToConvexFields } from 'convex-helpers/server/zod'
import { Table } from 'convex-helpers/server'
import { z } from 'zod'
import { zVisibility } from './base'

export const training = {
  userId: zid('users'),
  visibility: zVisibility,
  title: z.string(),
  role: z.array(z.string()),
  references: z.array(z.string()),
  startYear: z.number().optional(),
  endYear: z.number().optional(),
  link: z.string().optional()
}

export const zTraining = z.object(training)

export const Training = Table('training', zodToConvexFields(training))
