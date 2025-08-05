import { zid, zodToConvexFields } from 'convex-helpers/server/zod'
import { Table } from 'convex-helpers/server'
import { z } from 'zod'
import { Doc } from '../_generated/dataModel'

export const experiencesMusicVideos = {
  userId: zid('users'),
  private: z.boolean().optional(),
  songTitle: z.string(),
  artists: z.array(z.string()),
  startDate: z.string(),
  duration: z.string(),
  link: z.string().optional(),
  media: z.union([zid('_storage'), z.string()]).optional(),
  roles: z.array(z.string()),
  mainTalent: z.array(z.string()).optional(),
  choreographers: z.array(z.string()).optional(),
  associateChoreographers: z.array(z.string()).optional()
}

export const zExperiencesMusicVideos = z.object(experiencesMusicVideos)

export const ExperiencesMusicVideos = Table('experiencesMusicVideos', zodToConvexFields(experiencesMusicVideos))

export type ExperienceMusicVideoDoc = Doc<'experiencesMusicVideos'>