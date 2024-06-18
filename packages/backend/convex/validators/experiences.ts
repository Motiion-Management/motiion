import { zid, zodToConvexFields } from 'convex-helpers/server/zod'
import { Table } from 'convex-helpers/server'
import { z } from 'zod'
import { Doc } from '../_generated/dataModel'

export const EXPERIENCE_TYPES = [
  'television-film',
  'music-videos',
  'live-performances',
  'commercials',
  'training-education'
] as const

export const EXPERIENCE_TITLE_MAP = {
  'television-film': 'Television & Film',
  'music-videos': 'Music Videos',
  'live-performances': 'Live Performances',
  commercials: 'Commercials',
  'training-education': 'Training & Education'
} as const

export const experiences = {
  userId: zid('users'),
  private: z.boolean().optional(),
  type: z.enum(EXPERIENCE_TYPES),
  title: z.string(),
  role: z.array(z.string()),
  credits: z.array(z.string()).optional(),
  startYear: z.coerce.number(),
  endYear: z.coerce.number().optional(),
  link: z.string().optional(),
  media: z.union([zid('_storage'), z.string()]).optional()
}

export const zExperiences = z.object(experiences)

export const Experiences = Table('experiences', zodToConvexFields(experiences))

export type ExperienceDoc = Doc<'experiences'>
