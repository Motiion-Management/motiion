import { zid, zodToConvexFields } from 'convex-helpers/server/zod'
import { Table } from 'convex-helpers/server'
import { z } from 'zod'

const EXPERIENCE_TYPES = [
  'television-and-film',
  'music-videos',
  'live-performances',
  'commercials',
  'training'
] as const

export const experiences = {
  userId: zid('users'),
  public: z.boolean().optional(),
  type: z.enum(EXPERIENCE_TYPES),
  title: z.string(),
  role: z.array(z.string()),
  credits: z.array(z.string()),
  startYear: z.number().optional(),
  endYear: z.number().optional(),
  link: z.string().optional(),
  media: z.union([zid('_storage'), z.string()]).optional()
}

export const zExperiences = z.object(experiences)

export const Experiences = Table('experiences', zodToConvexFields(experiences))
