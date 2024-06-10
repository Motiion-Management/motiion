import { zid, zodToConvexFields } from 'convex-helpers/server/zod'
import { Table } from 'convex-helpers/server'
import { z } from 'zod'
import { zVisibility } from './base'

export const experiences = {
  userId: zid('users'),
  visibility: zVisibility,
  title: z.string(),
  role: z.array(z.string()),
  credits: z.array(z.string()),
  year: z.number().optional(),
  link: z.string().optional(),
  media: z.union([zid('_storage'), z.string()]).optional()
}

export const zExperiences = z.object(experiences)

export const Experiences = Table('experiences', zodToConvexFields(experiences))
